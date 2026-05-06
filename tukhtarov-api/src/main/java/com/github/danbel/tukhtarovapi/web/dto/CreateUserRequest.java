package com.github.danbel.tukhtarovapi.web.dto;

import com.github.danbel.tukhtarovapi.domain.enumtype.UserRole;

public record CreateUserRequest(
        String login,
        String fullName,
        String email,
        String phone,
        String password,
        UserRole role,
        boolean active,
        Long clientCompanyId
) {
}
