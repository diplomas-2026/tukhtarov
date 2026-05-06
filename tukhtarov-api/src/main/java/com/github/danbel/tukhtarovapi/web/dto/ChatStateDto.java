package com.github.danbel.tukhtarovapi.web.dto;

import java.time.LocalDateTime;

public record ChatStateDto(
        Long lastMessageId,
        LocalDateTime lastMessageAt
) {
}
