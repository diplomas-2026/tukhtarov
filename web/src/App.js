import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Grid,
  MenuItem,
  Paper,
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
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import {
  addOrderComment,
  changeOrderStatus,
  clearAuthToken,
  createClient,
  createOrder,
  createUser,
  loadOrderDetails,
  loadWorkspaceData,
  login,
  me,
  setAuthToken,
} from './api';

const theme = createTheme({
  palette: {
    primary: { main: '#0f4c81' },
    secondary: { main: '#b45309' },
    background: { default: '#f4efe7', paper: '#fffaf3' },
  },
  shape: { borderRadius: 18 },
  typography: {
    fontFamily: '"IBM Plex Sans", "Segoe UI", sans-serif',
    h4: { fontWeight: 800 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
});

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

const INTERNAL_STATUS_VALUES = new Set([
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
  if (status === 'CANCELLED') return 'error';
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

function getAllowedStatuses(statuses, role) {
  if (role === 'CLIENT') {
    return [];
  }
  if (role === 'EXECUTOR') {
    return statuses.filter((status) => INTERNAL_STATUS_VALUES.has(status.value) && !['NEW', 'CLARIFICATION'].includes(status.value));
  }
  return statuses.filter((status) => INTERNAL_STATUS_VALUES.has(status.value));
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

function LoginScreen({ onSuccess, snackbar, setSnackbar }) {
  const [form, setForm] = useState({ login: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await login(form.login, form.password);
      setAuthToken(response.token);
      onSuccess(response.user, response.token);
    } catch (error) {
      setErrorMessage(error.message);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 10 }}>
      <Card sx={{ border: '1px solid rgba(15, 76, 129, 0.12)', boxShadow: '0 20px 60px rgba(15, 76, 129, 0.12)' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h4">ПК «Импульс»</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Вход в систему управления статусами заказов
              </Typography>
            </Box>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
                <TextField
                  label="Логин или email"
                  value={form.login}
                  onChange={(event) => setForm((previous) => ({ ...previous, login: event.target.value }))}
                  autoComplete="username"
                  fullWidth
                />
                <TextField
                  label="Пароль"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
                  autoComplete="current-password"
                  fullWidth
                />
                <Button type="submit" variant="contained" size="large" disabled={loading}>
                  {loading ? 'Входим...' : 'Войти'}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((previous) => ({ ...previous, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

function Workspace({ auth, onLogout, snackbar, setSnackbar }) {
  const [data, setData] = useState({
    dashboard: null,
    orders: [],
    users: [],
    clients: [],
    roles: [],
    statuses: [],
    priorities: [],
  });
  const [orderDetails, setOrderDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [tab, setTab] = useState(ROLE_TABS[auth.role]?.[0]?.value || 'dashboard');
  const [createOrderForm, setCreateOrderForm] = useState({
    orderNumber: 'IMP-2026-004',
    title: '',
    description: '',
    clientCompanyId: '',
    managerId: '',
    executorId: '',
    priority: 'NORMAL',
    plannedDate: '',
    dueDate: '',
  });
  const [createUserForm, setCreateUserForm] = useState({
    login: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
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
  const [statusForm, setStatusForm] = useState({ status: '', comment: '' });
  const [commentForm, setCommentForm] = useState({ message: '', visibleToClient: auth.role === 'CLIENT' });
  const [actionLoading, setActionLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiErrorSeverity, setApiErrorSeverity] = useState('error');

  const tabs = ROLE_TABS[auth.role] || ROLE_TABS.CLIENT;
  const allowedStatuses = useMemo(() => getAllowedStatuses(data.statuses, auth.role), [data.statuses, auth.role]);
  const selectedOrder = orderDetails[selectedOrderId] || data.orders.find((order) => order.id === selectedOrderId) || null;

  const refreshWorkspace = async (preferOrderId = selectedOrderId) => {
    setApiError('');
    const workspace = await loadWorkspaceData();
    setData(workspace);
    if (workspace.orders.length && !workspace.orders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(workspace.orders[0].id);
    }
    if (preferOrderId) {
      try {
        const detail = await loadOrderDetails(preferOrderId);
        setOrderDetails((previous) => ({ ...previous, [preferOrderId]: detail }));
      } catch (error) {
        // Keep the workspace usable even if one detail call fails.
      }
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    let active = true;
    setLoading(true);
    refreshWorkspace()
      .catch((error) => {
        if (active) {
          if (!handleApiError(error)) {
            setSnackbar({ open: true, message: error.message, severity: 'error' });
          }
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selectedOrderId || orderDetails[selectedOrderId]) {
      return;
    }
    loadOrderDetails(selectedOrderId)
      .then((detail) => {
        setOrderDetails((previous) => ({ ...previous, [selectedOrderId]: detail }));
        setStatusForm({
          status: detail.status,
          comment: '',
        });
      })
      .catch(() => {
        // ignore, workspace list is still available
      });
  }, [selectedOrderId, orderDetails]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (selectedOrder) {
      setStatusForm((previous) => ({
        ...previous,
        status: selectedOrder.status,
        comment: '',
      }));
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (allowedStatuses.length && !allowedStatuses.some((item) => item.value === statusForm.status)) {
      setStatusForm((previous) => ({ ...previous, status: allowedStatuses[0].value }));
    }
  }, [allowedStatuses, statusForm.status]);

  useEffect(() => {
    if (!data.clients.length) {
      return;
    }
    if (!createOrderForm.clientCompanyId) {
      setCreateOrderForm((previous) => ({ ...previous, clientCompanyId: String(data.clients[0].id) }));
    }
  }, [data.clients, createOrderForm.clientCompanyId]);

  useEffect(() => {
    const managers = byRole(data.users, 'MANAGER');
    const executors = byRole(data.users, 'EXECUTOR');
    if (!createOrderForm.managerId && managers.length) {
      setCreateOrderForm((previous) => ({ ...previous, managerId: String(managers[0].id) }));
    }
    if (!createOrderForm.executorId && executors.length) {
      setCreateOrderForm((previous) => ({ ...previous, executorId: String(executors[0].id) }));
    }
  }, [data.users, createOrderForm.managerId, createOrderForm.executorId]);

  const showMessage = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleApiError = (error) => {
    if (error?.status === 401) {
      clearAuthToken();
      onLogout();
      setApiErrorSeverity('error');
      setApiError('Сессия истекла. Войдите снова.');
      showMessage('Сессия истекла. Войдите снова.', 'error');
      return true;
    }
    setApiErrorSeverity('error');
    setApiError(error.message);
    showMessage(error.message, 'error');
    return false;
  };

  const handleRefresh = async () => {
    setLoading(true);
    setApiError('');
    try {
      await refreshWorkspace();
    } catch (error) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    setActionLoading(true);
    setApiError('');
    try {
      const created = await createOrder({
        ...createOrderForm,
        clientCompanyId: Number(createOrderForm.clientCompanyId),
        managerId: Number(createOrderForm.managerId),
        executorId: Number(createOrderForm.executorId),
        plannedDate: createOrderForm.plannedDate || null,
        dueDate: createOrderForm.dueDate || null,
      });
      setCreateOrderForm((previous) => ({
        ...previous,
        title: '',
        description: '',
        plannedDate: '',
        dueDate: '',
      }));
      await refreshWorkspace(created.id);
      setSelectedOrderId(created.id);
      showMessage(`Заказ ${created.orderNumber} создан`);
    } catch (error) {
      handleApiError(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setActionLoading(true);
    setApiError('');
    try {
      await createUser({
        ...createUserForm,
        clientCompanyId: createUserForm.clientCompanyId ? Number(createUserForm.clientCompanyId) : null,
      });
      setCreateUserForm({
        login: '',
        fullName: '',
        email: '',
        phone: '',
        password: '',
        role: 'EXECUTOR',
        active: true,
        clientCompanyId: '',
      });
      await handleRefresh();
      showMessage('Пользователь создан');
    } catch (error) {
      handleApiError(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateClient = async (event) => {
    event.preventDefault();
    setActionLoading(true);
    setApiError('');
    try {
      await createClient(createClientForm);
      setCreateClientForm({
        name: '',
        inn: '',
        contactPerson: '',
        phone: '',
        email: '',
        city: '',
      });
      await handleRefresh();
      showMessage('Клиент создан');
    } catch (error) {
      handleApiError(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeStatus = async (event) => {
    event.preventDefault();
    if (!selectedOrder) return;
    setActionLoading(true);
    setApiError('');
    try {
      const detail = await changeOrderStatus(selectedOrder.id, {
        status: statusForm.status,
        comment: statusForm.comment,
      });
      setOrderDetails((previous) => ({ ...previous, [selectedOrder.id]: detail }));
      await handleRefresh();
      showMessage('Статус обновлён');
    } catch (error) {
      handleApiError(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddComment = async (event) => {
    event.preventDefault();
    if (!selectedOrder) return;
    setActionLoading(true);
    setApiError('');
    try {
      const detail = await addOrderComment(selectedOrder.id, {
        message: commentForm.message,
        visibleToClient: auth.role === 'CLIENT' ? true : commentForm.visibleToClient,
      });
      setOrderDetails((previous) => ({ ...previous, [selectedOrder.id]: detail }));
      setCommentForm({ message: '', visibleToClient: auth.role === 'CLIENT' });
      await handleRefresh();
      showMessage('Комментарий добавлен');
    } catch (error) {
      showMessage(error.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const renderDashboard = () => {
    const dashboard = data.dashboard || {
      totalOrders: data.orders.length,
      activeOrders: data.orders.filter((order) => !['CLOSED', 'CANCELLED', 'SHIPPED'].includes(order.status)).length,
      overdueOrders: data.orders.filter((order) => order.overdue).length,
      completedOrders: data.orders.filter((order) => ['CLOSED', 'SHIPPED'].includes(order.status)).length,
      statusCounts: {},
      priorityCounts: {},
      recentOrders: data.orders.slice(0, 4),
    };

    return (
      <Stack spacing={3}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <StatCard label="Всего заказов" value={dashboard.totalOrders} helper="За период по текущему пользователю" />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard label="Активные" value={dashboard.activeOrders} helper="Находятся в работе" accent="#0f766e" />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard label="Просрочки" value={dashboard.overdueOrders} helper="Требуют внимания" accent="#b91c1c" />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard label="Завершённые" value={dashboard.completedOrders} helper="Закрыты или отгружены" accent="#15803d" />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SectionCard title="Текущие статусы" subtitle="Распределение заказов по стадиям">
              <Stack spacing={1.2}>
                {Object.entries(dashboard.statusCounts || {}).map(([label, count]) => (
                  <Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">{label}</Typography>
                    <Chip label={count} size="small" color="primary" variant="outlined" />
                  </Stack>
                ))}
                {!Object.keys(dashboard.statusCounts || {}).length ? <Typography color="text.secondary">Нет данных.</Typography> : null}
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
                {!Object.keys(dashboard.priorityCounts || {}).length ? <Typography color="text.secondary">Нет данных.</Typography> : null}
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>

        <SectionCard title="Последние заказы" subtitle="Краткая картина по свежим карточкам">
          <Stack spacing={1.5}>
            {(dashboard.recentOrders || []).map((order) => (
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
  };

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

        {auth.role !== 'CLIENT' ? (
          <SectionCard title="Сменить статус" subtitle={`Эта форма доступна роли ${auth.roleLabel}`}>
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
                  <Button type="submit" variant="contained" disabled={actionLoading}>
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
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Текст комментария"
                  value={commentForm.message}
                  onChange={(event) => setCommentForm((previous) => ({ ...previous, message: event.target.value }))}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  {auth.role !== 'CLIENT' ? (
                    <Button
                      variant={commentForm.visibleToClient ? 'contained' : 'outlined'}
                      onClick={() => setCommentForm((previous) => ({ ...previous, visibleToClient: !previous.visibleToClient }))}
                    >
                      {commentForm.visibleToClient ? 'Виден клиенту' : 'Только внутр. комм.'}
                    </Button>
                  ) : (
                    <Chip label="Комментарий будет виден менеджеру" color="primary" />
                  )}
                  <Button type="submit" variant="contained" disabled={actionLoading}>
                    Добавить комментарий
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </SectionCard>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <SectionCard title="История статусов" subtitle="Путь заказа по этапам">
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
          title={auth.role === 'EXECUTOR' ? 'Очередь задач' : auth.role === 'CLIENT' ? 'Мои заказы' : 'Список заказов'}
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
              <TextField label="Логин" value={createUserForm.login} onChange={(event) => setCreateUserForm((previous) => ({ ...previous, login: event.target.value }))} />
              <TextField label="ФИО" value={createUserForm.fullName} onChange={(event) => setCreateUserForm((previous) => ({ ...previous, fullName: event.target.value }))} />
              <TextField label="Email" value={createUserForm.email} onChange={(event) => setCreateUserForm((previous) => ({ ...previous, email: event.target.value }))} />
              <TextField label="Телефон" value={createUserForm.phone} onChange={(event) => setCreateUserForm((previous) => ({ ...previous, phone: event.target.value }))} />
              <TextField label="Пароль" type="password" value={createUserForm.password} onChange={(event) => setCreateUserForm((previous) => ({ ...previous, password: event.target.value }))} />
              <TextField select label="Роль" value={createUserForm.role} onChange={(event) => setCreateUserForm((previous) => ({ ...previous, role: event.target.value }))}>
                {data.roles.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField select label="Клиент" value={createUserForm.clientCompanyId} onChange={(event) => setCreateUserForm((previous) => ({ ...previous, clientCompanyId: event.target.value }))}>
                <MenuItem value="">Нет</MenuItem>
                {data.clients.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <Button type="submit" variant="contained" disabled={actionLoading}>
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
              <TextField label="Название компании" value={createClientForm.name} onChange={(event) => setCreateClientForm((previous) => ({ ...previous, name: event.target.value }))} />
              <TextField label="ИНН" value={createClientForm.inn} onChange={(event) => setCreateClientForm((previous) => ({ ...previous, inn: event.target.value }))} />
              <TextField label="Контактное лицо" value={createClientForm.contactPerson} onChange={(event) => setCreateClientForm((previous) => ({ ...previous, contactPerson: event.target.value }))} />
              <TextField label="Телефон" value={createClientForm.phone} onChange={(event) => setCreateClientForm((previous) => ({ ...previous, phone: event.target.value }))} />
              <TextField label="Email" value={createClientForm.email} onChange={(event) => setCreateClientForm((previous) => ({ ...previous, email: event.target.value }))} />
              <TextField label="Город" value={createClientForm.city} onChange={(event) => setCreateClientForm((previous) => ({ ...previous, city: event.target.value }))} />
              <Button type="submit" variant="contained" disabled={actionLoading}>
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
            {tabs.map((item) => (
              <Paper key={item.value} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="subtitle2" fontWeight={800}>
                  {item.label}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </SectionCard>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #f9f3ea 0%, #f4efe7 100%)' }}>
      <AppBar position="sticky" elevation={0} sx={{ background: 'rgba(16, 45, 78, 0.92)', backdropFilter: 'blur(16px)' }}>
        <Toolbar sx={{ gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 260 }}>
            <Typography variant="h6">ПК «Импульс» · Управление заказами</Typography>
            <Typography variant="body2" sx={{ opacity: 0.82 }}>
              {auth.fullName} · {auth.roleLabel}
            </Typography>
          </Box>
          <Button color="inherit" startIcon={<RefreshRoundedIcon />} onClick={handleRefresh} sx={{ border: '1px solid rgba(255,255,255,0.18)' }}>
            Обновить
          </Button>
          <Button color="inherit" startIcon={<LogoutRoundedIcon />} onClick={onLogout} sx={{ border: '1px solid rgba(255,255,255,0.18)' }}>
            Выйти
          </Button>
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
                  <Typography variant="h6">{auth.fullName}</Typography>
                  <Chip sx={{ mt: 1 }} label={auth.roleLabel} color="primary" size="small" />
                </Box>
                <Box sx={{ height: 1, backgroundColor: 'rgba(15, 76, 129, 0.14)' }} />
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
            {apiError ? <Alert severity={apiErrorSeverity}>{apiError}</Alert> : null}
            {loading ? (
              <Card>
                <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <CircularProgress size={20} />
                      <Typography>Загружаем данные...</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ) : null}
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
                        <TextField select fullWidth label="Клиент" value={createOrderForm.clientCompanyId} onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, clientCompanyId: event.target.value }))}>
                          {data.clients.map((client) => (
                            <MenuItem key={client.id} value={client.id}>
                              {client.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField select fullWidth label="Менеджер" value={createOrderForm.managerId} onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, managerId: event.target.value }))}>
                          {byRole(data.users, 'MANAGER').map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.fullName}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField select fullWidth label="Исполнитель" value={createOrderForm.executorId} onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, executorId: event.target.value }))}>
                          {byRole(data.users, 'EXECUTOR').map((user) => (
                            <MenuItem key={user.id} value={user.id}>
                              {user.fullName}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField select fullWidth label="Приоритет" value={createOrderForm.priority} onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, priority: event.target.value }))}>
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
                        <Button type="submit" variant="contained" disabled={actionLoading}>
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
  );
}

function App() {
  const [auth, setAuth] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const token = localStorage.getItem('tukhtarov_token');
    if (!token) {
      setBootstrapping(false);
      return;
    }

    setAuthToken(token);
    me()
      .then((user) => {
        setAuth(user);
      })
      .catch(() => {
        clearAuthToken();
        setAuth(null);
      })
      .finally(() => {
        setBootstrapping(false);
      });
  }, []);

  const handleLoginSuccess = (user, token) => {
    setAuth(user);
    setAuthToken(token);
  };

  const handleLogout = () => {
    clearAuthToken();
    setAuth(null);
  };

  if (bootstrapping) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(180deg, #f9f3ea 0%, #f4efe7 100%)' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {auth ? (
        <Workspace auth={auth} onLogout={handleLogout} snackbar={snackbar} setSnackbar={setSnackbar} />
      ) : (
        <LoginScreen onSuccess={handleLoginSuccess} snackbar={snackbar} setSnackbar={setSnackbar} />
      )}
    </ThemeProvider>
  );
}

export default App;
