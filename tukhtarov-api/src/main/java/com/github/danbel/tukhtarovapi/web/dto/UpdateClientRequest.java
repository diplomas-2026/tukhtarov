package com.github.danbel.tukhtarovapi.web.dto;

public record UpdateClientRequest(
        String name,
        String inn,
        String contactPerson,
        String phone,
        String email,
        String city
) {
}
