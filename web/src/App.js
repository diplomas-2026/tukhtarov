import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Divider,
  Grid,
  Drawer,
  InputAdornment,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  alpha,
  createTheme,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import GroupRoundedIcon from '@mui/icons-material/GroupRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PendingActionsRoundedIcon from '@mui/icons-material/PendingActionsRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
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
    primary: { main: '#1a73e8' },
    secondary: { main: '#0f9d58' },
    error: { main: '#d93025' },
    warning: { main: '#f29900' },
    info: { main: '#5f6368' },
    background: {
      default: '#f6f8fc',
      paper: '#ffffff',
    },
    text: {
      primary: '#202124',
      secondary: '#5f6368',
    },
  },
  shape: {
    borderRadius: 20,
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage:
            'radial-gradient(circle at top left, rgba(26,115,232,0.08), transparent 34%), radial-gradient(circle at top right, rgba(15,157,88,0.08), transparent 28%), linear-gradient(180deg, #f8fbff 0%, #f6f8fc 100%)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          boxShadow: 'none',
          paddingInline: 18,
        },
        contained: {
          boxShadow: '0 1px 2px rgba(60,64,67,0.18), 0 1px 3px rgba(60,64,67,0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(95,99,104,0.14)',
          boxShadow: '0 8px 24px rgba(60,64,67,0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#fff',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 'auto',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 48,
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          textTransform: 'none',
          borderRadius: 14,
          paddingLeft: 14,
          paddingRight: 14,
          marginBottom: 6,
          fontWeight: 600,
        },
      },
    },
  },
});

const ROLE_TABS = {
  ADMIN: [
    { value: 'dashboard', label: 'Обзор', icon: <DashboardRoundedIcon fontSize="small" /> },
    { value: 'orders', label: 'Заказы', icon: <AssignmentRoundedIcon fontSize="small" /> },
    { value: 'users', label: 'Пользователи', icon: <GroupRoundedIcon fontSize="small" /> },
    { value: 'clients', label: 'Клиенты', icon: <BusinessRoundedIcon fontSize="small" /> },
    { value: 'statuses', label: 'Статусы', icon: <PendingActionsRoundedIcon fontSize="small" /> },
  ],
  MANAGER: [
    { value: 'dashboard', label: 'Обзор', icon: <DashboardRoundedIcon fontSize="small" /> },
    { value: 'orders', label: 'Заказы', icon: <AssignmentRoundedIcon fontSize="small" /> },
    { value: 'create-order', label: 'Новый заказ', icon: <AddRoundedIcon fontSize="small" /> },
    { value: 'clients', label: 'Клиенты', icon: <BusinessRoundedIcon fontSize="small" /> },
  ],
  EXECUTOR: [
    { value: 'dashboard', label: 'Обзор', icon: <DashboardRoundedIcon fontSize="small" /> },
    { value: 'tasks', label: 'Мои задачи', icon: <AssignmentRoundedIcon fontSize="small" /> },
    { value: 'statuses', label: 'Статусы', icon: <PendingActionsRoundedIcon fontSize="small" /> },
  ],
  CLIENT: [
    { value: 'dashboard', label: 'Обзор', icon: <DashboardRoundedIcon fontSize="small" /> },
    { value: 'orders', label: 'Мои заказы', icon: <AssignmentRoundedIcon fontSize="small" /> },
  ],
};

const TAB_TITLES = {
  dashboard: {
    title: 'Обзор',
    subtitle: 'Ключевые показатели, которые помогают быстро понять ситуацию по заказам.',
  },
  orders: {
    title: 'Заказы',
    subtitle: 'Список заказов с быстрым доступом к карточке, статусу и комментариям.',
  },
  tasks: {
    title: 'Мои задачи',
    subtitle: 'Заказы, которые требуют внимания исполнителя прямо сейчас.',
  },
  'create-order': {
    title: 'Новый заказ',
    subtitle: 'Короткая карточка для запуска нового производственного заказа.',
  },
  users: {
    title: 'Пользователи',
    subtitle: 'Учетные записи сотрудников и их роли в системе.',
  },
  clients: {
    title: 'Клиенты',
    subtitle: 'Компании-заказчики и их контактные данные.',
  },
  statuses: {
    title: 'Статусы и роли',
    subtitle: 'Справочная информация по этапам и доступным действиям.',
  },
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

function StatCard({ label, value, helper, icon, accent = '#1a73e8' }) {
  return (
    <Card sx={{ height: '100%', background: `linear-gradient(180deg, #fff 0%, ${alpha(accent, 0.04)} 100%)` }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar sx={{ bgcolor: alpha(accent, 0.12), color: accent }}>
            {icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>
              {label}
            </Typography>
            <Typography variant="h4" sx={{ mt: 0.5, color: accent, fontSize: '2rem' }}>
              {value}
            </Typography>
            {helper ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                {helper}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SectionCard({ title, subtitle, action, children, sx }) {
  return (
    <Card sx={{ ...sx }}>
      <CardContent sx={{ p: 2.5 }}>
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

function EmptyState({ title, subtitle }) {
  return (
    <Box
      sx={{
        py: 6,
        px: 2,
        textAlign: 'center',
        border: '1px dashed rgba(95,99,104,0.3)',
        borderRadius: 4,
        backgroundColor: 'rgba(26,115,232,0.03)',
      }}
    >
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {subtitle}
      </Typography>
    </Box>
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
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            overflow: 'hidden',
            bgcolor: '#fff',
            boxShadow: '0 24px 60px rgba(60,64,67,0.14)',
          }}
        >
          <Box
            sx={{
              p: { xs: 3, md: 4 },
              color: '#fff',
              background: 'linear-gradient(145deg, rgba(26,115,232,0.96) 0%, rgba(15,157,88,0.92) 100%)',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 'auto -36px -56px auto',
                width: 180,
                height: 180,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                filter: 'blur(12px)',
              }}
            />
            <Stack spacing={1.5} sx={{ position: 'relative', alignItems: 'center' }}>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                ПК «Импульс»
              </Typography>
              <Typography variant="h4" sx={{ maxWidth: 500 }}>
                Управление заказами без лишнего шума и путаницы
              </Typography>
              <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 520 }}>
                Понятный интерфейс для администратора, менеджера, исполнителя и клиента.
              </Typography>
            </Stack>
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="h5">Войти в систему</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                  Используйте рабочий логин и пароль, чтобы открыть нужное рабочее место.
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                <Stack spacing={2.2}>
                  {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
                  <TextField
                    label="Логин или email"
                    value={form.login}
                    onChange={(event) => setForm((previous) => ({ ...previous, login: event.target.value }))}
                    autoComplete="username"
                  />
                  <TextField
                    label="Пароль"
                    type="password"
                    value={form.password}
                    onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
                    autoComplete="current-password"
                  />
                  <Button type="submit" variant="contained" size="large" disabled={loading}>
                    {loading ? 'Выполняется вход...' : 'Войти'}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>
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

function Workspace({ auth, onLogout, snackbar, setSnackbar }) {
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('lg'));
  const drawerWidth = 320;
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
  const [orderSearch, setOrderSearch] = useState('');
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
  const [commentForm, setCommentForm] = useState({
    message: '',
    visibleToClient: auth.role === 'CLIENT',
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiErrorSeverity, setApiErrorSeverity] = useState('error');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const tabs = ROLE_TABS[auth.role] || ROLE_TABS.CLIENT;
  const allowedStatuses = useMemo(() => getAllowedStatuses(data.statuses, auth.role), [data.statuses, auth.role]);

  useEffect(() => {
    const defaultTab = ROLE_TABS[auth.role]?.[0]?.value || 'dashboard';
    setTab(defaultTab);
  }, [auth.role]);

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    if (!query) {
      return data.orders;
    }
    return data.orders.filter((order) => {
      const haystack = [
        order.orderNumber,
        order.title,
        order.clientName,
        order.statusLabel,
        order.priorityLabel,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [data.orders, orderSearch]);

  const selectedOrder =
    orderDetails[selectedOrderId] || data.orders.find((order) => order.id === selectedOrderId) || null;

  const refreshWorkspace = async (preferOrderId = selectedOrderId) => {
    setApiError('');
    const workspace = await loadWorkspaceData();
    setData(workspace);

    const fallbackOrderId = workspace.orders[0]?.id || null;
    const nextSelectedOrderId =
      preferOrderId && workspace.orders.some((order) => order.id === preferOrderId)
        ? preferOrderId
        : fallbackOrderId;

    setSelectedOrderId(nextSelectedOrderId);

    if (nextSelectedOrderId) {
      try {
        const detail = await loadOrderDetails(nextSelectedOrderId);
        setOrderDetails((previous) => ({ ...previous, [nextSelectedOrderId]: detail }));
      } catch (error) {
        // Keep the workspace usable if one detail request fails.
      }
    }
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        // The list view is still available even if detail loading fails.
      });
  }, [selectedOrderId, orderDetails]);

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
      handleApiError(error);
    } finally {
      setActionLoading(false);
    }
  };

  const dashboard = data.dashboard || {
    totalOrders: data.orders.length,
    activeOrders: data.orders.filter((order) => !['CLOSED', 'CANCELLED', 'SHIPPED'].includes(order.status)).length,
    overdueOrders: data.orders.filter((order) => order.overdue).length,
    completedOrders: data.orders.filter((order) => ['CLOSED', 'SHIPPED'].includes(order.status)).length,
    statusCounts: {},
    priorityCounts: {},
    recentOrders: data.orders.slice(0, 4),
  };

  const pageMeta = TAB_TITLES[tab] || TAB_TITLES.dashboard;
  const handleTabSelect = (value) => {
    setTab(value);
    if (!isDesktop) {
      setDrawerOpen(false);
    }
  };

  const drawerContent = (
    <Box sx={{ p: 2.5, height: '100%', bgcolor: 'rgba(255,255,255,0.96)' }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="overline" color="text.secondary">
            Активный профиль
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.5 }}>
            {auth.fullName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {auth.roleLabel}
          </Typography>
          {auth.clientCompanyName ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {auth.clientCompanyName}
            </Typography>
          ) : null}
        </Box>
        <Divider />
        <List disablePadding>
          {tabs.map((item) => {
            const active = tab === item.value;
            return (
              <ListItemButton
                key={item.value}
                selected={active}
                onClick={() => handleTabSelect(item.value)}
                sx={{
                  mb: 0.75,
                  borderRadius: 3,
                  '&.Mui-selected': {
                    bgcolor: alpha(muiTheme.palette.primary.main, 0.08),
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: active ? 'primary.main' : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: active ? 700 : 600,
                    color: active ? 'primary.main' : 'text.primary',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Stack>
    </Box>
  );

  const renderDashboard = () => {
    const statusEntries = Object.entries(dashboard.statusCounts || {});
    const priorityEntries = Object.entries(dashboard.priorityCounts || {});
    const recentOrders = dashboard.recentOrders || [];

    return (
      <Stack spacing={3}>
        <Card
          sx={{
            background:
              'linear-gradient(135deg, rgba(26,115,232,0.96) 0%, rgba(26,115,232,0.82) 45%, rgba(15,157,88,0.84) 100%)',
            color: '#fff',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Stack spacing={1.5}>
                  <Chip
                    label={auth.roleLabel}
                    sx={{
                      alignSelf: 'flex-start',
                      bgcolor: 'rgba(255,255,255,0.16)',
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="h4">
                    {auth.fullName}, рабочее пространство уже готово к работе
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 720 }}>
                    Здесь видно главное: сколько заказов в работе, где есть задержки и какие карточки требуют следующего шага.
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack spacing={1.5}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleRefresh}
                    startIcon={<RefreshRoundedIcon />}
                    sx={{ bgcolor: '#fff', color: '#1a73e8', '&:hover': { bgcolor: '#f8fbff' } }}
                  >
                    Обновить данные
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => setTab(tabs[1]?.value || 'orders')}
                    sx={{
                      borderColor: 'rgba(255,255,255,0.4)',
                      color: '#fff',
                      '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
                    }}
                  >
                    Перейти к заказам
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={2.2}>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              label="Всего заказов"
              value={dashboard.totalOrders}
              helper="Все карточки, доступные текущему профилю."
              icon={<AssignmentRoundedIcon />}
              accent="#1a73e8"
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              label="Активные"
              value={dashboard.activeOrders}
              helper="Заказы, которые сейчас в работе."
              icon={<PendingActionsRoundedIcon />}
              accent="#0f9d58"
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              label="Просрочки"
              value={dashboard.overdueOrders}
              helper="Нужны быстрые решения и контроль."
              icon={<WarningAmberRoundedIcon />}
              accent="#d93025"
            />
          </Grid>
          <Grid item xs={12} sm={6} xl={3}>
            <StatCard
              label="Завершённые"
              value={dashboard.completedOrders}
              helper="Закрыты или отгружены."
              icon={<CheckCircleRoundedIcon />}
              accent="#188038"
            />
          </Grid>
        </Grid>

        <Grid container spacing={2.2}>
          <Grid item xs={12} md={6}>
            <SectionCard title="Статусы" subtitle="Распределение заказов по этапам производства">
              <Stack spacing={1.5}>
                {statusEntries.length ? (
                  statusEntries.map(([label, count]) => (
                    <Box key={label}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">{label}</Typography>
                        <Chip label={count} size="small" color="primary" variant="outlined" />
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, Number(count) * 20)}
                        sx={{ mt: 1, height: 8, borderRadius: 999, bgcolor: 'rgba(26,115,232,0.08)' }}
                      />
                    </Box>
                  ))
                ) : (
                  <EmptyState title="Пока нет данных" subtitle="После загрузки заказов здесь появится распределение по статусам." />
                )}
              </Stack>
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Приоритеты" subtitle="Карточки, которые стоит держать под рукой">
              <Stack spacing={1.5}>
                {priorityEntries.length ? (
                  priorityEntries.map(([label, count]) => (
                    <Box key={label}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2">{label}</Typography>
                        <Chip label={count} size="small" color="secondary" variant="outlined" />
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, Number(count) * 25)}
                        sx={{ mt: 1, height: 8, borderRadius: 999, bgcolor: 'rgba(15,157,88,0.08)' }}
                      />
                    </Box>
                  ))
                ) : (
                  <EmptyState title="Пока нет данных" subtitle="Здесь будет видно, где нужен срочный фокус." />
                )}
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>

        <SectionCard title="Последние заказы" subtitle="Свежие карточки, которые чаще всего требуют внимания">
          <Stack spacing={1.5}>
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <Paper
                  key={order.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 10px 30px rgba(60,64,67,0.12)',
                    },
                  }}
                  onClick={() => setTab(tabs[1]?.value || 'orders')}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography variant="subtitle1">
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
              ))
            ) : (
              <EmptyState title="Нет заказов" subtitle="После загрузки данных здесь появится список последних карточек." />
            )}
          </Stack>
        </SectionCard>
      </Stack>
    );
  };

  const renderOrderList = (list) => (
    <Stack spacing={1.2}>
      {list.length ? (
        list.map((order) => {
          const active = order.id === selectedOrderId;
          return (
            <Paper
              key={order.id}
              variant="outlined"
              onClick={() => setSelectedOrderId(order.id)}
              sx={{
                p: 2,
                cursor: 'pointer',
                borderRadius: 3,
                borderColor: active ? 'primary.main' : 'divider',
                backgroundColor: active ? alpha(theme.palette.primary.main, 0.05) : '#fff',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: '0 8px 22px rgba(60,64,67,0.10)',
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap>
                    {order.orderNumber}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.25 }}>
                    {order.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {order.clientName}
                  </Typography>
                </Box>
                <Stack spacing={0.9} alignItems="flex-end">
                  <Chip label={order.statusLabel} color={getStatusColor(order.status)} size="small" />
                  <Chip label={order.priorityLabel} size="small" variant="outlined" color={getPriorityColor(order.priority)} />
                </Stack>
              </Stack>
            </Paper>
          );
        })
      ) : (
        <EmptyState title="Ничего не найдено" subtitle="Попробуйте изменить запрос поиска или выберите другую вкладку." />
      )}
    </Stack>
  );

  const renderOrderDetail = () => {
    if (!selectedOrder) {
      return <EmptyState title="Выберите заказ" subtitle="Слева откройте карточку, чтобы увидеть детали, историю и комментарии." />;
    }

    const detail = orderDetails[selectedOrder.id] || selectedOrder;

    return (
      <Stack spacing={3}>
        <SectionCard
          title={`${detail.orderNumber} · ${detail.title}`}
          subtitle={detail.description}
          action={
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="flex-end">
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
              <Typography variant="subtitle1">{detail.clientCompany?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {detail.clientCompany?.contactPerson}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="overline" color="text.secondary">
                Менеджер
              </Typography>
              <Typography variant="subtitle1">{detail.manager?.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {detail.manager?.phone}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="overline" color="text.secondary">
                Исполнитель
              </Typography>
              <Typography variant="subtitle1">{detail.executor?.fullName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {detail.executor?.phone}
              </Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="overline" color="text.secondary">
                Создан
              </Typography>
              <Typography variant="subtitle1">{formatDate(detail.createdAt)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="overline" color="text.secondary">
                План
              </Typography>
              <Typography variant="subtitle1">{formatDate(detail.plannedDate)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="overline" color="text.secondary">
                Дедлайн
              </Typography>
              <Typography variant="subtitle1">{formatDate(detail.dueDate)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="overline" color="text.secondary">
                Закрыт
              </Typography>
              <Typography variant="subtitle1">{formatDate(detail.completedAt)}</Typography>
            </Grid>
          </Grid>
        </SectionCard>

        {auth.role !== 'CLIENT' ? (
          <SectionCard title="Сменить статус" subtitle={`Доступно для роли ${auth.roleLabel}`}>
            <Box component="form" onSubmit={handleChangeStatus}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    select
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
                    label="Комментарий к смене статуса"
                    value={statusForm.comment}
                    onChange={(event) => setStatusForm((previous) => ({ ...previous, comment: event.target.value }))}
                    placeholder="Например: материалы получены, можно двигаться дальше"
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

        <SectionCard title="Комментарий" subtitle="Добавьте сообщение к заказу, чтобы оно попало в историю">
          <Box component="form" onSubmit={handleAddComment}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={8}>
                <TextField
                  label="Текст комментария"
                  value={commentForm.message}
                  onChange={(event) => setCommentForm((previous) => ({ ...previous, message: event.target.value }))}
                  placeholder="Например: согласовано с клиентом"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }} flexWrap="wrap">
                  {auth.role !== 'CLIENT' ? (
                    <Button
                      variant={commentForm.visibleToClient ? 'contained' : 'outlined'}
                      onClick={() => setCommentForm((previous) => ({ ...previous, visibleToClient: !previous.visibleToClient }))}
                    >
                      {commentForm.visibleToClient ? 'Виден клиенту' : 'Только для сотрудников'}
                    </Button>
                  ) : (
                    <Chip label="Комментарий увидит менеджер" color="primary" />
                  )}
                  <Button type="submit" variant="contained" disabled={actionLoading}>
                    Добавить
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </SectionCard>

        <Grid container spacing={2.2}>
          <Grid item xs={12} md={6}>
            <SectionCard title="История статусов" subtitle="Последовательность изменений по заказу">
              <Stack spacing={1.2}>
                {detail.history?.length ? (
                  detail.history.map((item) => (
                    <Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                      <Stack spacing={0.4}>
                        <Typography variant="subtitle2">{item.statusLabel}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.comment}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.changedByName} · {item.changedByRole} · {formatDateTime(item.changedAt)}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))
                ) : (
                  <EmptyState title="История пока пуста" subtitle="После смены статуса здесь появятся записи." />
                )}
              </Stack>
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Комментарии" subtitle="Внутренние и клиентские сообщения">
              <Stack spacing={1.2}>
                {detail.comments?.length ? (
                  detail.comments.map((item) => (
                    <Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                        <Box>
                          <Typography variant="subtitle2">{item.authorName}</Typography>
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
                  ))
                ) : (
                  <EmptyState title="Комментариев нет" subtitle="Добавьте первый комментарий, чтобы зафиксировать договоренности." />
                )}
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>
      </Stack>
    );
  };

  const renderOrdersWorkspace = (list) => (
    <Grid container spacing={2.2}>
      <Grid item xs={12} lg={4}>
        <SectionCard
          title={auth.role === 'EXECUTOR' ? 'Очередь задач' : auth.role === 'CLIENT' ? 'Мои заказы' : 'Список заказов'}
          subtitle="Откройте карточку, чтобы работать с деталями заказа"
          action={<Chip label={`${list.length}`} size="small" variant="outlined" />}
        >
          <TextField
            label="Поиск"
            value={orderSearch}
            onChange={(event) => setOrderSearch(event.target.value)}
            placeholder="Номер, название, статус"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          {renderOrderList(list)}
        </SectionCard>
      </Grid>
      <Grid item xs={12} lg={8}>
        {renderOrderDetail()}
      </Grid>
    </Grid>
  );

  const renderUsers = () => (
    <Grid container spacing={2.2}>
      <Grid item xs={12} md={5}>
        <SectionCard title="Новый пользователь" subtitle="Создание учетной записи сотрудника">
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
        <SectionCard title="Пользователи" subtitle="Аккаунты сотрудников и их роли">
          <Stack spacing={1.2}>
            {data.users.length ? (
              data.users.map((user) => (
                <Paper key={user.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Box>
                      <Typography variant="subtitle1">{user.fullName}</Typography>
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
              ))
            ) : (
              <EmptyState title="Пользователей нет" subtitle="После создания сотрудников они появятся здесь." />
            )}
          </Stack>
        </SectionCard>
      </Grid>
    </Grid>
  );

  const renderClients = () => (
    <Grid container spacing={2.2}>
      <Grid item xs={12} md={5}>
        <SectionCard title="Новый клиент" subtitle="Добавление компании-заказчика">
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
          <Stack spacing={1.2}>
            {data.clients.length ? (
              data.clients.map((client) => (
                <Paper key={client.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Box>
                      <Typography variant="subtitle1">{client.name}</Typography>
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
              ))
            ) : (
              <EmptyState title="Клиентов нет" subtitle="Добавьте компанию, чтобы можно было создавать заказы." />
            )}
          </Stack>
        </SectionCard>
      </Grid>
    </Grid>
  );

  const renderStatuses = () => (
    <Grid container spacing={2.2}>
      <Grid item xs={12} md={6}>
        <SectionCard title="Статусы заказа" subtitle="Производственный цикл и доступные этапы">
          <Stack spacing={1.2}>
            {data.statuses.map((status) => (
              <Paper key={status.value} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                  <Typography variant="body2" fontWeight={600}>
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
        <SectionCard title="Роли и действия" subtitle="Что доступно каждой роли в системе">
          <Stack spacing={1.2}>
            {tabs.map((item) => (
              <Paper key={item.value} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Typography variant="subtitle2">{item.label}</Typography>
              </Paper>
            ))}
          </Stack>
        </SectionCard>
      </Grid>
    </Grid>
  );

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,0.88)',
          color: 'text.primary',
          backdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(95,99,104,0.14)',
          zIndex: (themeValue) => themeValue.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: 76 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
            {!isDesktop ? (
              <IconButton onClick={() => setDrawerOpen(true)} edge="start" sx={{ mr: 0.25 }}>
                <MenuRoundedIcon />
              </IconButton>
            ) : null}
            <Avatar sx={{ bgcolor: 'primary.main', width: 42, height: 42 }}>И</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" noWrap>
                ПК «Импульс»
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                Управление заказами и статусами
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ flex: 1 }} />
          <Chip label={auth.roleLabel} color="primary" variant="outlined" sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />
          <Button startIcon={<RefreshRoundedIcon />} onClick={handleRefresh}>
            Обновить
          </Button>
          <Button startIcon={<LogoutRoundedIcon />} onClick={onLogout}>
            Выйти
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop ? true : drawerOpen}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(95,99,104,0.14)',
            bgcolor: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(18px)',
            top: isDesktop ? 76 : 0,
            height: isDesktop ? 'calc(100% - 76px)' : '100%',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box sx={{ ml: { lg: `${drawerWidth}px` } }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Stack spacing={2.2}>
            <Paper sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(18px)' }}>
              <Stack spacing={1}>
                <Typography variant="h5">{pageMeta.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {pageMeta.subtitle}
                </Typography>
              </Stack>
            </Paper>

            {loading ? <LinearProgress sx={{ borderRadius: 999 }} /> : null}
            {apiError ? <Alert severity={apiErrorSeverity}>{apiError}</Alert> : null}

            {tab === 'dashboard' ? renderDashboard() : null}
            {tab === 'orders' || tab === 'tasks' ? renderOrdersWorkspace(auth.role === 'CLIENT' ? data.orders : filteredOrders) : null}
            {tab === 'create-order' ? (
              <SectionCard title="Новый заказ" subtitle="Заполните карточку один раз, дальше заказ пойдет по маршруту">
                <Box component="form" onSubmit={handleCreateOrder}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField
                        label="Номер заказа"
                        value={createOrderForm.orderNumber}
                        onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, orderNumber: event.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <TextField
                        label="Название"
                        value={createOrderForm.title}
                        onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, title: event.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Описание"
                        value={createOrderForm.description}
                        onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, description: event.target.value }))}
                        multiline
                        minRows={4}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField select label="Клиент" value={createOrderForm.clientCompanyId} onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, clientCompanyId: event.target.value }))}>
                        {data.clients.map((client) => (
                          <MenuItem key={client.id} value={client.id}>
                            {client.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField select label="Менеджер" value={createOrderForm.managerId} onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, managerId: event.target.value }))}>
                        {byRole(data.users, 'MANAGER').map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.fullName}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField select label="Исполнитель" value={createOrderForm.executorId} onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, executorId: event.target.value }))}>
                        {byRole(data.users, 'EXECUTOR').map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.fullName}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField select label="Приоритет" value={createOrderForm.priority} onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, priority: event.target.value }))}>
                        {data.priorities.map((priority) => (
                          <MenuItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        type="date"
                        label="План"
                        InputLabelProps={{ shrink: true }}
                        value={createOrderForm.plannedDate}
                        onChange={(event) => setCreateOrderForm((previous) => ({ ...previous, plannedDate: event.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
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
        </Container>
      </Box>

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
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
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
