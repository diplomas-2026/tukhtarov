package com.github.danbel.tukhtarovapi.web.controller;

import com.github.danbel.tukhtarovapi.service.ReferenceDataService;
import com.github.danbel.tukhtarovapi.security.AuthenticatedUser;
import com.github.danbel.tukhtarovapi.web.dto.ClientDto;
import com.github.danbel.tukhtarovapi.web.dto.KeyValueDto;
import com.github.danbel.tukhtarovapi.web.dto.PriorityDto;
import com.github.danbel.tukhtarovapi.web.dto.RoleDto;
import com.github.danbel.tukhtarovapi.web.dto.UserDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class MetaController {

    private final ReferenceDataService referenceDataService;

    @GetMapping("/meta/roles")
    public List<RoleDto> roles() {
        return referenceDataService.roles();
    }

    @GetMapping("/meta/statuses")
    public List<KeyValueDto> statuses() {
        return referenceDataService.statuses();
    }

    @GetMapping("/meta/priorities")
    public List<PriorityDto> priorities() {
        return referenceDataService.priorities();
    }

    @GetMapping("/users")
    public List<UserDto> users(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return referenceDataService.users(currentUser);
    }

    @GetMapping("/clients")
    public List<ClientDto> clients(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return referenceDataService.clients(currentUser);
    }
}
