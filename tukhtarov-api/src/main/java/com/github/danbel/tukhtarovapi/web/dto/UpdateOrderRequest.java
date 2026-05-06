package com.github.danbel.tukhtarovapi.web.dto;

import com.github.danbel.tukhtarovapi.domain.enumtype.OrderPriority;
import com.github.danbel.tukhtarovapi.domain.enumtype.OrderStatus;
import java.time.LocalDate;

public record UpdateOrderRequest(
        String title,
        String description,
        Long clientCompanyId,
        Long managerId,
        Long executorId,
        OrderPriority priority,
        OrderStatus status,
        LocalDate plannedDate,
        LocalDate dueDate,
        LocalDate completedAt
) {
}
