package com.github.danbel.tukhtarovapi.web.controller;

import com.github.danbel.tukhtarovapi.service.ProductionOrderService;
import com.github.danbel.tukhtarovapi.security.AuthenticatedUser;
import com.github.danbel.tukhtarovapi.web.dto.DashboardDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class DashboardController {

    private final ProductionOrderService productionOrderService;

    @GetMapping("/dashboard")
    public DashboardDto dashboard(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return productionOrderService.getDashboard(currentUser);
    }
}
