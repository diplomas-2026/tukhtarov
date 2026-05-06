package com.github.danbel.tukhtarovapi.web.dto;

import java.util.List;
import java.util.Map;

public record DashboardDto(
        long totalOrders,
        long activeOrders,
        long overdueOrders,
        long completedOrders,
        Map<String, Long> statusCounts,
        Map<String, Long> priorityCounts,
        List<OrderSummaryDto> recentOrders
) {
}
