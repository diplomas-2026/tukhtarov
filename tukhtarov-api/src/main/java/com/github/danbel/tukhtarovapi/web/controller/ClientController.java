package com.github.danbel.tukhtarovapi.web.controller;

import com.github.danbel.tukhtarovapi.service.ReferenceDataService;
import com.github.danbel.tukhtarovapi.security.AuthenticatedUser;
import com.github.danbel.tukhtarovapi.web.dto.ClientDto;
import com.github.danbel.tukhtarovapi.web.dto.CreateClientRequest;
import com.github.danbel.tukhtarovapi.web.dto.UpdateClientRequest;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ClientController {

    private final ReferenceDataService referenceDataService;

    @GetMapping("/clients/list")
    public List<ClientDto> clients(@AuthenticationPrincipal AuthenticatedUser currentUser) {
        return referenceDataService.clients(currentUser);
    }

    @PostMapping("/clients")
    public ClientDto create(@RequestBody CreateClientRequest request,
                            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return referenceDataService.createClient(request, currentUser);
    }

    @PatchMapping("/clients/{id}")
    public ClientDto update(@PathVariable Long id,
                            @RequestBody UpdateClientRequest request,
                            @AuthenticationPrincipal AuthenticatedUser currentUser) {
        return referenceDataService.updateClient(id, request, currentUser);
    }
}
