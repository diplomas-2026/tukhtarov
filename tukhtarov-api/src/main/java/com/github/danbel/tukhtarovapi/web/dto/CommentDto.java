package com.github.danbel.tukhtarovapi.web.dto;

import java.time.LocalDateTime;

public record CommentDto(
        Long id,
        String authorName,
        String authorRole,
        String message,
        boolean visibleToClient,
        LocalDateTime createdAt
) {
}
