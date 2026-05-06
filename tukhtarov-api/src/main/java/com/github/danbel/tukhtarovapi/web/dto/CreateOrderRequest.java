package com.github.danbel.tukhtarovapi.web.dto;

import com.github.danbel.tukhtarovapi.domain.enumtype.OrderPriority;
import java.time.LocalDate;

public record CreateOrderRequest(
        String orderNumber,
        String title,
        String description,
        Long clientCompanyId,
        Long managerId,
        Long executorId,
        OrderPriority priority,
        LocalDate plannedDate,
        LocalDate dueDate
) {
}
