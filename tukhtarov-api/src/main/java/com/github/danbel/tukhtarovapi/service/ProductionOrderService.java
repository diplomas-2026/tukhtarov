package com.github.danbel.tukhtarovapi.service;

import com.github.danbel.tukhtarovapi.domain.entity.AppUser;
import com.github.danbel.tukhtarovapi.domain.entity.ClientCompany;
import com.github.danbel.tukhtarovapi.domain.entity.OrderComment;
import com.github.danbel.tukhtarovapi.domain.entity.OrderStatusHistory;
import com.github.danbel.tukhtarovapi.domain.entity.ProductionOrder;
import com.github.danbel.tukhtarovapi.domain.enumtype.OrderStatus;
import com.github.danbel.tukhtarovapi.repository.AppUserRepository;
import com.github.danbel.tukhtarovapi.repository.ClientCompanyRepository;
import com.github.danbel.tukhtarovapi.repository.OrderCommentRepository;
import com.github.danbel.tukhtarovapi.repository.OrderStatusHistoryRepository;
import com.github.danbel.tukhtarovapi.repository.ProductionOrderRepository;
import com.github.danbel.tukhtarovapi.web.dto.ChangeStatusRequest;
import com.github.danbel.tukhtarovapi.web.dto.CommentDto;
import com.github.danbel.tukhtarovapi.web.dto.CreateCommentRequest;
import com.github.danbel.tukhtarovapi.web.dto.CreateOrderRequest;
import com.github.danbel.tukhtarovapi.web.dto.DashboardDto;
import com.github.danbel.tukhtarovapi.web.dto.OrderDetailsDto;
import com.github.danbel.tukhtarovapi.web.dto.OrderSummaryDto;
import com.github.danbel.tukhtarovapi.web.dto.StatusHistoryDto;
import com.github.danbel.tukhtarovapi.web.dto.UpdateOrderRequest;
import com.github.danbel.tukhtarovapi.web.mapper.ApiMapper;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductionOrderService {

    private final ProductionOrderRepository productionOrderRepository;
    private final ClientCompanyRepository clientCompanyRepository;
    private final AppUserRepository appUserRepository;
    private final OrderCommentRepository orderCommentRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Transactional(readOnly = true)
    public List<OrderSummaryDto> findAllSummaries() {
        return ApiMapper.sortSummaries(productionOrderRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryDto> findVisibleOrders(String role, Long userId) {
        if (role == null || userId == null) {
            return findAllSummaries();
        }

        if ("CLIENT".equalsIgnoreCase(role)) {
            return appUserRepository.findById(userId)
                    .map(user -> user.getClientCompany() == null
                            ? List.<ProductionOrder>of()
                            : productionOrderRepository.findByClientCompanyIdOrderByCreatedAtDesc(user.getClientCompany().getId()))
                    .orElse(List.of())
                    .stream()
                    .map(ApiMapper::toSummaryDto)
                    .toList();
        }

        if ("EXECUTOR".equalsIgnoreCase(role)) {
            return productionOrderRepository.findByExecutorIdOrderByDueDateAsc(userId)
                    .stream()
                    .map(ApiMapper::toSummaryDto)
                    .toList();
        }

        return findAllSummaries();
    }

    @Transactional(readOnly = true)
    public OrderDetailsDto getOrder(Long id) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Заказ не найден"));
        List<OrderComment> comments = orderCommentRepository.findByOrderIdOrderByCreatedAtAsc(id);
        List<OrderStatusHistory> history = orderStatusHistoryRepository.findByOrderIdOrderByChangedAtAsc(id);
        return ApiMapper.toDetailsDto(order, comments, history);
    }

    public OrderDetailsDto createOrder(CreateOrderRequest request) {
        ClientCompany clientCompany = clientCompanyRepository.findById(request.clientCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("Клиент не найден"));
        AppUser manager = appUserRepository.findById(request.managerId())
                .orElseThrow(() -> new IllegalArgumentException("Менеджер не найден"));
        AppUser executor = appUserRepository.findById(request.executorId())
                .orElseThrow(() -> new IllegalArgumentException("Исполнитель не найден"));

        ProductionOrder order = productionOrderRepository.save(ProductionOrder.builder()
                .orderNumber(request.orderNumber())
                .title(request.title())
                .description(request.description())
                .clientCompany(clientCompany)
                .manager(manager)
                .executor(executor)
                .priority(request.priority())
                .status(OrderStatus.NEW)
                .createdAt(LocalDate.now())
                .plannedDate(request.plannedDate())
                .dueDate(request.dueDate())
                .build());

        appendHistory(order, OrderStatus.NEW, "Создан новый заказ", manager.getFullName(), manager.getRole().name());
        return getOrder(order.getId());
    }

    public OrderDetailsDto updateOrder(Long id, UpdateOrderRequest request) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Заказ не найден"));

        if (request.title() != null) {
            order.setTitle(request.title());
        }
        if (request.description() != null) {
            order.setDescription(request.description());
        }
        if (request.priority() != null) {
            order.setPriority(request.priority());
        }
        if (request.status() != null) {
            order.setStatus(request.status());
        }
        if (request.plannedDate() != null) {
            order.setPlannedDate(request.plannedDate());
        }
        if (request.dueDate() != null) {
            order.setDueDate(request.dueDate());
        }
        if (request.completedAt() != null) {
            order.setCompletedAt(request.completedAt());
        }
        if (request.clientCompanyId() != null) {
            order.setClientCompany(clientCompanyRepository.findById(request.clientCompanyId())
                    .orElseThrow(() -> new IllegalArgumentException("Клиент не найден")));
        }
        if (request.managerId() != null) {
            order.setManager(appUserRepository.findById(request.managerId())
                    .orElseThrow(() -> new IllegalArgumentException("Менеджер не найден")));
        }
        if (request.executorId() != null) {
            order.setExecutor(appUserRepository.findById(request.executorId())
                    .orElseThrow(() -> new IllegalArgumentException("Исполнитель не найден")));
        }
        productionOrderRepository.save(order);
        return getOrder(id);
    }

    public OrderDetailsDto changeStatus(Long id, ChangeStatusRequest request) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Заказ не найден"));
        order.setStatus(request.status());
        if (request.status() == OrderStatus.CLOSED || request.status() == OrderStatus.SHIPPED) {
            order.setCompletedAt(LocalDate.now());
        }
        productionOrderRepository.save(order);
        appendHistory(order, request.status(), request.comment(), request.changedByName(), request.changedByRole().name());
        return getOrder(id);
    }

    public OrderDetailsDto addComment(Long id, CreateCommentRequest request) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Заказ не найден"));
        orderCommentRepository.save(OrderComment.builder()
                .order(order)
                .authorName(request.authorName())
                .authorRole(request.authorRole())
                .message(request.message())
                .visibleToClient(request.visibleToClient())
                .createdAt(LocalDateTime.now())
                .build());
        return getOrder(id);
    }

    @Transactional(readOnly = true)
    public List<CommentDto> getComments(Long id) {
        return orderCommentRepository.findByOrderIdOrderByCreatedAtAsc(id)
                .stream()
                .map(ApiMapper::toCommentDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StatusHistoryDto> getHistory(Long id) {
        return orderStatusHistoryRepository.findByOrderIdOrderByChangedAtAsc(id)
                .stream()
                .map(ApiMapper::toHistoryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public DashboardDto getDashboard(String role, Long userId) {
        List<ProductionOrder> orders = productionOrderRepository.findAll();
        if ("CLIENT".equalsIgnoreCase(role) && userId != null) {
            orders = appUserRepository.findById(userId)
                    .map(user -> user.getClientCompany() == null ? List.<ProductionOrder>of()
                            : productionOrderRepository.findByClientCompanyIdOrderByCreatedAtDesc(user.getClientCompany().getId()))
                    .orElse(List.of());
        } else if ("EXECUTOR".equalsIgnoreCase(role) && userId != null) {
            orders = productionOrderRepository.findByExecutorIdOrderByDueDateAsc(userId);
        }

        long total = orders.size();
        long active = orders.stream().filter(order -> !List.of(OrderStatus.CLOSED, OrderStatus.CANCELLED, OrderStatus.SHIPPED).contains(order.getStatus())).count();
        long overdue = orders.stream().filter(ApiMapper::isOverdue).count();
        long completed = orders.stream().filter(order -> List.of(OrderStatus.CLOSED, OrderStatus.SHIPPED).contains(order.getStatus())).count();

        Map<String, Long> statusCounts = orders.stream()
                .collect(java.util.stream.Collectors.groupingBy(order -> order.getStatus().getLabel(), LinkedHashMap::new, java.util.stream.Collectors.counting()));
        Map<String, Long> priorityCounts = orders.stream()
                .collect(java.util.stream.Collectors.groupingBy(order -> order.getPriority().getLabel(), LinkedHashMap::new, java.util.stream.Collectors.counting()));

        List<OrderSummaryDto> recentOrders = orders.stream()
                .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
                .limit(4)
                .map(ApiMapper::toSummaryDto)
                .toList();

        return new DashboardDto(total, active, overdue, completed, statusCounts, priorityCounts, recentOrders);
    }

    private void appendHistory(ProductionOrder order, OrderStatus status, String comment, String changedByName, String changedByRole) {
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(order)
                .status(status)
                .comment(comment == null ? "" : comment)
                .changedByName(changedByName == null ? "Система" : changedByName)
                .changedByRole(com.github.danbel.tukhtarovapi.domain.enumtype.UserRole.valueOf(changedByRole))
                .changedAt(LocalDateTime.now())
                .build());
    }
}
