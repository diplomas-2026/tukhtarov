package com.github.danbel.tukhtarovapi.web.controller;

import com.github.danbel.tukhtarovapi.security.AuthenticatedUser;
import com.github.danbel.tukhtarovapi.service.SupportChatService;
import com.github.danbel.tukhtarovapi.web.dto.ChatStateDto;
import com.github.danbel.tukhtarovapi.web.dto.CommentDto;
import com.github.danbel.tukhtarovapi.web.dto.CreateCommentRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class SupportChatController {

    private final SupportChatService supportChatService;

    @GetMapping("/support-chat/state")
    public ChatStateDto state(@RequestParam(required = false) Long clientCompanyId,
                              @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return supportChatService.getState(clientCompanyId, currentUser);
    }

    @GetMapping("/support-chat/messages")
    public List<CommentDto> messages(@RequestParam(required = false) Long clientCompanyId,
                                     @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return supportChatService.getMessages(clientCompanyId, currentUser);
    }

    @PostMapping("/support-chat/messages")
    public ChatStateDto send(@RequestParam(required = false) Long clientCompanyId,
                             @Valid @RequestBody CreateCommentRequest request,
                             @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return supportChatService.addMessage(clientCompanyId, request, currentUser);
    }
}
