package com.github.danbel.tukhtarovapi.security;

import com.github.danbel.tukhtarovapi.domain.entity.AppUser;
import com.github.danbel.tukhtarovapi.domain.entity.ClientCompany;
import com.github.danbel.tukhtarovapi.domain.enumtype.UserRole;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private final SecretKeySpec secretKey;
    private final Duration ttl;

    public TokenService(
            @Value("${app.auth.secret:change-me-now-change-me-now}") String secret,
            @Value("${app.auth.ttl-hours:24}") long ttlHours
    ) {
        this.secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        this.ttl = Duration.ofHours(ttlHours);
    }

    public String createToken(AppUser user) {
        long expiresAt = Instant.now().plus(ttl).toEpochMilli();
        String payload = encode(user.getId().toString())
                + "." + encode(user.getLogin())
                + "." + encode(user.getFullName())
                + "." + user.getRole().name()
                + "." + encode(clientCompanyId(user))
                + "." + expiresAt;
        return payload + "." + signature(payload);
    }

    public AuthenticatedUser parse(String token) {
        String[] parts = token.split("\\.");
        if (parts.length != 7) {
            throw new IllegalArgumentException("Invalid token");
        }
        String payload = String.join(".", java.util.Arrays.copyOf(parts, 6));
        String expected = signature(payload);
        if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), parts[6].getBytes(StandardCharsets.UTF_8))) {
            throw new IllegalArgumentException("Invalid token signature");
        }
        long expiresAt = Long.parseLong(parts[5]);
        if (Instant.now().toEpochMilli() > expiresAt) {
            throw new IllegalArgumentException("Token expired");
        }
        return new AuthenticatedUser(
                Long.parseLong(decode(parts[0])),
                decode(parts[1]),
                decode(parts[2]),
                UserRole.valueOf(parts[3]),
                decode(parts[4]).isBlank() ? null : Long.parseLong(decode(parts[4]))
        );
    }

    private String clientCompanyId(AppUser user) {
        ClientCompany clientCompany = user.getClientCompany();
        return clientCompany == null ? "" : String.valueOf(clientCompany.getId());
    }

    private String encode(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String decode(String value) {
        return new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8);
    }

    private String signature(String payload) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(secretKey);
            byte[] signature = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signature);
        } catch (NoSuchAlgorithmException | InvalidKeyException exception) {
            throw new IllegalStateException("Unable to sign token", exception);
        }
    }
}
