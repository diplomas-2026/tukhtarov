package com.github.danbel.tukhtarovapi.web.dto;

import java.time.LocalDateTime;

public record StatusHistoryDto(
        Long id,
        String status,
        String statusLabel,
        String comment,
        String changedByName,
        String changedByRole,
        LocalDateTime changedAt
) {
}
