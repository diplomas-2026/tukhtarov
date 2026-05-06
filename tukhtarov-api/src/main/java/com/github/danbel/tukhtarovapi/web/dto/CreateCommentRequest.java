package com.github.danbel.tukhtarovapi.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCommentRequest(
        @NotBlank(message = "Текст сообщения не может быть пустым")
        String message
) {
}
