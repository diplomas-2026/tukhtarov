package com.github.danbel.tukhtarovapi.service;

import com.github.danbel.tukhtarovapi.domain.entity.AppUser;
import com.github.danbel.tukhtarovapi.domain.entity.ClientCompany;
import com.github.danbel.tukhtarovapi.domain.entity.OrderComment;
import com.github.danbel.tukhtarovapi.domain.entity.OrderStatusHistory;
import com.github.danbel.tukhtarovapi.domain.entity.ProductionOrder;
import com.github.danbel.tukhtarovapi.domain.enumtype.OrderPriority;
import com.github.danbel.tukhtarovapi.domain.enumtype.OrderStatus;
import com.github.danbel.tukhtarovapi.domain.enumtype.UserRole;
import com.github.danbel.tukhtarovapi.repository.AppUserRepository;
import com.github.danbel.tukhtarovapi.repository.ClientCompanyRepository;
import com.github.danbel.tukhtarovapi.repository.OrderCommentRepository;
import com.github.danbel.tukhtarovapi.repository.OrderStatusHistoryRepository;
import com.github.danbel.tukhtarovapi.repository.ProductionOrderRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class BootstrapService implements CommandLineRunner {

    private final ClientCompanyRepository clientCompanyRepository;
    private final AppUserRepository appUserRepository;
    private final ProductionOrderRepository productionOrderRepository;
    private final OrderCommentRepository orderCommentRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (clientCompanyRepository.count() > 0 || appUserRepository.count() > 0 || productionOrderRepository.count() > 0) {
            return;
        }

        ClientCompany metallInvest = clientCompanyRepository.save(ClientCompany.builder()
                .name("ООО \"МеталлИнвест\"")
                .inn("6601001001")
                .contactPerson("Иванов Петр Сергеевич")
                .phone("+7 (900) 111-22-33")
                .email("zakaz@metallinvest.ru")
                .city("Екатеринбург")
                .build());

        ClientCompany uralEnergy = clientCompanyRepository.save(ClientCompany.builder()
                .name("ООО \"УралЭнергоПром\"")
                .inn("6601002002")
                .contactPerson("Кузнецова Мария Андреевна")
                .phone("+7 (900) 222-33-44")
                .email("orders@uralenergoprom.ru")
                .city("Нижний Тагил")
                .build());

        AppUser admin = appUserRepository.save(AppUser.builder()
                .login("admin")
                .fullName("Администратор Системы")
                .email("admin@impuls.ru")
                .phone("+7 (900) 000-00-01")
                .role(UserRole.ADMIN)
                .active(true)
                .build());

        AppUser manager = appUserRepository.save(AppUser.builder()
                .login("manager")
                .fullName("Смирнов Алексей")
                .email("manager@impuls.ru")
                .phone("+7 (900) 000-00-02")
                .role(UserRole.MANAGER)
                .active(true)
                .build());

        AppUser executor = appUserRepository.save(AppUser.builder()
                .login("executor")
                .fullName("Орлов Дмитрий")
                .email("executor@impuls.ru")
                .phone("+7 (900) 000-00-03")
                .role(UserRole.EXECUTOR)
                .active(true)
                .build());

        AppUser clientUser = appUserRepository.save(AppUser.builder()
                .login("client")
                .fullName("Клиентский Кабинет")
                .email("client@metallinvest.ru")
                .phone("+7 (900) 000-00-04")
                .role(UserRole.CLIENT)
                .active(true)
                .clientCompany(metallInvest)
                .build());

        ProductionOrder order1 = productionOrderRepository.save(ProductionOrder.builder()
                .orderNumber("IMP-2026-001")
                .title("Рама агрегата для насосной станции")
                .description("Изготовление и сборка рамы по КД заказчика, с мехобработкой и окраской.")
                .status(OrderStatus.IN_REVIEW)
                .priority(OrderPriority.HIGH)
                .createdAt(LocalDate.now().minusDays(10))
                .plannedDate(LocalDate.now().minusDays(2))
                .dueDate(LocalDate.now().minusDays(1))
                .clientCompany(metallInvest)
                .manager(manager)
                .executor(executor)
                .build());

        ProductionOrder order2 = productionOrderRepository.save(ProductionOrder.builder()
                .orderNumber("IMP-2026-002")
                .title("Узел крепления для конвейерной линии")
                .description("Партия узлов крепления с резкой, сваркой и контролем ОТК.")
                .status(OrderStatus.WAITING_MATERIALS)
                .priority(OrderPriority.NORMAL)
                .createdAt(LocalDate.now().minusDays(6))
                .plannedDate(LocalDate.now().plusDays(2))
                .dueDate(LocalDate.now().plusDays(7))
                .clientCompany(uralEnergy)
                .manager(manager)
                .executor(executor)
                .build());

        ProductionOrder order3 = productionOrderRepository.save(ProductionOrder.builder()
                .orderNumber("IMP-2026-003")
                .title("Металлоконструкция для корпуса оборудования")
                .description("Заказ на корпусную металлоконструкцию с термообработкой.")
                .status(OrderStatus.READY_FOR_SHIPMENT)
                .priority(OrderPriority.URGENT)
                .createdAt(LocalDate.now().minusDays(15))
                .plannedDate(LocalDate.now().minusDays(3))
                .dueDate(LocalDate.now().minusDays(2))
                .completedAt(LocalDate.now().minusDays(1))
                .clientCompany(metallInvest)
                .manager(manager)
                .executor(executor)
                .build());

        createHistory(order1, "Создан заказ и передан в проверку ТЗ", OrderStatus.NEW, manager);
        createHistory(order1, "Получены замечания по чертежам", OrderStatus.CLARIFICATION, manager);
        createHistory(order1, "Заказ передан на проверку качества", OrderStatus.IN_REVIEW, executor);

        createHistory(order2, "Согласованы основные параметры", OrderStatus.DESIGN, manager);
        createHistory(order2, "Ожидаем поставку заготовок", OrderStatus.WAITING_MATERIALS, executor);

        createHistory(order3, "Изготовление завершено", OrderStatus.READY_FOR_SHIPMENT, executor);

        createComment(order1, "Менеджер", UserRole.MANAGER, "ТЗ согласовываем с клиентом. Нужна корректировка размеров.", true);
        createComment(order1, "ОТК", UserRole.EXECUTOR, "Замечания сняты, можно повторно передавать на проверку.", true);
        createComment(order2, "Мастер участка", UserRole.EXECUTOR, "Часть материалов еще в пути. Ждем поставку.", false);
        createComment(order3, "Менеджер", UserRole.MANAGER, "Заказ готов к отгрузке, согласуем транспорт.", true);

    }

    private void createHistory(ProductionOrder order, String comment, OrderStatus status, AppUser actor) {
        orderStatusHistoryRepository.save(OrderStatusHistory.builder()
                .order(order)
                .status(status)
                .comment(comment)
                .changedByName(actor.getFullName())
                .changedByRole(actor.getRole())
                .changedAt(LocalDateTime.now().minusHours(12))
                .build());
    }

    private void createComment(ProductionOrder order, String authorName, UserRole role, String message, boolean visibleToClient) {
        orderCommentRepository.save(OrderComment.builder()
                .order(order)
                .authorName(authorName)
                .authorRole(role)
                .message(message)
                .visibleToClient(visibleToClient)
                .createdAt(LocalDateTime.now().minusHours(10))
                .build());
    }
}
