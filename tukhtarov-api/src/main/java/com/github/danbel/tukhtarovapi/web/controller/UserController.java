package com.github.danbel.tukhtarovapi.web.controller;

import com.github.danbel.tukhtarovapi.service.ReferenceDataService;
import com.github.danbel.tukhtarovapi.web.dto.CreateUserRequest;
import com.github.danbel.tukhtarovapi.web.dto.UpdateUserRequest;
import com.github.danbel.tukhtarovapi.web.dto.UserDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final ReferenceDataService referenceDataService;

    @GetMapping("/users/list")
    public List<UserDto> users() {
        return referenceDataService.users();
    }

    @PostMapping("/users")
    public UserDto create(@RequestBody CreateUserRequest request) {
        return referenceDataService.createUser(request);
    }

    @PatchMapping("/users/{id}")
    public UserDto update(@PathVariable Long id, @RequestBody UpdateUserRequest request) {
        return referenceDataService.updateUser(id, request);
    }
}
