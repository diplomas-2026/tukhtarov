package com.github.danbel.tukhtarovapi.domain.enumtype;

public enum OrderPriority {
    LOW("Низкий"),
    NORMAL("Обычный"),
    HIGH("Высокий"),
    URGENT("Срочный");

    private final String label;

    OrderPriority(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
