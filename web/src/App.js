import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  CssBaseline,
  Divider,
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import FactoryRoundedIcon from '@mui/icons-material/FactoryRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CommentRoundedIcon from '@mui/icons-material/CommentRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { mockData } from './mockData';
import {
  addOrderComment,
  changeOrderStatus,
  createClient,
  createOrder,
  createUser,
  loadOrderDetails,
  loadWorkspaceData,
} from './api';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0f4c81',
    },
    secondary: {
      main: '#b45309',
    },
    background: {
      default: '#f4efe7',
      paper: '#fffaf3',
    },
  },
  shape: {
    borderRadius: 18,
  },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
    h4: {
      fontWeight: 800,
    },
    h5: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
});

const ROLE_LABELS = {
  ADMIN: 'Администратор',
  MANAGER: 'Менеджер',
  EXECUTOR: 'Исполнитель',
  CLIENT: 'Клиент',
};

const ROLE_TABS = {
  ADMIN: [
    { value: 'dashboard', label: 'Обзор', icon: <DashboardRoundedIcon fontSize="small" /> },
    { value: 'orders', label: 'Заказы', icon: <AssignmentRoundedIcon fontSize="small" /> },
    { value: 'users', label: 'Пользователи', icon: <GroupRoundedIcon fontSize="small" /> },
    { value: 'clients', label: 'Клиенты', icon: <FactoryRoundedIcon fontSize="small" /> },
    { value: 'statuses', label: 'Статусы', icon: <CommentRoundedIcon fontSize="small" /> },
  ],
  MANAGER: [
    { value: 'dashboard', label: 'Обзор', icon: <DashboardRoundedIcon fontSize="small" /> },
    { value: 'orders', label: 'Заказы', icon: <AssignmentRoundedIcon fontSize="small" /> },
    { value: 'create-order', label: 'Новый заказ', icon: <AddRoundedIcon fontSize="small" /> },
    { value: 'clients', label: 'Клиенты', icon: <FactoryRoundedIcon fontSize="small" /> },
  ],
  EXECUTOR: [
    { value: 'dashboard', label: 'Обзор', icon: <DashboardRoundedIcon fontSize="small" /> },
    { value: 'tasks', label: 'Мои задачи', icon: <AssignmentRoundedIcon fontSize="small" /> },
    { value: 'statuses', label: 'Статусы', icon: <CommentRoundedIcon fontSize="small" /> },
  ],
  CLIENT: [
    { value: 'dashboard', label: 'Обзор', icon: <DashboardRoundedIcon fontSize="small" /> },
    { value: 'orders', label: 'Мои заказы', icon: <AssignmentRoundedIcon fontSize="small" /> },
  ],
};

const INTERNAL_STATUSES = new Set([
  'NEW',
  'CLARIFICATION',
  'DESIGN',
  'WAITING_MATERIALS',
  'CUTTING',
  'MACHINING',
  'WELDING',
  'HEAT_TREATMENT',
  'COATING',
  'ASSEMBLY',
  'READY_FOR_CHECK',
  'IN_REVIEW',
  'READY_FOR_SHIPMENT',
  'SHIPPED',
  'CLOSED',
  'ON_HOLD',
  'CANCELLED',
]);

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('ru-RU');
}

function formatDateTime(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
}

function getStatusColor(status) {
  if (['CLOSED', 'SHIPPED', 'READY_FOR_SHIPMENT'].includes(status)) return 'success';
  if (['WAITING_MATERIALS', 'ON_HOLD', 'CLARIFICATION'].includes(status)) return 'warning';
  if (['CANCELLED'].includes(status)) return 'error';
  return 'info';
}

function getPriorityColor(priority) {
  if (priority === 'URGENT') return 'error';
  if (priority === 'HIGH') return 'warning';
  if (priority === 'LOW') return 'default';
  return 'primary';
}

function byRole(users, role) {
  return users.filter((user) => user.role === role);
}

function getAllowedStatuses(role) {
  if (role === 'CLIENT') return [];
  if (role === 'EXECUTOR') {
    return mockData.statuses.filter((status) => INTERNAL_STATUSES.has(status.value) && !['NEW', 'CLARIFICATION'].includes(status.value));
  }
  return mockData.statuses.filter((status) => INTERNAL_STATUSES.has(status.value));
}

function StatCard({ label, value, helper, accent }) {
  return (
    <Card sx={{ height: '100%', border: '1px solid rgba(15, 76, 129, 0.12)', background: 'linear-gradient(180deg, #ffffff 0%, #fff7eb 100%)' }}>
      <CardContent>
        <Typography variant="overline" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ mt: 0.5, color: accent || 'primary.main' }}>
          {value}
        </Typography>
        {helper ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {helper}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SectionCard({ title, subtitle, action, children }) {
  return (
    <Card sx={{ border: '1px solid rgba(15, 76, 129, 0.12)' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6">{title}</Typography>
            {subtitle ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

function App() {
  const [data, setData] = useState(mockData);
  const [orderDetails, setOrderDetails] = useState(mockData.details);
  const [role, setRole] = useState('MANAGER');
  const [viewerId, setViewerId] = useState(2);
  const [tab, setTab] = useState('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState(mockData.orders[0]?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [createOrderForm, setCreateOrderForm] = useState({
    orderNumber: 'IMP-2026-004',
    title: '',
    description: '',
    clientCompanyId: mockData.clients[0]?.id ?? '',
    managerId: mockData.users.find((user) => user.role === 'MANAGER')?.id ?? '',
    executorId: mockData.users.find((user) => user.role === 'EXECUTOR')?.id ?? '',
    priority: 'NORMAL',
    plannedDate: '',
    dueDate: '',
  });
  const [createUserForm, setCreateUserForm] = useState({
    login: '',
    fullName: '',
    email: '',
    phone: '',
    role: 'EXECUTOR',
    active: true,
    clientCompanyId: '',
  });
  const [createClientForm, setCreateClientForm] = useState({
    name: '',
    inn: '',
    contactPerson: '',
    phone: '',
    email: '',
    city: '',
  });
  const [commentForm, setCommentForm] = useState({
    authorName: mockData.users.find((user) => user.id === viewerId)?.fullName ?? '',
    authorRole: role,
    message: '',
    visibleToClient: role === 'CLIENT',
  });
  const [statusForm, setStatusForm] = useState({
    status: mockData.details[mockData.orders[0].id]?.status ?? 'NEW',
    comment: '',
    changedByName: mockData.users.find((user) => user.id === viewerId)?.fullName ?? '',
    changedByRole: role,
  });

  useEffect(() => {
    const availableUsers = byRole(data.users, role);
    if (!availableUsers.length) {
      return;
    }
    const hasSelected = availableUsers.some((user) => user.id === viewerId);
    if (!hasSelected) {
      setViewerId(availableUsers[0].id);
    }
    if (availableUsers.length && !ROLE_TABS[role].some((item) => item.value === tab)) {
      setTab(ROLE_TABS[role][0].value);
    }
  }, [data.users, role, tab, viewerId]);

  useEffect(() => {
    const currentUser = data.users.find((user) => user.id === viewerId);
    setCommentForm((previous) => ({
      ...previous,
      authorName: currentUser?.fullName || previous.authorName,
      authorRole: role,
      visibleToClient: role === 'CLIENT' ? true : previous.visibleToClient,
    }));
    setStatusForm((previous) => ({
      ...previous,
      changedByName: currentUser?.fullName || previous.changedByName,
      changedByRole: role,
    }));
  }, [data.users, role, viewerId]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      try {
        const workspaceData = await loadWorkspaceData(role, viewerId);
        if (!ignore) {
          setData(workspaceData);
        }
      } catch (error) {
        if (!ignore) {
          setSnackbar({
            open: true,
            message: 'Backend сейчас недоступен, показаны демо-данные из фронтенда.',
            severity: 'info',
          });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [role, viewerId]);

  useEffect(() => {
    if (data.orders.length === 0) {
      setSelectedOrderId(null);
      return;
    }
    if (!data.orders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(data.orders[0].id);
    }
  }, [data.orders, selectedOrderId]);

  useEffect(() => {
    if (!selectedOrderId) {
      return;
    }
    const selectedOrder = orderDetails[selectedOrderId];
    if (selectedOrder) {
      setStatusForm((previous) => ({
        ...previous,
        status: selectedOrder.status,
      }));
    }
  }, [orderDetails, selectedOrderId]);

  useEffect(() => {
    if (!selectedOrderId || orderDetails[selectedOrderId]) {
      return;
    }
    let ignore = false;
    loadOrderDetails(selectedOrderId)
      .then((detail) => {
        if (!ignore) {
          setOrderDetails((previous) => ({ ...previous, [selectedOrderId]: detail }));
        }
      })
      .catch(() => {
        // Keep the demo detail if the backend detail endpoint is temporarily unavailable.
      });
    return () => {
      ignore = true;
    };
  }, [orderDetails, selectedOrderId]);

  const visibleUsers = useMemo(() => byRole(data.users, role), [data.users, role]);
  const selectedUser = visibleUsers.find((user) => user.id === viewerId) || visibleUsers[0] || null;
  const selectedOrder = orderDetails[selectedOrderId] || data.orders.find((order) => order.id === selectedOrderId) || null;
  const tabs = ROLE_TABS[role];
  const allowedStatuses = getAllowedStatuses(role);
  const dashboard = data.dashboard || {
    totalOrders: data.orders.length,
    activeOrders: data.orders.filter((order) => !['CLOSED', 'CANCELLED', 'SHIPPED'].includes(order.status)).length,
    overdueOrders: data.orders.filter((order) => order.overdue).length,
    completedOrders: data.orders.filter((order) => ['CLOSED', 'SHIPPED'].includes(order.status)).length,
    statusCounts: {},
    priorityCounts: {},
    recentOrders: data.orders.slice(0, 4),
  };

  const refresh = async () => {
    const workspaceData = await loadWorkspaceData(role, viewerId);
    setData(workspaceData);
    if (selectedOrderId) {
      try {
        const detail = await loadOrderDetails(selectedOrderId);
        setOrderDetails((previous) => ({ ...previous, [selectedOrderId]: detail }));
      } catch (error) {
        // Preserve the existing detail panel if the backend is slow or unavailable.
      }
    }
  };

  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    try {
      const created = await createOrder({
        ...createOrderForm,
        clientCompanyId: Number(createOrderForm.clientCompanyId),
        managerId: Number(createOrderForm.managerId),
        executorId: Number(createOrderForm.executorId),
        dueDate: createOrderForm.dueDate || null,
        plannedDate: createOrderForm.plannedDate || null,
      });
      await refresh();
      const detail = await loadOrderDetails(created.id).catch(() => created);
      setOrderDetails((previous) => ({ ...previous, [created.id]: detail }));
      setSelectedOrderId(created.id);
      showMessage(`Заказ ${created.orderNumber} создан`);
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    try {
      await createUser({
        ...createUserForm,
        clientCompanyId: createUserForm.clientCompanyId ? Number(createUserForm.clientCompanyId) : null,
      });
      await refresh();
      setCreateUserForm({
        login: '',
        fullName: '',
        email: '',
        phone: '',
        role: 'EXECUTOR',
        active: true,
        clientCompanyId: '',
      });
      showMessage('Пользователь создан');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleCreateClient = async (event) => {
    event.preventDefault();
    try {
      await createClient(createClientForm);
      await refresh();
      setCreateClientForm({
        name: '',
        inn: '',
        contactPerson: '',
        phone: '',
        email: '',
        city: '',
      });
      showMessage('Клиент создан');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleChangeStatus = async (event) => {
    event.preventDefault();
    if (!selectedOrder) {
      return;
    }
    try {
      await changeOrderStatus(selectedOrder.id, {
        ...statusForm,
        changedByRole: role,
        changedByName: selectedUser?.fullName || statusForm.changedByName,
      });
      await refresh();
      showMessage('Статус обновлён');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!selectedOrder) {
      return;
    }
    try {
      await addOrderComment(selectedOrder.id, {
        ...commentForm,
        authorRole: role,
        authorName: selectedUser?.fullName || commentForm.authorName,
        visibleToClient: role === 'CLIENT' ? true : commentForm.visibleToClient,
      });
      await refresh();
      setCommentForm((previous) => ({ ...previous, message: '', visibleToClient: role === 'CLIENT' }));
      showMessage('Комментарий добавлен');
    } catch (error) {
      showMessage(error.message, 'error');
    }
  };

  const renderDashboard = () => (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <StatCard label="Всего заказов" value={dashboard.totalOrders} helper="Все активные и завершённые заказы" />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard label="Активные" value={dashboard.activeOrders} helper="Находятся в работе" accent="#0f766e" />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard label="Просрочки" value={dashboard.overdueOrders} helper="Требуют внимания" accent="#b91c1c" />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard label="Завершённые" value={dashboard.completedOrders} helper="Доведены до конца" accent="#15803d" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SectionCard title="Текущие статусы" subtitle="Показывает распределение заказов по стадиям">
            <Stack spacing={1.2}>
              {Object.entries(dashboard.statusCounts || {}).map(([label, count]) => (
                <Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">{label}</Typography>
                  <Chip label={count} size="small" color="primary" variant="outlined" />
                </Stack>
              ))}
              {!Object.keys(dashboard.statusCounts || {}).length ? (
                <Typography variant="body2" color="text.secondary">
                  Нет данных по статусам.
                </Typography>
              ) : null}
            </Stack>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <SectionCard title="Приоритеты" subtitle="Где нужен ускоренный фокус">
            <Stack spacing={1.2}>
              {Object.entries(dashboard.priorityCounts || {}).map(([label, count]) => (
                <Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">{label}</Typography>
                  <Chip label={count} size="small" color="secondary" variant="outlined" />
                </Stack>
              ))}
              {!Object.keys(dashboard.priorityCounts || {}).length ? (
                <Typography variant="body2" color="text.secondary">
                  Нет данных по приоритетам.
                </Typography>
              ) : null}
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      <SectionCard title="Последние заказы" subtitle="Краткая картина по свежим карточкам">
        <Stack spacing={1.5}>
          {dashboard.recentOrders?.map((order) => (
            <Paper key={order.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {order.orderNumber} · {order.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.clientName}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="flex-end">
                  <Chip label={order.statusLabel} color={getStatusColor(order.status)} size="small" />
                  <Chip label={order.priorityLabel} color={getPriorityColor(order.priority)} size="small" variant="outlined" />
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </SectionCard>
    </Stack>
  );

  const renderOrderList = (list) => (
    <Stack spacing={1.5}>
      {list.map((order) => (
        <Paper
          key={order.id}
          variant="outlined"
          onClick={() => setSelectedOrderId(order.id)}
          sx={{
            p: 2,
            cursor: 'pointer',
            borderRadius: 3,
            borderColor: order.id === selectedOrderId ? 'primary.main' : 'divider',
            background: order.id === selectedOrderId ? 'rgba(15, 76, 129, 0.06)' : 'transparent',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                {order.orderNumber}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.3 }}>
                {order.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {order.clientName}
              </Typography>
            </Box>
            <Stack spacing={1} alignItems="flex-end">
              <Chip label={order.statusLabel} color={getStatusColor(order.status)} size="small" />
              <Chip label={order.priorityLabel} size="small" variant="outlined" color={getPriorityColor(order.priority)} />
            </Stack>
          </Stack>
        </Paper>
      ))}
      {!list.length ? <Typography color="text.secondary">Заказы не найдены.</Typography> : null}
    </Stack>
  );

  const renderOrderDetail = () => {
    if (!selectedOrder) {
      return <Typography color="text.secondary">Выберите заказ, чтобы увидеть детали.</Typography>;
    }

    const detail = orderDetails[selectedOrder.id] || selectedOrder;

    return (
      <Stack spacing={3}>
        <SectionCard
          title={`${detail.orderNumber} · ${detail.title}`}
          subtitle={detail.description}
          action={
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={detail.statusLabel} color={getStatusColor(detail.status)} />
              <Chip label={detail.priorityLabel} color={getPriorityColor(detail.priority)} variant="outlined" />
            </Stack>
          }
        >
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="overline" color="text.secondary">
                Клиент
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {detail.clientCompany?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {detail.clientCompany?.contactPerson}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="overline" color="text.secondary">
                Менеджер
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {detail.manager?.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {detail.manager?.phone}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="overline" color="text.secondary">
                Исполнитель
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {detail.executor?.fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {detail.executor?.phone}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="overline" color="text.secondary">
                Создан
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {formatDate(detail.createdAt)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="overline" color="text.secondary">
                План
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {formatDate(detail.plannedDate)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="overline" color="text.secondary">
                Дедлайн
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {formatDate(detail.dueDate)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="overline" color="text.secondary">
                Закрыт
              </Typography>
              <Typography variant="body1" fontWeight={700}>
                {formatDate(detail.completedAt)}
              </Typography>
            </Grid>
          </Grid>
        </SectionCard>

        {role !== 'CLIENT' ? (
          <SectionCard title="Сменить статус" subtitle={`Эта форма доступна роли ${ROLE_LABELS[role]}`}>
            <Box component="form" onSubmit={handleChangeStatus}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
                    fullWidth
                    label="Новый статус"
                    value={statusForm.status}
                    onChange={(event) => setStatusForm((previous) => ({ ...previous, status: event.target.value }))}
                  >
                    {allowedStatuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Комментарий к смене статуса"
                    value={statusForm.comment}
                    onChange={(event) => setStatusForm((previous) => ({ ...previous, comment: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button type="submit" variant="contained" startIcon={<RefreshRoundedIcon />}>
                    Обновить статус
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </SectionCard>
        ) : null}

        <SectionCard title="Комментарий" subtitle="Клиент и сотрудники могут писать комментарии по заказу">
          <Box component="form" onSubmit={handleAddComment}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Автор"
                  value={commentForm.authorName}
                  onChange={(event) => setCommentForm((previous) => ({ ...previous, authorName: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Текст комментария"
                  value={commentForm.message}
                  onChange={(event) => setCommentForm((previous) => ({ ...previous, message: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  {role !== 'CLIENT' ? (
                    <Button
                      variant={commentForm.visibleToClient ? 'contained' : 'outlined'}
                      onClick={() => setCommentForm((previous) => ({ ...previous, visibleToClient: !previous.visibleToClient }))}
                    >
                      {commentForm.visibleToClient ? 'Виден клиенту' : 'Только внутр. комм.'}
                    </Button>
                  ) : (
                    <Chip label="Комментарий будет виден менеджеру" color="primary" />
                  )}
                  <Button type="submit" variant="contained">
                    Добавить комментарий
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </SectionCard>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SectionCard title="История статусов" subtitle="Показывает путь заказа по этапам">
              <Stack spacing={1.5}>
                {detail.history?.map((item) => (
                  <Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2" fontWeight={800}>
                        {item.statusLabel}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.comment}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.changedByName} · {item.changedByRole} · {formatDateTime(item.changedAt)}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Комментарии" subtitle="Внутренние и клиентские сообщения по заказу">
              <Stack spacing={1.5}>
                {detail.comments?.map((item) => (
                  <Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={800}>
                          {item.authorName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.authorRole} · {formatDateTime(item.createdAt)}
                        </Typography>
                      </Box>
                      <Chip
                        label={item.visibleToClient ? 'Виден клиенту' : 'Внутренний'}
                        color={item.visibleToClient ? 'success' : 'default'}
                        size="small"
                      />
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {item.message}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>
      </Stack>
    );
  };

  const renderOrdersWorkspace = (list) => (
    <Grid container spacing={2}>
      <Grid item xs={12} lg={4}>
        <SectionCard
          title={role === 'EXECUTOR' ? 'Очередь задач' : role === 'CLIENT' ? 'Мои заказы' : 'Список заказов'}
          subtitle="Выберите карточку для подробного просмотра"
          action={<Chip label={`${list.length} шт.`} size="small" variant="outlined" />}
        >
          {renderOrderList(list)}
        </SectionCard>
      </Grid>
      <Grid item xs={12} lg={8}>
        {renderOrderDetail()}
      </Grid>
    </Grid>
  );

  const renderUsers = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={5}>
        <SectionCard title="Новый пользователь" subtitle="Администратор может добавлять сотрудников">
          <Box component="form" onSubmit={handleCreateUser}>
            <Stack spacing={2}>
              <TextField
                label="Логин"
                value={createUserForm.login}
                onChange={(event) => setCreateUserForm((previous) => ({ ...previous, login: event.target.value }))}
              />
              <TextField
                label="ФИО"
                value={createUserForm.fullName}
                onChange={(event) => setCreateUserForm((previous) => ({ ...previous, fullName: event.target.value }))}
              />
              <TextField
                label="Email"
                value={createUserForm.email}
                onChange={(event) => setCreateUserForm((previous) => ({ ...previous, email: event.target.value }))}
              />
              <TextField
                label="Телефон"
                value={createUserForm.phone}
                onChange={(event) => setCreateUserForm((previous) => ({ ...previous, phone: event.target.value }))}
              />
              <TextField
                select
                label="Роль"
                value={createUserForm.role}
                onChange={(event) => setCreateUserForm((previous) => ({ ...previous, role: event.target.value }))}
              >
                {data.roles.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Клиент"
                value={createUserForm.clientCompanyId}
                onChange={(event) => setCreateUserForm((previous) => ({ ...previous, clientCompanyId: event.target.value }))}
              >
                <MenuItem value="">Нет</MenuItem>
                {data.clients.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <Button type="submit" variant="contained">
                Создать пользователя
              </Button>
            </Stack>
          </Box>
        </SectionCard>
      </Grid>
      <Grid item xs={12} md={7}>
        <SectionCard title="Пользователи" subtitle="Список учетных записей в системе">
          <Stack spacing={1.5}>
            {data.users.map((user) => (
              <Paper key={user.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {user.fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user.email} · {user.phone}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="flex-end">
                    <Chip label={user.roleLabel} color="primary" size="small" />
                    <Chip label={user.active ? 'Активен' : 'Отключён'} color={user.active ? 'success' : 'default'} size="small" />
                  </Stack>
                </Stack>
                {user.clientCompanyName ? (
                  <Typography variant="caption" color="text.secondary">
                    Привязан к: {user.clientCompanyName}
                  </Typography>
                ) : null}
              </Paper>
            ))}
          </Stack>
        </SectionCard>
      </Grid>
    </Grid>
  );

  const renderClients = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={5}>
        <SectionCard title="Новый клиент" subtitle="Добавление новой компании-заказчика">
          <Box component="form" onSubmit={handleCreateClient}>
            <Stack spacing={2}>
              <TextField
                label="Название компании"
                value={createClientForm.name}
                onChange={(event) => setCreateClientForm((previous) => ({ ...previous, name: event.target.value }))}
              />
              <TextField
                label="ИНН"
                value={createClientForm.inn}
                onChange={(event) => setCreateClientForm((previous) => ({ ...previous, inn: event.target.value }))}
              />
              <TextField
                label="Контактное лицо"
                value={createClientForm.contactPerson}
                onChange={(event) => setCreateClientForm((previous) => ({ ...previous, contactPerson: event.target.value }))}
              />
              <TextField
                label="Телефон"
                value={createClientForm.phone}
                onChange={(event) => setCreateClientForm((previous) => ({ ...previous, phone: event.target.value }))}
              />
              <TextField
                label="Email"
                value={createClientForm.email}
                onChange={(event) => setCreateClientForm((previous) => ({ ...previous, email: event.target.value }))}
              />
              <TextField
                label="Город"
                value={createClientForm.city}
                onChange={(event) => setCreateClientForm((previous) => ({ ...previous, city: event.target.value }))}
              />
              <Button type="submit" variant="contained">
                Создать клиента
              </Button>
            </Stack>
          </Box>
        </SectionCard>
      </Grid>
      <Grid item xs={12} md={7}>
        <SectionCard title="Клиенты" subtitle="Компании, по которым ведутся заказы">
          <Stack spacing={1.5}>
            {data.clients.map((client) => (
              <Paper key={client.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {client.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {client.contactPerson} · {client.phone}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="flex-end">
                    <Chip label={`${client.orderCount} заказ(ов)`} size="small" variant="outlined" />
                    <Chip label={client.city} size="small" color="secondary" />
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </SectionCard>
      </Grid>
    </Grid>
  );

  const renderStatuses = () => (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <SectionCard title="Статусы заказа" subtitle="Логика производственного цикла">
          <Stack spacing={1.2}>
            {data.statuses.map((status) => (
              <Paper key={status.value} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Typography variant="body2" fontWeight={700}>
                    {status.label}
                  </Typography>
                  <Chip label={status.value} size="small" variant="outlined" />
                </Stack>
              </Paper>
            ))}
          </Stack>
        </SectionCard>
      </Grid>
      <Grid item xs={12} md={6}>
        <SectionCard title="Роль и действия" subtitle="Кто что может делать в системе">
          <Stack spacing={2}>
            {data.roles.map((item) => (
              <Paper key={item.value} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="subtitle2" fontWeight={800}>
                  {item.label}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {item.value === 'ADMIN' && 'Полный доступ к пользователям, клиентам и заказам.'}
                  {item.value === 'MANAGER' && 'Создание и сопровождение заказов, комментарии и верхние статусы.'}
                  {item.value === 'EXECUTOR' && 'Работа по назначенным заказам и производственным этапам.'}
                  {item.value === 'CLIENT' && 'Просмотр своих заказов и добавление уточнений в комментариях.'}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </SectionCard>
      </Grid>
    </Grid>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background:
            'radial-gradient(circle at top left, rgba(15,76,129,0.12), transparent 30%), radial-gradient(circle at right, rgba(180,83,9,0.1), transparent 28%), linear-gradient(180deg, #f9f3ea 0%, #f4efe7 100%)',
        }}
      >
        <AppBar position="sticky" elevation={0} sx={{ background: 'rgba(16, 45, 78, 0.92)', backdropFilter: 'blur(16px)' }}>
          <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 260 }}>
              <Typography variant="h6">ПК «Импульс» · Управление заказами</Typography>
              <Typography variant="body2" sx={{ opacity: 0.82 }}>
                Web-подсистема для контроля статусов, комментариев и этапов производства
              </Typography>
            </Box>
            <FormControl size="small" sx={{ minWidth: 190 }}>
              <Select
                value={role}
                onChange={(event) => {
                  setRole(event.target.value);
                  setTab(ROLE_TABS[event.target.value][0].value);
                }}
                sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' } }}
              >
                {data.roles.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <Select
                value={viewerId}
                onChange={(event) => setViewerId(Number(event.target.value))}
                sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.35)' } }}
              >
                {visibleUsers.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <IconButton color="inherit" onClick={() => refresh().catch(() => showMessage('Не удалось обновить данные', 'error'))}>
              <RefreshRoundedIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Container maxWidth={false} sx={{ py: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} lg={3}>
              <Paper
                sx={{
                  p: 2,
                  position: 'sticky',
                  top: 88,
                  border: '1px solid rgba(15, 76, 129, 0.12)',
                  background: 'rgba(255,255,255,0.78)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Активный профиль
                    </Typography>
                    <Typography variant="h6">{selectedUser?.fullName || 'Пользователь'}</Typography>
                    <Chip sx={{ mt: 1 }} label={ROLE_LABELS[role]} color="primary" size="small" />
                  </Box>
                  <Divider />
                  <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={tab}
                    onChange={(_, value) => setTab(value)}
                    sx={{
                      minHeight: 'auto',
                      '.MuiTab-root': {
                        alignItems: 'flex-start',
                        textTransform: 'none',
                        minHeight: 44,
                        borderRadius: 2,
                      },
                    }}
                  >
                    {tabs.map((item) => (
                      <Tab key={item.value} value={item.value} iconPosition="start" icon={item.icon} label={item.label} />
                    ))}
                  </Tabs>
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={9}>
              <Stack spacing={2}>
                {loading ? <Alert severity="info">Загружаем данные из API...</Alert> : null}
                {tab === 'dashboard' ? renderDashboard() : null}
                {tab === 'orders' || tab === 'tasks' ? renderOrdersWorkspace(data.orders) : null}
                {tab === 'create-order' ? (
                  <SectionCard title="Новый заказ" subtitle="Менеджер заполняет карточку и запускает процесс">
                    <Box component="form" onSubmit={handleCreateOrder}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            label="Номер заказа"
                            value={createOrderForm.orderNumber}
                            onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, orderNumber: event.target.value }))}
                          />
                        </Grid>
                        <Grid item xs={12} md={8}>
                          <TextField
                            fullWidth
                            label="Название"
                            value={createOrderForm.title}
                            onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, title: event.target.value }))}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Описание"
                            value={createOrderForm.description}
                            onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, description: event.target.value }))}
                            multiline
                            minRows={3}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            select
                            fullWidth
                            label="Клиент"
                            value={createOrderForm.clientCompanyId}
                            onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, clientCompanyId: event.target.value }))}
                          >
                            {data.clients.map((client) => (
                              <MenuItem key={client.id} value={client.id}>
                                {client.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            select
                            fullWidth
                            label="Менеджер"
                            value={createOrderForm.managerId}
                            onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, managerId: event.target.value }))}
                          >
                            {byRole(data.users, 'MANAGER').map((user) => (
                              <MenuItem key={user.id} value={user.id}>
                                {user.fullName}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            select
                            fullWidth
                            label="Исполнитель"
                            value={createOrderForm.executorId}
                            onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, executorId: event.target.value }))}
                          >
                            {byRole(data.users, 'EXECUTOR').map((user) => (
                              <MenuItem key={user.id} value={user.id}>
                                {user.fullName}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            select
                            fullWidth
                            label="Приоритет"
                            value={createOrderForm.priority}
                            onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, priority: event.target.value }))}
                          >
                            {data.priorities.map((priority) => (
                              <MenuItem key={priority.value} value={priority.value}>
                                {priority.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            type="date"
                            label="План"
                            InputLabelProps={{ shrink: true }}
                            value={createOrderForm.plannedDate}
                            onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, plannedDate: event.target.value }))}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            type="date"
                            label="Дедлайн"
                            InputLabelProps={{ shrink: true }}
                            value={createOrderForm.dueDate}
                            onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, dueDate: event.target.value }))}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button type="submit" variant="contained">
                            Создать заказ
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </SectionCard>
                ) : null}
                {tab === 'users' ? renderUsers() : null}
                {tab === 'clients' ? renderClients() : null}
                {tab === 'statuses' ? renderStatuses() : null}
              </Stack>
            </Grid>
          </Grid>
        </Container>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={5000}
          onClose={() => setSnackbar((previous) => ({ ...previous, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
