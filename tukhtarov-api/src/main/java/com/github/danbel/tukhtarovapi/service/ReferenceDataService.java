package com.github.danbel.tukhtarovapi.service;

import com.github.danbel.tukhtarovapi.domain.enumtype.OrderPriority;
import com.github.danbel.tukhtarovapi.domain.enumtype.OrderStatus;
import com.github.danbel.tukhtarovapi.domain.enumtype.UserRole;
import com.github.danbel.tukhtarovapi.domain.entity.AppUser;
import com.github.danbel.tukhtarovapi.domain.entity.ClientCompany;
import com.github.danbel.tukhtarovapi.repository.AppUserRepository;
import com.github.danbel.tukhtarovapi.repository.ClientCompanyRepository;
import com.github.danbel.tukhtarovapi.repository.ProductionOrderRepository;
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

@Service
@RequiredArgsConstructor
public class ReferenceDataService {

    private final AppUserRepository appUserRepository;
    private final ClientCompanyRepository clientCompanyRepository;
    private final ProductionOrderRepository productionOrderRepository;

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
        return appUserRepository.findAll()
                .stream()
                .map(ApiMapper::toUserDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ClientDto> clients() {
        return clientCompanyRepository.findAll()
                .stream()
                .map(client -> ApiMapper.toClientDto(client, productionOrderRepository.findByClientCompanyIdOrderByCreatedAtDesc(client.getId()).size()))
                .toList();
    }

    @Transactional
    public UserDto createUser(CreateUserRequest request) {
        ClientCompany clientCompany = request.clientCompanyId() == null
                ? null
                : clientCompanyRepository.findById(request.clientCompanyId())
                .orElseThrow(() -> new IllegalArgumentException("Клиентская компания не найдена"));

        AppUser user = appUserRepository.save(AppUser.builder()
                .login(request.login())
                .fullName(request.fullName())
                .email(request.email())
                .phone(request.phone())
                .role(request.role())
                .active(request.active())
                .clientCompany(clientCompany)
                .build());
        return ApiMapper.toUserDto(user);
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request) {
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
}
