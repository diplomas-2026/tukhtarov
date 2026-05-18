const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, '..', 'artifacts', 'screenshots');

const users = {
  admin: {
    id: 1,
    login: 'admin',
    password: 'admin123',
    fullName: 'Администратор Системы',
    email: 'admin@impuls.ru',
    phone: '+7 (900) 000-00-01',
    role: 'ADMIN',
    roleLabel: 'Администратор',
    active: true,
    clientCompanyId: null,
    clientCompanyName: null,
  },
  manager: {
    id: 2,
    login: 'manager',
    password: 'manager123',
    fullName: 'Смирнов Алексей',
    email: 'manager@impuls.ru',
    phone: '+7 (900) 000-00-02',
    role: 'MANAGER',
    roleLabel: 'Менеджер',
    active: true,
    clientCompanyId: null,
    clientCompanyName: null,
  },
  executor: {
    id: 3,
    login: 'executor',
    password: 'executor123',
    fullName: 'Орлов Дмитрий',
    email: 'executor@impuls.ru',
    phone: '+7 (900) 000-00-03',
    role: 'EXECUTOR',
    roleLabel: 'Исполнитель',
    active: true,
    clientCompanyId: null,
    clientCompanyName: null,
  },
  client: {
    id: 4,
    login: 'client',
    password: 'client123',
    fullName: 'Клиентский Кабинет',
    email: 'client@metallinvest.ru',
    phone: '+7 (900) 000-00-04',
    role: 'CLIENT',
    roleLabel: 'Клиент',
    active: true,
    clientCompanyId: 1,
    clientCompanyName: 'ООО "МеталлИнвест"',
  },
};

const clients = [
  {
    id: 1,
    name: 'ООО "МеталлИнвест"',
    inn: '6601001001',
    contactPerson: 'Иванов Петр Сергеевич',
    phone: '+7 (900) 111-22-33',
    email: 'zakaz@metallinvest.ru',
    city: 'Екатеринбург',
    orderCount: 3,
  },
  {
    id: 2,
    name: 'ООО "УралЭнергоПром"',
    inn: '6601002002',
    contactPerson: 'Кузнецова Мария Андреевна',
    phone: '+7 (900) 222-33-44',
    email: 'orders@uralenergoprom.ru',
    city: 'Нижний Тагил',
    orderCount: 3,
  },
];

const statuses = [
  ['NEW', 'Новый'],
  ['CLARIFICATION', 'Уточнение'],
  ['DESIGN', 'Проектирование'],
  ['WAITING_MATERIALS', 'Ожидает материалов'],
  ['CUTTING', 'В резке'],
  ['MACHINING', 'Мехобработка'],
  ['WELDING', 'Сварка'],
  ['HEAT_TREATMENT', 'Термообработка'],
  ['COATING', 'Покрытие'],
  ['ASSEMBLY', 'Сборка'],
  ['READY_FOR_CHECK', 'Готов к проверке'],
  ['IN_REVIEW', 'На проверке'],
  ['READY_FOR_SHIPMENT', 'Готов к отгрузке'],
  ['SHIPPED', 'Отгружен'],
  ['CLOSED', 'Закрыт'],
  ['ON_HOLD', 'Приостановлен'],
  ['CANCELLED', 'Отменён'],
].map(([value, label]) => ({ value, label }));

const priorities = [
  { value: 'LOW', label: 'Низкий' },
  { value: 'NORMAL', label: 'Обычный' },
  { value: 'HIGH', label: 'Высокий' },
  { value: 'URGENT', label: 'Срочный' },
];

const roles = [
  { value: 'ADMIN', label: 'Администратор' },
  { value: 'MANAGER', label: 'Менеджер' },
  { value: 'EXECUTOR', label: 'Исполнитель' },
  { value: 'CLIENT', label: 'Клиент' },
];

const orders = [
  orderSummary(1, 'IMP-2026-001', 'Рама агрегата для насосной станции', 'IN_REVIEW', 'HIGH', 1, '2026-05-08', '2026-05-16', '2026-05-17', true),
  orderSummary(2, 'IMP-2026-002', 'Узел крепления для конвейерной линии', 'WAITING_MATERIALS', 'NORMAL', 2, '2026-05-12', '2026-05-20', '2026-05-25', false),
  orderSummary(3, 'IMP-2026-003', 'Металлоконструкция для корпуса оборудования', 'READY_FOR_SHIPMENT', 'URGENT', 1, '2026-05-03', '2026-05-15', '2026-05-16', false),
  orderSummary(4, 'IMP-2026-004', 'Кронштейн для технологической линии', 'CUTTING', 'HIGH', 2, '2026-05-14', '2026-05-19', '2026-05-23', false),
  orderSummary(5, 'IMP-2026-005', 'Корпус узла дозирования', 'ON_HOLD', 'NORMAL', 1, '2026-05-16', '2026-05-22', '2026-05-24', false),
  orderSummary(6, 'IMP-2026-006', 'Опорная металлоконструкция', 'CLOSED', 'LOW', 2, '2026-04-28', '2026-05-06', '2026-05-08', false),
];

const orderMessages = [
  {
    id: 1,
    authorName: 'Смирнов Алексей',
    authorRole: 'MANAGER',
    message: 'ТЗ согласовываем с клиентом. Нужна корректировка размеров.',
    visibleToClient: true,
    createdAt: '2026-05-17T10:00:00',
  },
  {
    id: 2,
    authorName: 'Орлов Дмитрий',
    authorRole: 'EXECUTOR',
    message: 'Замечания сняты, можно повторно передавать на проверку.',
    visibleToClient: true,
    createdAt: '2026-05-17T12:30:00',
  },
];

const supportMessages = [
  {
    id: 1,
    authorName: 'Клиентский Кабинет',
    authorRole: 'CLIENT',
    message: 'Здравствуйте. Нужно изготовить новую партию корпусов по чертежам.',
    visibleToClient: true,
    createdAt: '2026-05-18T09:10:00',
  },
  {
    id: 2,
    authorName: 'Смирнов Алексей',
    authorRole: 'MANAGER',
    message: 'Здравствуйте. Пришлите, пожалуйста, чертежи и желаемый срок поставки.',
    visibleToClient: true,
    createdAt: '2026-05-18T09:18:00',
  },
];

function orderSummary(id, orderNumber, title, status, priority, clientCompanyId, createdAt, plannedDate, dueDate, overdue) {
  const client = clients.find((item) => item.id === clientCompanyId);
  return {
    id,
    orderNumber,
    title,
    status,
    statusLabel: labelFor(statuses, status),
    priority,
    priorityLabel: labelFor(priorities, priority),
    clientCompanyId,
    clientName: client.name,
    managerName: users.manager.fullName,
    executorName: users.executor.fullName,
    createdAt,
    plannedDate,
    dueDate,
    overdue,
  };
}

function orderDetails(id) {
  const summary = orders.find((item) => item.id === Number(id)) || orders[0];
  const client = clients.find((item) => item.id === summary.clientCompanyId);
  return {
    ...summary,
    description: 'Изготовление и сопровождение заказа по техническому заданию клиента. Контроль сроков, статусов и общения ведется в одной карточке.',
    completedAt: summary.status === 'CLOSED' ? '2026-05-10' : null,
    clientCompany: client,
    manager: users.manager,
    executor: users.executor,
    comments: orderMessages,
    history: [
      {
        id: 1,
        status: 'NEW',
        statusLabel: 'Новый',
        comment: 'Создан заказ',
        changedByName: users.manager.fullName,
        changedByRole: 'MANAGER',
        changedAt: '2026-05-16T09:00:00',
      },
      {
        id: 2,
        status: summary.status,
        statusLabel: summary.statusLabel,
        comment: 'Заказ переведен на текущий этап',
        changedByName: users.executor.fullName,
        changedByRole: 'EXECUTOR',
        changedAt: '2026-05-17T12:20:00',
      },
    ],
  };
}

function labelFor(list, value) {
  return list.find((item) => item.value === value)?.label || value;
}

function dashboardFor(role) {
  const visibleOrders = visibleOrdersFor(role);
  return {
    totalOrders: visibleOrders.length,
    activeOrders: visibleOrders.filter((order) => !['CLOSED', 'CANCELLED', 'SHIPPED'].includes(order.status)).length,
    overdueOrders: visibleOrders.filter((order) => order.overdue).length,
    completedOrders: visibleOrders.filter((order) => ['CLOSED', 'SHIPPED'].includes(order.status)).length,
    statusCounts: countBy(visibleOrders, 'statusLabel'),
    priorityCounts: countBy(visibleOrders, 'priorityLabel'),
    recentOrders: visibleOrders.slice(0, 4),
  };
}

function countBy(list, field) {
  return list.reduce((result, item) => {
    result[item[field]] = (result[item[field]] || 0) + 1;
    return result;
  }, {});
}

function visibleOrdersFor(role) {
  if (role === 'CLIENT') {
    return orders.filter((order) => order.clientCompanyId === users.client.clientCompanyId);
  }
  if (role === 'EXECUTOR') {
    return orders.filter((order) => order.executorName === users.executor.fullName);
  }
  return orders;
}

function currentUserFromRequest(request) {
  const authorization = request.headers().authorization || '';
  const token = authorization.replace('Bearer ', '');
  const role = token.replace('token-', '').toLowerCase();
  return users[role] || users.admin;
}

async function mockApi(page) {
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api/, '') || '/';
    const method = request.method();
    const currentUser = currentUserFromRequest(request);

    if (method === 'POST' && path === '/auth/login') {
      const body = await request.postDataJSON();
      const user = Object.values(users).find((item) => item.login === body.login) || users.admin;
      return json(route, { token: `token-${user.role.toLowerCase()}`, user: withoutPassword(user) });
    }

    if (method === 'POST' && path === '/auth/register') {
      return json(route, { token: 'token-client', user: withoutPassword(users.client) });
    }

    if (method === 'GET' && path === '/auth/me') {
      return json(route, withoutPassword(currentUser));
    }

    if (method === 'GET' && path === '/dashboard') {
      return json(route, dashboardFor(currentUser.role));
    }

    if (method === 'GET' && path === '/orders') {
      return json(route, visibleOrdersFor(currentUser.role));
    }

    const orderMatch = path.match(/^\/orders\/(\d+)$/);
    if (method === 'GET' && orderMatch) {
      return json(route, orderDetails(orderMatch[1]));
    }

    const orderChatMessagesMatch = path.match(/^\/orders\/(\d+)\/chat\/messages$/);
    if (method === 'GET' && orderChatMessagesMatch) {
      return json(route, orderMessages);
    }

    const orderChatStateMatch = path.match(/^\/orders\/(\d+)\/chat\/state$/);
    if (method === 'GET' && orderChatStateMatch) {
      return json(route, { lastMessageId: 2, lastMessageAt: '2026-05-17T12:30:00' });
    }

    if (method === 'GET' && path === '/support-chat/messages') {
      return json(route, supportMessages);
    }

    if (method === 'GET' && path === '/support-chat/state') {
      return json(route, { lastMessageId: 2, lastMessageAt: '2026-05-18T09:18:00' });
    }

    if (method === 'GET' && path === '/users/list') {
      return json(route, Object.values(users).map(withoutPassword));
    }

    if (method === 'GET' && path === '/clients/list') {
      return json(route, clients);
    }

    if (method === 'GET' && path === '/meta/statuses') {
      return json(route, statuses);
    }

    if (method === 'GET' && path === '/meta/priorities') {
      return json(route, priorities);
    }

    if (method === 'GET' && path === '/meta/roles') {
      return json(route, roles);
    }

    return json(route, {}, 204);
  });
}

function withoutPassword(user) {
  const { password, ...rest } = user;
  return rest;
}

function json(route, body, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: status === 204 ? '' : JSON.stringify(body),
  });
}

async function clearScreenshots() {
  fs.rmSync(screenshotsDir, { recursive: true, force: true });
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function save(page, name) {
  await page.screenshot({ path: path.join(screenshotsDir, name), fullPage: true });
}

async function openPublic(page, route) {
  await page.goto(route);
  await page.waitForLoadState('domcontentloaded');
}

async function openAs(page, role, route = '/') {
  await page.goto(route, {
    waitUntil: 'domcontentloaded',
  });
  await page.evaluate(([token]) => {
    localStorage.setItem('tukhtarov_token', token);
  }, [`token-${role.toLowerCase()}`]);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText('ПК «Импульс»').first()).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test('capture public and role screens', async ({ page }) => {
  await clearScreenshots();

  await openPublic(page, '/');
  await expect(page.getByText('ПК «Импульс»').first()).toBeVisible();
  await save(page, '01-public-landing.png');

  await openPublic(page, '/login');
  await expect(page.getByRole('heading', { name: 'Войти в систему' }).first()).toBeVisible();
  await save(page, '02-login.png');

  await openPublic(page, '/register');
  await expect(page.getByRole('heading', { name: 'Регистрация клиента' }).first()).toBeVisible();
  await save(page, '03-register.png');

  await openAs(page, 'admin', '/');
  await expect(page.getByRole('heading', { name: 'Обзор' }).first()).toBeVisible();
  await save(page, '04-admin-dashboard.png');

  await openAs(page, 'admin', '/orders');
  await expect(page.getByRole('heading', { name: 'Заказы' }).first()).toBeVisible();
  await save(page, '05-admin-orders-kanban.png');

  await openAs(page, 'admin', '/orders?ordersView=list');
  await expect(page.getByText('Поиск заказов').first()).toBeVisible();
  await save(page, '06-admin-orders-list.png');

  await openAs(page, 'admin', '/orders/1');
  await expect(page.getByText('IMP-2026-001').first()).toBeVisible();
  await save(page, '07-admin-order-detail.png');

  await openAs(page, 'admin', '/users');
  await expect(page.getByRole('heading', { name: 'Пользователи' }).first()).toBeVisible();
  await save(page, '08-admin-users.png');

  await openAs(page, 'admin', '/users/new');
  await expect(page.getByRole('heading', { name: 'Новый пользователь' }).first()).toBeVisible();
  await save(page, '09-admin-user-create.png');

  await openAs(page, 'admin', '/clients');
  await expect(page.getByRole('heading', { name: 'Клиенты' }).first()).toBeVisible();
  await save(page, '10-admin-clients.png');

  await openAs(page, 'admin', '/clients/1');
  await expect(page.getByText('ООО "МеталлИнвест"').first()).toBeVisible();
  await save(page, '11-admin-client-detail.png');

  await openAs(page, 'admin', '/clients/new');
  await expect(page.getByRole('heading', { name: 'Новый клиент' }).first()).toBeVisible();
  await save(page, '12-admin-client-create.png');

  await openAs(page, 'manager', '/orders');
  await expect(page.getByRole('heading', { name: 'Заказы' }).first()).toBeVisible();
  await save(page, '13-manager-orders-kanban.png');

  await openAs(page, 'manager', '/orders?ordersView=list');
  await expect(page.getByText('Поиск заказов').first()).toBeVisible();
  await save(page, '14-manager-orders-list.png');

  await openAs(page, 'manager', '/create-order?clientId=1');
  await expect(page.getByRole('heading', { name: 'Новый заказ' }).first()).toBeVisible();
  await save(page, '15-manager-order-create.png');

  await openAs(page, 'executor', '/tasks');
  await expect(page.getByRole('heading', { name: 'Мои задачи' }).first()).toBeVisible();
  await save(page, '16-executor-tasks-kanban.png');

  await openAs(page, 'executor', '/orders/4');
  await expect(page.getByText('IMP-2026-004').first()).toBeVisible();
  await save(page, '17-executor-order-detail.png');

  await openAs(page, 'client', '/');
  await expect(page.getByRole('heading', { name: 'Обзор' }).first()).toBeVisible();
  await save(page, '18-client-dashboard.png');

  await openAs(page, 'client', '/orders');
  await expect(page.getByRole('heading', { name: 'Заказы' }).first()).toBeVisible();
  await save(page, '19-client-orders.png');

  await openAs(page, 'client', '/orders/1');
  await expect(page.getByText('IMP-2026-001').first()).toBeVisible();
  await save(page, '20-client-order-detail.png');

  await openAs(page, 'client', '/chat');
  await expect(page.getByRole('heading', { name: 'Чат поддержки' }).first()).toBeVisible();
  await save(page, '21-client-support-chat.png');
});
