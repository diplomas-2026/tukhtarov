package com.github.danbel.tukhtarovapi.repository;

import com.github.danbel.tukhtarovapi.domain.entity.ProductionOrder;
import com.github.danbel.tukhtarovapi.domain.enumtype.OrderStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductionOrderRepository extends JpaRepository<ProductionOrder, Long> {

    List<ProductionOrder> findByStatusOrderByDueDateAsc(OrderStatus status);

    List<ProductionOrder> findByExecutorIdOrderByDueDateAsc(Long executorId);

    List<ProductionOrder> findByClientCompanyIdOrderByCreatedAtDesc(Long clientCompanyId);
}
