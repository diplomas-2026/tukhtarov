package com.github.danbel.tukhtarovapi.domain.enumtype;

public enum OrderStatus {
    NEW("Новый заказ"),
    CLARIFICATION("На уточнении ТЗ"),
    DESIGN("В проектировании"),
    WAITING_MATERIALS("Ожидает материалов"),
    CUTTING("В резке"),
    MACHINING("В мехобработке"),
    WELDING("В сварке"),
    HEAT_TREATMENT("В термообработке"),
    COATING("В покрытии"),
    ASSEMBLY("В сборке"),
    READY_FOR_CHECK("Готов к проверке"),
    IN_REVIEW("На проверке"),
    READY_FOR_SHIPMENT("Готов к отгрузке"),
    SHIPPED("Отгружен"),
    CLOSED("Закрыт"),
    ON_HOLD("Приостановлен"),
    CANCELLED("Отменён");

    private final String label;

    OrderStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
