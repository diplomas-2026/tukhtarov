package com.github.danbel.tukhtarovapi.web.controller;

import com.github.danbel.tukhtarovapi.domain.entity.AppUser;
import com.github.danbel.tukhtarovapi.repository.AppUserRepository;
import com.github.danbel.tukhtarovapi.security.AuthenticatedUser;
import com.github.danbel.tukhtarovapi.security.TokenService;
import com.github.danbel.tukhtarovapi.web.dto.AuthResponse;
import com.github.danbel.tukhtarovapi.web.dto.LoginRequest;
import com.github.danbel.tukhtarovapi.web.dto.UserDto;
import com.github.danbel.tukhtarovapi.web.mapper.ApiMapper;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    @PostMapping("/auth/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        AppUser user = appUserRepository.findByLoginIgnoreCaseOrEmailIgnoreCase(request.login(), request.login())
                .orElseThrow(() -> new IllegalArgumentException("Неверный логин или пароль"));
        if (!user.isActive()) {
            throw new IllegalArgumentException("Пользователь отключён");
        }
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Неверный логин или пароль");
        }
        return new AuthResponse(tokenService.createToken(user), ApiMapper.toUserDto(user));
    }

    @GetMapping("/auth/me")
    public UserDto me(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        AppUser user = appUserRepository.findById(currentUser.id())
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        return ApiMapper.toUserDto(user);
    }
}
