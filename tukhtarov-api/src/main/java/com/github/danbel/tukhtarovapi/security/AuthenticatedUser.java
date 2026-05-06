package com.github.danbel.tukhtarovapi.security;

import com.github.danbel.tukhtarovapi.domain.enumtype.UserRole;

public record AuthenticatedUser(
        Long id,
        String login,
        String fullName,
        UserRole role,
        Long clientCompanyId
) {
}
