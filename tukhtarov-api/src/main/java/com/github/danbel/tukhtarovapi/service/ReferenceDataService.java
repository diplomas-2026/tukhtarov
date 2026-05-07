package com.github.danbel.tukhtarovapi.service;

import com.github.danbel.tukhtarovapi.domain.enumtype.OrderPriority;
import com.github.danbel.tukhtarovapi.domain.enumtype.OrderStatus;
import com.github.danbel.tukhtarovapi.domain.enumtype.UserRole;
import com.github.danbel.tukhtarovapi.domain.entity.AppUser;
import com.github.danbel.tukhtarovapi.domain.entity.ClientCompany;
import com.github.danbel.tukhtarovapi.repository.AppUserRepository;
import com.github.danbel.tukhtarovapi.repository.ClientCompanyRepository;
import com.github.danbel.tukhtarovapi.repository.ProductionOrderRepository;
import com.github.danbel.tukhtarovapi.security.AuthenticatedUser;
import com.github.danbel.tukhtarovapi.web.dto.CreateClientRequest;
import com.github.danbel.tukhtarovapi.web.dto.CreateUserRequest;
import com.github.danbel.tukhtarovapi.web.dto.ClientDto;
import com.github.danbel.tukhtarovapi.web.dto.KeyValueDto;
import com.github.danbel.tukhtarovapi.web.dto.PriorityDto;
import com.github.danbel.tukhtarovapi.web.dto.RoleDto;
import com.github.danbel.tukhtarovapi.web.dto.UpdateClientRequest;
import com.github.danbel.tukhtarovapi.web.dto.UpdateUserRequest;
import com.github.danbel.tukhtarovapi.web.dto.UserDto;
import com.github.danbel.tukhtarovapi.web.mapper.ApiMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
@RequiredArgsConstructor
public class ReferenceDataService {

    private final AppUserRepository appUserRepository;
    private final ClientCompanyRepository clientCompanyRepository;
    private final ProductionOrderRepository productionOrderRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<RoleDto> roles() {
        return List.of(UserRole.values()).stream().map(ApiMapper::toRoleDto).toList();
    }

    @Transactional(readOnly = true)
    public List<KeyValueDto> statuses() {
        return List.of(OrderStatus.values()).stream().map(ApiMapper::toKeyValueDto).toList();
    }

    @Transactional(readOnly = true)
    public List<PriorityDto> priorities() {
        return List.of(OrderPriority.values()).stream().map(ApiMapper::toPriorityDto).toList();
    }

    @Transactional(readOnly = true)
    public List<UserDto> users() {
        return users(null);
    }

    @Transactional(readOnly = true)
    public List<UserDto> users(AuthenticatedUser currentUser) {
        ensureAdminOrManager(currentUser);
        return appUserRepository.findAll()
                .stream()
                .map(ApiMapper::toUserDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClientDto> clients() {
        return clients(null);
    }

    @Transactional(readOnly = true)
    public List<ClientDto> clients(AuthenticatedUser currentUser) {
        ensureAdminOrManager(currentUser);
        return clientCompanyRepository.findAll()
                .stream()
                .map(client -> ApiMapper.toClientDto(client, productionOrderRepository.findByClientCompanyIdOrderByCreatedAtDesc(client.getId()).size()))
                .toList();
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        return createUser(request, null);
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request, AuthenticatedUser currentUser) {
        ensureAdmin(currentUser);
        ClientCompany clientCompany = request.clientCompanyId() == null
                ? null
                : clientCompanyRepository.findById(request.clientCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("Клиентская компания не найдена"));

        AppUser user = appUserRepository.save(AppUser.builder()
                .login(request.login())
                .fullName(request.fullName())
                .email(request.email())
                .phone(request.phone())
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .active(request.active())
                .clientCompany(clientCompany)
                .build());
        return ApiMapper.toUserDto(user);
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
        return updateUser(id, request, null);
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request, AuthenticatedUser currentUser) {
        ensureAdmin(currentUser);
        AppUser user = appUserRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
        if (request.login() != null) {
            user.setLogin(request.login());
        }
        if (request.fullName() != null) {
            user.setFullName(request.fullName());
        }
        if (request.email() != null) {
            user.setEmail(request.email());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        if (request.password() != null && !request.password().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.password()));
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.active() != null) {
            user.setActive(request.active());
        }
        if (request.clientCompanyId() != null) {
            user.setClientCompany(clientCompanyRepository.findById(request.clientCompanyId())
                    .orElseThrow(() -> new IllegalArgumentException("Клиентская компания не найдена")));
        }
        return ApiMapper.toUserDto(appUserRepository.save(user));
    }

    @Transactional
    public ClientDto createClient(CreateClientRequest request) {
        return createClient(request, null);
    }

    @Transactional
    public ClientDto createClient(CreateClientRequest request, AuthenticatedUser currentUser) {
        ensureAdmin(currentUser);
        ClientCompany company = clientCompanyRepository.save(ClientCompany.builder()
                .name(request.name())
                .inn(request.inn())
                .contactPerson(request.contactPerson())
                .phone(request.phone())
                .email(request.email())
                .city(request.city())
                .build());
        return ApiMapper.toClientDto(company, 0);
    }

    @Transactional
    public ClientDto updateClient(Long id, UpdateClientRequest request) {
        return updateClient(id, request, null);
    }

    @Transactional
    public ClientDto updateClient(Long id, UpdateClientRequest request, AuthenticatedUser currentUser) {
        ensureAdmin(currentUser);
        ClientCompany company = clientCompanyRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Клиент не найден"));
        if (request.name() != null) {
            company.setName(request.name());
        }
        if (request.inn() != null) {
            company.setInn(request.inn());
        }
        if (request.contactPerson() != null) {
            company.setContactPerson(request.contactPerson());
        }
        if (request.phone() != null) {
            company.setPhone(request.phone());
        }
        if (request.email() != null) {
            company.setEmail(request.email());
        }
        if (request.city() != null) {
            company.setCity(request.city());
        }
        return ApiMapper.toClientDto(clientCompanyRepository.save(company), productionOrderRepository.findByClientCompanyIdOrderByCreatedAtDesc(id).size());
    }

    private void ensureAdmin(AuthenticatedUser currentUser) {
        if (currentUser != null && currentUser.role() != UserRole.ADMIN) {
            throw new org.springframework.security.access.AccessDeniedException("Только администратор может выполнять это действие");
        }
    }

    private void ensureAdminOrManager(AuthenticatedUser currentUser) {
        if (currentUser != null && currentUser.role() != UserRole.ADMIN && currentUser.role() != UserRole.MANAGER) {
            throw new org.springframework.security.access.AccessDeniedException("Недостаточно прав для просмотра данных");
        }
    }
}
