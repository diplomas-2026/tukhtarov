package com.github.danbel.tukhtarovapi.service;

import com.github.danbel.tukhtarovapi.domain.entity.ClientCompany;
import com.github.danbel.tukhtarovapi.domain.entity.OrderComment;
import com.github.danbel.tukhtarovapi.domain.entity.OrderStatusHistory;
import com.github.danbel.tukhtarovapi.domain.entity.ProductionOrder;
import com.github.danbel.tukhtarovapi.domain.enumtype.OrderStatus;
import com.github.danbel.tukhtarovapi.domain.enumtype.UserRole;
import com.github.danbel.tukhtarovapi.repository.AppUserRepository;
import com.github.danbel.tukhtarovapi.repository.ClientCompanyRepository;
import com.github.danbel.tukhtarovapi.repository.OrderCommentRepository;
import com.github.danbel.tukhtarovapi.repository.OrderStatusHistoryRepository;
import com.github.danbel.tukhtarovapi.repository.ProductionOrderRepository;
import com.github.danbel.tukhtarovapi.security.AuthenticatedUser;
import com.github.danbel.tukhtarovapi.web.dto.ChangeStatusRequest;
import com.github.danbel.tukhtarovapi.web.dto.ChatStateDto;
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
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductionOrderService {

    private static final Set<OrderStatus> MANAGER_EDITABLE_STATUSES = Set.of(
            OrderStatus.NEW,
            OrderStatus.CLARIFICATION,
            OrderStatus.DESIGN,
            OrderStatus.WAITING_MATERIALS,
            OrderStatus.IN_REVIEW,
            OrderStatus.READY_FOR_SHIPMENT,
            OrderStatus.SHIPPED,
            OrderStatus.CLOSED,
            OrderStatus.ON_HOLD,
            OrderStatus.CANCELLED
    );

    private static final Set<OrderStatus> EXECUTOR_EDITABLE_STATUSES = Set.of(
            OrderStatus.CUTTING,
            OrderStatus.MACHINING,
            OrderStatus.WELDING,
            OrderStatus.HEAT_TREATMENT,
            OrderStatus.COATING,
            OrderStatus.ASSEMBLY,
            OrderStatus.READY_FOR_CHECK
    );

    private final ProductionOrderRepository productionOrderRepository;
    private final ClientCompanyRepository clientCompanyRepository;
    private final AppUserRepository appUserRepository;
    private final OrderCommentRepository orderCommentRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Transactional(readOnly = true)
    public List<OrderSummaryDto> findVisibleOrders(AuthenticatedUser currentUser) {
        return visibleOrders(currentUser)
                .stream()
                .map(ApiMapper::toSummaryDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderDetailsDto getOrder(Long id, AuthenticatedUser currentUser) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Заказ не найден"));
        ensureAccess(order, currentUser);
        List<OrderComment> comments = orderCommentRepository.findByOrderIdOrderByCreatedAtAsc(id);
        List<OrderStatusHistory> history = orderStatusHistoryRepository.findByOrderIdOrderByChangedAtAsc(id);
        return ApiMapper.toDetailsDto(order, comments, history);
    }

    public OrderDetailsDto createOrder(CreateOrderRequest request, AuthenticatedUser currentUser) {
        ensureCanManageOrders(currentUser);
        if (request.orderNumber() == null || request.orderNumber().isBlank()) {
            throw new IllegalArgumentException("Номер заказа обязателен");
        }
        if (productionOrderRepository.existsByOrderNumberIgnoreCase(request.orderNumber().trim())) {
            throw new IllegalArgumentException("Заказ с таким номером уже существует");
        }
        ClientCompany clientCompany = clientCompanyRepository.findById(request.clientCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("Клиент не найден"));

        var manager = appUserRepository.findById(request.managerId())
                .orElseThrow(() -> new IllegalArgumentException("Менеджер не найден"));
        var executor = appUserRepository.findById(request.executorId())
                .orElseThrow(() -> new IllegalArgumentException("Исполнитель не найден"));

        ProductionOrder order = productionOrderRepository.save(ProductionOrder.builder()
                .orderNumber(request.orderNumber().trim())
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

        appendHistory(order, OrderStatus.NEW, "Создан новый заказ", currentUser);
        return getOrder(order.getId(), currentUser);
    }

    public OrderDetailsDto updateOrder(Long id, UpdateOrderRequest request, AuthenticatedUser currentUser) {
        ensureCanManageOrders(currentUser);
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
        return getOrder(id, currentUser);
    }

    public OrderDetailsDto changeStatus(Long id, ChangeStatusRequest request, AuthenticatedUser currentUser) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Заказ не найден"));
        ensureAccess(order, currentUser);
        ensureRoleCanChangeStatus(currentUser, request.status());
        order.setStatus(request.status());
        if (request.status() == OrderStatus.CLOSED || request.status() == OrderStatus.SHIPPED) {
            order.setCompletedAt(LocalDate.now());
        }
        productionOrderRepository.save(order);
        appendHistory(order, request.status(), request.comment(), currentUser);
        return getOrder(id, currentUser);
    }

    public OrderDetailsDto addChatMessage(Long id, CreateCommentRequest request, AuthenticatedUser currentUser) {
        ProductionOrder order = loadOrderForChat(id, currentUser);
        orderCommentRepository.save(OrderComment.builder()
                .order(order)
                .authorName(currentUser.fullName())
                .authorRole(currentUser.role())
                .message(request.message())
                .visibleToClient(true)
                .createdAt(LocalDateTime.now())
                .build());
        return getOrder(id, currentUser);
    }

    @Transactional(readOnly = true)
    public List<CommentDto> getChatMessages(Long id, AuthenticatedUser currentUser) {
        loadOrderForChat(id, currentUser);
        return orderCommentRepository.findByOrderIdOrderByCreatedAtAsc(id)
                .stream()
                .map(ApiMapper::toCommentDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChatStateDto getChatState(Long id, AuthenticatedUser currentUser) {
        loadOrderForChat(id, currentUser);
        return orderCommentRepository.findFirstByOrderIdOrderByCreatedAtDescIdDesc(id)
                .map(comment -> new ChatStateDto(comment.getId(), comment.getCreatedAt()))
                .orElse(new ChatStateDto(null, null));
    }

    @Transactional(readOnly = true)
    public List<StatusHistoryDto> getHistory(Long id, AuthenticatedUser currentUser) {
        return getOrder(id, currentUser).history();
    }

    @Transactional(readOnly = true)
    public DashboardDto getDashboard(AuthenticatedUser currentUser) {
        List<ProductionOrder> orders = visibleOrders(currentUser);

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

    private List<ProductionOrder> visibleOrders(AuthenticatedUser currentUser) {
        if (currentUser.role() == UserRole.ADMIN || currentUser.role() == UserRole.MANAGER) {
            return productionOrderRepository.findAll();
        }
        if (currentUser.role() == UserRole.EXECUTOR) {
            return productionOrderRepository.findByExecutorIdOrderByDueDateAsc(currentUser.id());
        }
        if (currentUser.role() == UserRole.CLIENT && currentUser.clientCompanyId() != null) {
            return productionOrderRepository.findByClientCompanyIdOrderByCreatedAtDesc(currentUser.clientCompanyId());
        }
        return List.of();
    }

    private void ensureCanManageOrders(AuthenticatedUser currentUser) {
        if (currentUser.role() != UserRole.ADMIN && currentUser.role() != UserRole.MANAGER) {
            throw new AccessDeniedException("Недостаточно прав для изменения заказа");
        }
    }

    private void ensureAccess(ProductionOrder order, AuthenticatedUser currentUser) {
        if (currentUser.role() == UserRole.ADMIN || currentUser.role() == UserRole.MANAGER) {
            return;
        }
        if (currentUser.role() == UserRole.EXECUTOR
                && order.getExecutor() != null
                && order.getExecutor().getId().equals(currentUser.id())) {
            return;
        }
        if (currentUser.role() == UserRole.CLIENT
                && currentUser.clientCompanyId() != null
                && order.getClientCompany() != null
                && order.getClientCompany().getId().equals(currentUser.clientCompanyId())) {
            return;
        }
        throw new AccessDeniedException("Доступ к заказу запрещён");
    }

    private void ensureRoleCanChangeStatus(AuthenticatedUser currentUser, OrderStatus status) {
        if (currentUser.role() == UserRole.ADMIN) {
            return;
        }
        if (currentUser.role() == UserRole.MANAGER && MANAGER_EDITABLE_STATUSES.contains(status)) {
            return;
        }
        if (currentUser.role() == UserRole.EXECUTOR && EXECUTOR_EDITABLE_STATUSES.contains(status)) {
            return;
        }
        throw new AccessDeniedException("Этот статус доступен для изменения другой роли");
    }

    private ProductionOrder loadOrderForChat(Long id, AuthenticatedUser currentUser) {
        ProductionOrder order = productionOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Заказ не найден"));
        if (currentUser.role() == UserRole.ADMIN) {
            return order;
        }
        if (currentUser.role() == UserRole.MANAGER
                && order.getManager() != null
                && order.getManager().getId().equals(currentUser.id())) {
            return order;
        }
        if (currentUser.role() == UserRole.EXECUTOR
                && order.getExecutor() != null
                && order.getExecutor().getId().equals(currentUser.id())) {
            return order;
        }
        if (currentUser.role() == UserRole.CLIENT
                && currentUser.clientCompanyId() != null
                && order.getClientCompany() != null
                && order.getClientCompany().getId().equals(currentUser.clientCompanyId())) {
            return order;
        }
        throw new AccessDeniedException("Чат доступен только администратору, менеджеру заказа, исполнителю и клиенту этого заказа");
    }

    private void appendHistory(ProductionOrder order, OrderStatus status, String comment, AuthenticatedUser currentUser) {
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(order)
                .status(status)
                .comment(comment == null ? "" : comment)
                .changedByName(currentUser.fullName())
                .changedByRole(currentUser.role())
                .changedAt(LocalDateTime.now())
                .build());
    }
}
