package com.github.danbel.tukhtarovapi.web.dto;

import com.github.danbel.tukhtarovapi.domain.enumtype.UserRole;

public record UpdateUserRequest(
        String login,
        String fullName,
        String email,
        String phone,
        String password,
        UserRole role,
        Boolean active,
        Long clientCompanyId
) {
}
