package com.github.danbel.tukhtarovapi.web.dto;

import com.github.danbel.tukhtarovapi.domain.enumtype.UserRole;

public record CreateCommentRequest(
        String authorName,
        UserRole authorRole,
        String message,
        boolean visibleToClient
) {
}
