package com.github.danbel.tukhtarovapi.repository;

import com.github.danbel.tukhtarovapi.domain.entity.SupportChatMessage;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportChatMessageRepository extends JpaRepository<SupportChatMessage, Long> {

    List<SupportChatMessage> findByClientCompanyIdOrderByCreatedAtAsc(Long clientCompanyId);

    Optional<SupportChatMessage> findFirstByClientCompanyIdOrderByCreatedAtDescIdDesc(Long clientCompanyId);
}
