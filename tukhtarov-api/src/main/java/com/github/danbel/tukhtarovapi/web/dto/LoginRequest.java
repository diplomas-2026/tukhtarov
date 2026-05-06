package com.github.danbel.tukhtarovapi.web.dto;

public record LoginRequest(
        String login,
        String password
) {
}
