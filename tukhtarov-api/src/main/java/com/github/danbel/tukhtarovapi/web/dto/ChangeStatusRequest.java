package com.github.danbel.tukhtarovapi.web.dto;

import com.github.danbel.tukhtarovapi.domain.enumtype.OrderStatus;
import com.github.danbel.tukhtarovapi.domain.enumtype.UserRole;

public record ChangeStatusRequest(
        OrderStatus status,
        String comment,
        String changedByName,
        UserRole changedByRole
) {
}
