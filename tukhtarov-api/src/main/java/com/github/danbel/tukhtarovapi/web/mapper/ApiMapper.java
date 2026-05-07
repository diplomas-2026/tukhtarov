package com.github.danbel.tukhtarovapi.web.mapper;

import com.github.danbel.tukhtarovapi.domain.entity.AppUser;
import com.github.danbel.tukhtarovapi.domain.entity.ClientCompany;
import com.github.danbel.tukhtarovapi.domain.entity.OrderComment;
import com.github.danbel.tukhtarovapi.domain.entity.OrderStatusHistory;
import com.github.danbel.tukhtarovapi.domain.entity.ProductionOrder;
import com.github.danbel.tukhtarovapi.domain.entity.SupportChatMessage;
import com.github.danbel.tukhtarovapi.domain.enumtype.OrderPriority;
import com.github.danbel.tukhtarovapi.domain.enumtype.OrderStatus;
import com.github.danbel.tukhtarovapi.domain.enumtype.UserRole;
import com.github.danbel.tukhtarovapi.web.dto.ClientDto;
import com.github.danbel.tukhtarovapi.web.dto.CommentDto;
import com.github.danbel.tukhtarovapi.web.dto.KeyValueDto;
import com.github.danbel.tukhtarovapi.web.dto.OrderDetailsDto;
import com.github.danbel.tukhtarovapi.web.dto.OrderSummaryDto;
import com.github.danbel.tukhtarovapi.web.dto.PriorityDto;
import com.github.danbel.tukhtarovapi.web.dto.RoleDto;
import com.github.danbel.tukhtarovapi.web.dto.StatusHistoryDto;
import com.github.danbel.tukhtarovapi.web.dto.UserDto;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public final class ApiMapper {

    private ApiMapper() {
    }

    public static UserDto toUserDto(AppUser user) {
        if (user == null) {
            return null;
        }
        ClientCompany clientCompany = user.getClientCompany();
        return new UserDto(
                user.getId(),
                user.getLogin(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole().name(),
                user.getRole().getLabel(),
                user.isActive(),
                clientCompany == null ? null : clientCompany.getId(),
                clientCompany == null ? null : clientCompany.getName()
        );
    }

    public static ClientDto toClientDto(ClientCompany company, long orderCount) {
        return new ClientDto(
                company.getId(),
                company.getName(),
                company.getInn(),
                company.getContactPerson(),
                company.getPhone(),
                company.getEmail(),
                company.getCity(),
                orderCount
        );
    }

    public static OrderSummaryDto toSummaryDto(ProductionOrder order) {
        return new OrderSummaryDto(
                order.getId(),
                order.getOrderNumber(),
                order.getTitle(),
                order.getStatus().name(),
                order.getStatus().getLabel(),
                order.getPriority().name(),
                order.getPriority().getLabel(),
                order.getClientCompany() == null ? null : order.getClientCompany().getId(),
                order.getClientCompany() == null ? null : order.getClientCompany().getName(),
                order.getManager() == null ? null : order.getManager().getFullName(),
                order.getExecutor() == null ? null : order.getExecutor().getFullName(),
                order.getCreatedAt(),
                order.getPlannedDate(),
                order.getDueDate(),
                isOverdue(order)
        );
    }

    public static OrderDetailsDto toDetailsDto(ProductionOrder order,
                                               List<OrderComment> comments,
                                               List<OrderStatusHistory> history) {
        return new OrderDetailsDto(
                order.getId(),
                order.getOrderNumber(),
                order.getTitle(),
                order.getDescription(),
                order.getStatus().name(),
                order.getStatus().getLabel(),
                order.getPriority().name(),
                order.getPriority().getLabel(),
                order.getCreatedAt(),
                order.getPlannedDate(),
                order.getDueDate(),
                order.getCompletedAt(),
                isOverdue(order),
                order.getClientCompany() == null ? null : toClientDto(order.getClientCompany(), 0),
                toUserDto(order.getManager()),
                toUserDto(order.getExecutor()),
                comments.stream().map(ApiMapper::toCommentDto).toList(),
                history.stream().map(ApiMapper::toHistoryDto).toList()
        );
    }

    public static CommentDto toCommentDto(OrderComment comment) {
        return new CommentDto(
                comment.getId(),
                comment.getAuthorName(),
                comment.getAuthorRole().name(),
                comment.getMessage(),
                comment.isVisibleToClient(),
                comment.getCreatedAt()
        );
    }

    public static CommentDto toSupportChatCommentDto(SupportChatMessage message) {
        return new CommentDto(
                message.getId(),
                message.getAuthorName(),
                message.getAuthorRole().name(),
                message.getMessage(),
                true,
                message.getCreatedAt()
        );
    }

    public static StatusHistoryDto toHistoryDto(OrderStatusHistory history) {
        return new StatusHistoryDto(
                history.getId(),
                history.getStatus().name(),
                history.getStatus().getLabel(),
                history.getComment(),
                history.getChangedByName(),
                history.getChangedByRole().name(),
                history.getChangedAt()
        );
    }

    public static KeyValueDto toKeyValueDto(UserRole role) {
        return new KeyValueDto(role.name(), role.getLabel());
    }

    public static KeyValueDto toKeyValueDto(OrderStatus status) {
        return new KeyValueDto(status.name(), status.getLabel());
    }

    public static KeyValueDto toKeyValueDto(OrderPriority priority) {
        return new KeyValueDto(priority.name(), priority.getLabel());
    }

    public static RoleDto toRoleDto(UserRole role) {
        return new RoleDto(role.name(), role.getLabel());
    }

    public static PriorityDto toPriorityDto(OrderPriority priority) {
        return new PriorityDto(priority.name(), priority.getLabel());
    }

    public static Map<String, Long> countByLabel(List<ProductionOrder> orders,
                                                 java.util.function.Function<ProductionOrder, String> extractor) {
        return orders.stream()
                .collect(Collectors.groupingBy(extractor, Collectors.counting()));
    }

    public static boolean isOverdue(ProductionOrder order) {
        return order.getDueDate() != null
                && order.getStatus() != OrderStatus.CLOSED
                && order.getStatus() != OrderStatus.CANCELLED
                && order.getStatus() != OrderStatus.SHIPPED
                && order.getDueDate().isBefore(LocalDate.now());
    }

    public static List<OrderSummaryDto> sortSummaries(List<ProductionOrder> orders) {
        return orders.stream()
                .sorted(Comparator.comparing(ProductionOrder::getCreatedAt).reversed())
                .map(ApiMapper::toSummaryDto)
                .toList();
    }
}
