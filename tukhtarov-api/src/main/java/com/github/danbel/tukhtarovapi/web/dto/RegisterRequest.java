package com.github.danbel.tukhtarovapi.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
        @NotBlank(message = "Логин обязателен")
        String login,
        @NotBlank(message = "ФИО обязательно")
        String fullName,
        @NotBlank(message = "Email обязателен")
        @Email(message = "Укажите корректный email")
        String email,
        String phone,
        @NotBlank(message = "Пароль обязателен")
        String password,
        @NotBlank(message = "Название компании обязательно")
        String companyName
) {
}
