package com.github.danbel.tukhtarovapi.web.controller;

import com.github.danbel.tukhtarovapi.domain.entity.AppUser;
import com.github.danbel.tukhtarovapi.domain.entity.ClientCompany;
import com.github.danbel.tukhtarovapi.repository.AppUserRepository;
import com.github.danbel.tukhtarovapi.repository.ClientCompanyRepository;
import com.github.danbel.tukhtarovapi.security.AuthenticatedUser;
import com.github.danbel.tukhtarovapi.security.TokenService;
import com.github.danbel.tukhtarovapi.web.dto.AuthResponse;
import com.github.danbel.tukhtarovapi.web.dto.LoginRequest;
import com.github.danbel.tukhtarovapi.web.dto.RegisterRequest;
import com.github.danbel.tukhtarovapi.web.dto.UserDto;
import com.github.danbel.tukhtarovapi.web.mapper.ApiMapper;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AppUserRepository appUserRepository;
    private final ClientCompanyRepository clientCompanyRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @PostMapping("/auth/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        log.info("Login attempt: {}", request.login());
        AppUser user = appUserRepository.findByLoginIgnoreCaseOrEmailIgnoreCase(request.login(), request.login())
                .orElseThrow(() -> new IllegalArgumentException("Неверный логин или пароль"));
        if (!user.isActive()) {
            log.warn("Login rejected, user disabled: {}", request.login());
            throw new IllegalArgumentException("Пользователь отключён");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            log.warn("Login rejected, invalid password: {}", request.login());
            throw new IllegalArgumentException("Неверный логин или пароль");
        }
        log.info("Login successful: {} ({})", user.getLogin(), user.getRole());
        return new AuthResponse(tokenService.createToken(user), ApiMapper.toUserDto(user));
    }

    @PostMapping("/auth/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        String login = request.login().trim();
        String email = request.email().trim();
        if (appUserRepository.existsByLoginIgnoreCase(login)) {
            throw new IllegalArgumentException("Логин уже занят");
        }
        if (appUserRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email уже используется");
        }

        ClientCompany company = clientCompanyRepository.save(ClientCompany.builder()
                .name(request.companyName().trim())
                .contactPerson(request.fullName().trim())
                .phone(request.phone())
                .email(email)
                .build());

        AppUser user = appUserRepository.save(AppUser.builder()
                .login(login)
                .fullName(request.fullName().trim())
                .email(email)
                .phone(request.phone())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(com.github.danbel.tukhtarovapi.domain.enumtype.UserRole.CLIENT)
                .active(true)
                .clientCompany(company)
                .build());

        log.info("Registration successful: {} ({})", user.getLogin(), user.getRole());
        return new AuthResponse(tokenService.createToken(user), ApiMapper.toUserDto(user));
    }

    @GetMapping("/auth/me")
    public UserDto me(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        AppUser user = appUserRepository.findById(currentUser.id())
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        return ApiMapper.toUserDto(user);
    }
}
