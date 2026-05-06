package com.github.danbel.tukhtarovapi.web.dto;

import com.github.danbel.tukhtarovapi.domain.enumtype.UserRole;

public record CreateUserRequest(
        String login,
        String fullName,
        String email,
        String phone,
        UserRole role,
        boolean active,
        Long clientCompanyId
) {
}
