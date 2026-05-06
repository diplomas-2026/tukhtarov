package com.github.danbel.tukhtarovapi.web.dto;

public record UserDto(
        Long id,
        String login,
        String fullName,
        String email,
        String phone,
        String role,
        String roleLabel,
        boolean active,
        Long clientCompanyId,
        String clientCompanyName
) {
}
