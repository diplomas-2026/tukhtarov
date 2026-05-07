package com.github.danbel.tukhtarovapi.web.dto;

import java.time.LocalDate;

public record OrderSummaryDto(
        Long id,
        String orderNumber,
        String title,
        String status,
        String statusLabel,
        String priority,
        String priorityLabel,
        Long clientCompanyId,
        String clientName,
        String managerName,
        String executorName,
        LocalDate createdAt,
        LocalDate plannedDate,
        LocalDate dueDate,
        boolean overdue
) {
}
