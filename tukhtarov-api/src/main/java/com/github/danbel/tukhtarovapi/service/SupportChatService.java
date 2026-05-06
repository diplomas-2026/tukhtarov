package com.github.danbel.tukhtarovapi.service;

import com.github.danbel.tukhtarovapi.domain.entity.ClientCompany;
import com.github.danbel.tukhtarovapi.domain.entity.SupportChatMessage;
import com.github.danbel.tukhtarovapi.domain.enumtype.UserRole;
import com.github.danbel.tukhtarovapi.repository.ClientCompanyRepository;
import com.github.danbel.tukhtarovapi.repository.SupportChatMessageRepository;
import com.github.danbel.tukhtarovapi.security.AuthenticatedUser;
import com.github.danbel.tukhtarovapi.web.dto.ChatStateDto;
import com.github.danbel.tukhtarovapi.web.dto.CommentDto;
import com.github.danbel.tukhtarovapi.web.dto.CreateCommentRequest;
import com.github.danbel.tukhtarovapi.web.mapper.ApiMapper;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SupportChatService {

    private final SupportChatMessageRepository supportChatMessageRepository;
    private final ClientCompanyRepository clientCompanyRepository;

    @Transactional(readOnly = true)
    public List<CommentDto> getMessages(Long clientCompanyId, AuthenticatedUser currentUser) {
        ClientCompany company = resolveCompany(clientCompanyId, currentUser);
        return supportChatMessageRepository.findByClientCompanyIdOrderByCreatedAtAsc(company.getId())
                .stream()
                .map(ApiMapper::toSupportChatCommentDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public ChatStateDto getState(Long clientCompanyId, AuthenticatedUser currentUser) {
        ClientCompany company = resolveCompany(clientCompanyId, currentUser);
        return supportChatMessageRepository.findFirstByClientCompanyIdOrderByCreatedAtDescIdDesc(company.getId())
                .map(message -> new ChatStateDto(message.getId(), message.getCreatedAt()))
                .orElse(new ChatStateDto(null, null));
    }

    public ChatStateDto addMessage(Long clientCompanyId, CreateCommentRequest request, AuthenticatedUser currentUser) {
        ClientCompany company = resolveCompany(clientCompanyId, currentUser);
        supportChatMessageRepository.save(SupportChatMessage.builder()
                .clientCompany(company)
                .authorName(currentUser.fullName())
                .authorRole(currentUser.role())
                .message(request.message())
                .createdAt(LocalDateTime.now())
                .build());
        return getState(company.getId(), currentUser);
    }

    private ClientCompany resolveCompany(Long clientCompanyId, AuthenticatedUser currentUser) {
        if (currentUser.role() == UserRole.CLIENT) {
            if (currentUser.clientCompanyId() == null) {
                throw new AccessDeniedException("Чат поддержки недоступен");
            }
            return clientCompanyRepository.findById(currentUser.clientCompanyId())
                    .orElseThrow(() -> new IllegalArgumentException("Клиент не найден"));
        }
        if (currentUser.role() == UserRole.ADMIN || currentUser.role() == UserRole.MANAGER) {
            if (clientCompanyId == null) {
                throw new IllegalArgumentException("Не выбран клиент");
            }
            return clientCompanyRepository.findById(clientCompanyId)
                    .orElseThrow(() -> new IllegalArgumentException("Клиент не найден"));
        }
        throw new AccessDeniedException("Чат поддержки доступен только администратору, менеджеру и клиенту");
    }
}
