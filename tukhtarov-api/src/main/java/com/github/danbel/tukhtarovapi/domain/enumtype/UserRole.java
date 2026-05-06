package com.github.danbel.tukhtarovapi.domain.enumtype;

public enum UserRole {
    ADMIN("Администратор"),
    MANAGER("Менеджер"),
    EXECUTOR("Исполнитель"),
    CLIENT("Клиент");

    private final String label;

    UserRole(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
