package com.github.danbel.tukhtarovapi.web.dto;

public record AuthResponse(
        String token,
        UserDto user
) {
}
