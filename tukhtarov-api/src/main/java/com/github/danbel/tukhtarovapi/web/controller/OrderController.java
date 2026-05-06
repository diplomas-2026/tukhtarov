package com.github.danbel.tukhtarovapi.web.controller;

import com.github.danbel.tukhtarovapi.service.ProductionOrderService;
import com.github.danbel.tukhtarovapi.web.dto.ChangeStatusRequest;
import com.github.danbel.tukhtarovapi.web.dto.CommentDto;
import com.github.danbel.tukhtarovapi.web.dto.CreateCommentRequest;
import com.github.danbel.tukhtarovapi.web.dto.CreateOrderRequest;
import com.github.danbel.tukhtarovapi.web.dto.OrderDetailsDto;
import com.github.danbel.tukhtarovapi.web.dto.OrderSummaryDto;
import com.github.danbel.tukhtarovapi.web.dto.StatusHistoryDto;
import com.github.danbel.tukhtarovapi.web.dto.UpdateOrderRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final ProductionOrderService productionOrderService;

    @GetMapping("/orders")
    public List<OrderSummaryDto> orders(@RequestParam(required = false) String role,
                                        @RequestParam(required = false) Long userId) {
        return productionOrderService.findVisibleOrders(role, userId);
    }

    @GetMapping("/orders/{id}")
    public OrderDetailsDto order(@PathVariable Long id) {
        return productionOrderService.getOrder(id);
    }

    @PostMapping("/orders")
    public OrderDetailsDto create(@RequestBody CreateOrderRequest request) {
        return productionOrderService.createOrder(request);
    }

    @PatchMapping("/orders/{id}")
    public OrderDetailsDto update(@PathVariable Long id, @RequestBody UpdateOrderRequest request) {
        return productionOrderService.updateOrder(id, request);
    }

    @PatchMapping("/orders/{id}/status")
    public OrderDetailsDto changeStatus(@PathVariable Long id, @RequestBody ChangeStatusRequest request) {
        return productionOrderService.changeStatus(id, request);
    }

    @PostMapping("/orders/{id}/comments")
    public OrderDetailsDto addComment(@PathVariable Long id, @RequestBody CreateCommentRequest request) {
        return productionOrderService.addComment(id, request);
    }

    @GetMapping("/orders/{id}/comments")
    public List<CommentDto> comments(@PathVariable Long id) {
        return productionOrderService.getComments(id);
    }

    @GetMapping("/orders/{id}/history")
    public List<StatusHistoryDto> history(@PathVariable Long id) {
        return productionOrderService.getHistory(id);
    }
}
