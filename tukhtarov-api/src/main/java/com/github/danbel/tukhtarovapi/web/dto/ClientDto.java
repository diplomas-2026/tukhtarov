package com.github.danbel.tukhtarovapi.web.dto;

public record ClientDto(
        Long id,
        String name,
        String inn,
        String contactPerson,
        String phone,
        String email,
        String city,
        long orderCount
) {
}
