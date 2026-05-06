package com.github.danbel.tukhtarovapi.web.dto;

import java.time.LocalDate;
import java.util.List;

public record OrderDetailsDto(
        Long id,
        String orderNumber,
        String title,
        String description,
        String status,
        String statusLabel,
        String priority,
        String priorityLabel,
        LocalDate createdAt,
        LocalDate plannedDate,
        LocalDate dueDate,
        LocalDate completedAt,
        boolean overdue,
        ClientDto clientCompany,
        UserDto manager,
        UserDto executor,
        List<CommentDto> comments,
        List<StatusHistoryDto> history
) {
}
