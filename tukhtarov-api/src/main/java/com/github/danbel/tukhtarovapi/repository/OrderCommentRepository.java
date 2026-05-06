package com.github.danbel.tukhtarovapi.repository;

import com.github.danbel.tukhtarovapi.domain.entity.OrderComment;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderCommentRepository extends JpaRepository<OrderComment, Long> {

    List<OrderComment> findByOrderIdOrderByCreatedAtAsc(Long orderId);
}
