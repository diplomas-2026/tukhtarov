import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  changeOrderStatus,
  clearAuthToken,
  createClient,
  createOrder,
  createUser,
  loadOrderChatMessages,
  loadOrderChatState,
  loadOrderDetails,
  loadWorkspaceData,
  login,
  me,
  register,
  setAuthToken,
  sendOrderChatMessage,
  loadSupportChatMessages,
  loadSupportChatState,
  sendSupportChatMessage,
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
    borderRadius: 16,
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
          borderRadius: 14,
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
          borderRadius: 14,
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
          borderRadius: 12,
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
          borderRadius: 12,
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
    { value: 'support-chat', label: 'Чаты клиентов', icon: <GroupRoundedIcon fontSize="small" /> },
  ],
  MANAGER: [
    { value: 'dashboard', label: 'Обзор', icon: <DashboardRoundedIcon fontSize="small" /> },
    { value: 'orders', label: 'Заказы', icon: <AssignmentRoundedIcon fontSize="small" /> },
    { value: 'create-order', label: 'Новый заказ', icon: <AddRoundedIcon fontSize="small" /> },
    { value: 'clients', label: 'Клиенты', icon: <BusinessRoundedIcon fontSize="small" /> },
    { value: 'support-chat', label: 'Чаты клиентов', icon: <GroupRoundedIcon fontSize="small" /> },
  ],
  EXECUTOR: [
    { value: 'dashboard', label: 'Обзор', icon: <DashboardRoundedIcon fontSize="small" /> },
    { value: 'tasks', label: 'Мои задачи', icon: <AssignmentRoundedIcon fontSize="small" /> },
    { value: 'statuses', label: 'Статусы', icon: <PendingActionsRoundedIcon fontSize="small" /> },
  ],
  CLIENT: [
    { value: 'dashboard', label: 'Обзор', icon: <DashboardRoundedIcon fontSize="small" /> },
    { value: 'orders', label: 'Мои заказы', icon: <AssignmentRoundedIcon fontSize="small" /> },
    { value: 'support-chat', label: 'Чат с поддержкой', icon: <GroupRoundedIcon fontSize="small" /> },
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
  'support-chat': {
    title: 'Чат поддержки',
    subtitle: 'Общий чат для связи клиента с менеджером или администратором.',
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

function getRoleLabel(role) {
  const labels = {
    ADMIN: 'Администратор',
    MANAGER: 'Менеджер',
    EXECUTOR: 'Исполнитель',
    CLIENT: 'Клиент',
  };
  return labels[role] || role;
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

function ChatPanel({
  title,
  subtitle,
  messages,
  loading,
  error,
  draft,
  onDraftChange,
  onSend,
  sending,
  scrollRef,
  currentRole,
  currentName,
}) {
  return (
    <SectionCard title={title} subtitle={subtitle}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}

        <Box
          ref={scrollRef}
          sx={{
            maxHeight: 420,
            overflowY: 'auto',
            pr: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {loading && !messages.length ? (
            <Box sx={{ py: 4, display: 'grid', placeItems: 'center' }}>
              <CircularProgress size={24} />
            </Box>
          ) : null}

          {!loading && !messages.length ? (
            <EmptyState
              title="Пока нет сообщений"
              subtitle="Напишите первое сообщение, чтобы начать диалог."
            />
          ) : null}

          {messages.map((message) => {
            const isMine = message.authorRole === currentRole && message.authorName === currentName;
            return (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    maxWidth: { xs: '100%', sm: '80%' },
                    borderRadius: '16px',
                    bgcolor: isMine ? 'rgba(26,115,232,0.08)' : '#fff',
                  }}
                >
                  <Stack spacing={0.75}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="subtitle2">{message.authorName}</Typography>
                      <Chip label={getRoleLabel(message.authorRole)} size="small" variant="outlined" />
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(message.createdAt)}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.message}
                    </Typography>
                  </Stack>
                </Paper>
              </Box>
            );
          })}
        </Box>

        <Divider />

        <Box component="form" onSubmit={onSend}>
          <Stack spacing={1.5}>
            <TextField
              label="Сообщение"
              value={draft}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder="Напишите сообщение"
              multiline
              minRows={3}
              maxRows={6}
            />
            <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} flexWrap="wrap">
              <Button type="submit" variant="contained" disabled={sending || !draft.trim()}>
                {sending ? 'Отправка...' : 'Отправить'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </SectionCard>
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
        borderRadius: '16px',
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

function normalizeSearchValue(value) {
  return String(value ?? '').trim().toLowerCase();
}

function compareText(a, b) {
  return String(a ?? '').localeCompare(String(b ?? ''), 'ru', { sensitivity: 'base' });
}

function compareDateValue(a, b) {
  const timeA = a ? new Date(a).getTime() : 0;
  const timeB = b ? new Date(b).getTime() : 0;
  return timeA - timeB;
}

function getPriorityWeight(priority) {
  const weights = {
    LOW: 1,
    NORMAL: 2,
    HIGH: 3,
    URGENT: 4,
  };
  return weights[priority] || 0;
}

function matchesSearch(fields, query) {
  if (!query) {
    return true;
  }
  return fields.some((field) => normalizeSearchValue(field).includes(query));
}

function ListControls({
  search,
  onSearchChange,
  searchLabel = 'Поиск',
  searchPlaceholder = 'Поиск по списку',
  sortValue,
  onSortChange,
  sortOptions = [],
  filters = [],
}) {
  return (
    <Stack spacing={1.5} sx={{ mb: 2 }}>
      <TextField
        label={searchLabel}
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
        {filters.map((filter) => (
          <TextField
            key={filter.label}
            select
            label={filter.label}
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
          >
            {filter.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        ))}
        {sortOptions.length ? (
          <TextField
            select
            label="Сортировка"
            value={sortValue}
            onChange={(event) => onSortChange(event.target.value)}
          >
            {sortOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        ) : null}
      </Stack>
    </Stack>
  );
}

function LandingPage({ onLogin, onRegister, snackbar, setSnackbar }) {
  const heroMetrics = [
    { value: '4 роли', label: 'Администратор, менеджер, исполнитель и клиент' },
    { value: '1 чат', label: 'Отдельный чат поддержки для связи клиента с командой' },
    { value: '5 сек', label: 'Автообновление чатов без WebSocket' },
  ];
  const featureCards = [
    {
      title: 'Понятный старт',
      text: 'Клиент регистрируется сам, входит в систему и сразу видит личный кабинет и чат поддержки.',
    },
    {
      title: 'Без лишних кнопок',
      text: 'Заказы, статусы и общение разделены по ролям, чтобы интерфейс был простым для обычных пользователей.',
    },
    {
      title: 'Для производства',
      text: 'Менеджер и администратор быстро переводят запрос в заказ и ведут его до отгрузки.',
    },
  ];
  const landingSteps = [
    'Клиент создает аккаунт и заходит в систему.',
    'Пишет запрос в чат поддержки и описывает задачу.',
    'Менеджер связывается с клиентом и запускает работу по заказу.',
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        px: 2,
        py: { xs: 2, md: 4 },
        background:
          'radial-gradient(circle at top left, rgba(26,115,232,0.14), transparent 32%), radial-gradient(circle at right 20%, rgba(15,157,88,0.12), transparent 24%), linear-gradient(180deg, #f8fbff 0%, #f6f8fc 100%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -120,
            left: -120,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(26,115,232,0.10)',
            filter: 'blur(4px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            right: -100,
            top: 140,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'rgba(15,157,88,0.12)',
            filter: 'blur(4px)',
          }}
        />
      </Box>

      <Container maxWidth="xl" sx={{ position: 'relative' }}>
        <Stack spacing={4}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>И</Avatar>
              <Box>
                <Typography variant="h6">ПК «Импульс»</Typography>
                <Typography variant="body2" color="text.secondary">
                  Управление заказами и клиентскими запросами
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Button variant="text" onClick={onLogin}>
                Войти
              </Button>
              <Button variant="contained" onClick={onRegister}>
                Регистрация
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={3} alignItems="stretch">
            <Grid item xs={12} lg={7}>
              <Stack spacing={3}>
                <Card
                  sx={{
                    overflow: 'hidden',
                    background:
                      'linear-gradient(135deg, rgba(26,115,232,0.98) 0%, rgba(26,115,232,0.86) 40%, rgba(15,157,88,0.90) 100%)',
                    color: '#fff',
                    minHeight: { xs: 'auto', lg: 540 },
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4, lg: 5 }, height: '100%' }}>
                    <Stack spacing={4} sx={{ height: '100%', justifyContent: 'space-between' }}>
                      <Stack spacing={2.2}>
                        <Chip
                          label="Лендинг для системы управления заказами"
                          sx={{
                            alignSelf: 'flex-start',
                            bgcolor: 'rgba(255,255,255,0.16)',
                            color: '#fff',
                            fontWeight: 600,
                          }}
                        />
                        <Typography
                          variant="h3"
                          sx={{
                            fontSize: { xs: '2.4rem', md: '3.4rem' },
                            lineHeight: 1.08,
                            maxWidth: 700,
                            fontWeight: 800,
                          }}
                        >
                          Заказы, чат с поддержкой и рабочий кабинет в одной удобной системе
                        </Typography>
                        <Typography variant="h6" sx={{ maxWidth: 680, fontWeight: 400, color: 'rgba(255,255,255,0.92)' }}>
                          Клиенты регистрируются сами, пишут запрос в общий чат, а менеджеры и администраторы превращают его в понятный рабочий процесс.
                        </Typography>
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button
                          variant="contained"
                          color="inherit"
                          onClick={onRegister}
                          sx={{ bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: '#f8fbff' } }}
                        >
                          Создать аккаунт
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={onLogin}
                          sx={{
                            borderColor: 'rgba(255,255,255,0.44)',
                            color: '#fff',
                            '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
                          }}
                        >
                          Войти в систему
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                <Grid container spacing={2.2}>
                  {heroMetrics.map((metric) => (
                    <Grid item xs={12} sm={4} key={metric.label}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 2.3 }}>
                          <Typography variant="h5" color="primary.main">
                            {metric.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                            {metric.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Grid container spacing={2.2}>
                  {featureCards.map((feature) => (
                    <Grid item xs={12} md={4} key={feature.title}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 2.4 }}>
                          <Stack spacing={1.1}>
                            <Typography variant="subtitle1">{feature.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {feature.text}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Card>
                  <CardContent sx={{ p: { xs: 2.6, md: 3 } }}>
                    <Stack spacing={1.8}>
                      <Typography variant="h6">Как работает сценарий для клиента</Typography>
                      <Stack spacing={1.2}>
                        {landingSteps.map((step, index) => (
                          <Stack key={step} direction="row" spacing={1.5} alignItems="flex-start">
                            <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
                              {index + 1}
                            </Avatar>
                            <Typography variant="body2" color="text.secondary" sx={{ pt: 0.3 }}>
                              {step}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            <Grid item xs={12} lg={5}>
              <Card sx={{ height: '100%', boxShadow: '0 24px 60px rgba(60,64,67,0.14)' }}>
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="h5">Что получает клиент</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                        Регистрация, вход и чат поддержки вынесены в отдельные экраны. После входа клиент открывает свой кабинет и пишет запрос менеджеру.
                      </Typography>
                    </Box>

                    <Stack spacing={1.5}>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
                        <Typography variant="subtitle2">1. Зарегистрироваться</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Создать аккаунт и сразу получить доступ к личному кабинету.
                        </Typography>
                      </Paper>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
                        <Typography variant="subtitle2">2. Написать запрос</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Отправить сообщение в чат поддержки и описать нужный заказ.
                        </Typography>
                      </Paper>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
                        <Typography variant="subtitle2">3. Получить ответ</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          Менеджер связывается с клиентом и запускает обработку запроса.
                        </Typography>
                      </Paper>
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                      <Button variant="contained" onClick={onRegister}>
                        Регистрация
                      </Button>
                      <Button variant="outlined" onClick={onLogin}>
                        Войти
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
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

const ROUTE_PATHS = {
  dashboard: '/',
  orders: '/orders',
  tasks: '/tasks',
  'create-order': '/create-order',
  users: '/users',
  clients: '/clients',
  statuses: '/statuses',
  'support-chat': '/chat',
};

function getNavigationState(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  const orderMatch = normalizedPath.match(/^\/orders\/(\d+)$/);
  if (orderMatch) {
    return { tab: 'orders', orderId: Number(orderMatch[1]) };
  }
  if (normalizedPath === '/orders') {
    return { tab: 'orders', orderId: null };
  }
  if (normalizedPath === '/tasks') {
    return { tab: 'tasks', orderId: null };
  }
  if (normalizedPath === '/create-order') {
    return { tab: 'create-order', orderId: null };
  }
  if (normalizedPath === '/users') {
    return { tab: 'users', orderId: null };
  }
  if (normalizedPath === '/clients') {
    return { tab: 'clients', orderId: null };
  }
  if (normalizedPath === '/statuses') {
    return { tab: 'statuses', orderId: null };
  }
  if (normalizedPath === '/chat') {
    return { tab: 'support-chat', orderId: null };
  }
  return { tab: 'dashboard', orderId: null };
}

function LoginScreen({ initialMode = 'login', onNavigate, onSuccess, snackbar, setSnackbar }) {
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    login: '',
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await login(loginForm.login, loginForm.password);
      setAuthToken(response.token);
      onSuccess(response.user, response.token);
    } catch (error) {
      setErrorMessage(error.message);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await register({
        login: registerForm.login,
        fullName: registerForm.fullName,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
        companyName: registerForm.companyName,
      });
      setAuthToken(response.token);
      onSuccess(response.user, response.token);
      setSnackbar({ open: true, message: 'Аккаунт создан', severity: 'success' });
    } catch (error) {
      setErrorMessage(error.message);
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
        background:
          'radial-gradient(circle at top left, rgba(26,115,232,0.12), transparent 30%), radial-gradient(circle at right 20%, rgba(15,157,88,0.10), transparent 24%), linear-gradient(180deg, #f8fbff 0%, #f6f8fc 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', width: 42, height: 42 }}>И</Avatar>
              <Box>
                <Typography variant="h6">ПК «Импульс»</Typography>
                <Typography variant="body2" color="text.secondary">
                  Авторизация и регистрация
                </Typography>
              </Box>
            </Stack>
            <Button variant="text" onClick={() => onNavigate('/')}>
              На главную
            </Button>
          </Stack>

          <Card sx={{ boxShadow: '0 24px 60px rgba(60,64,67,0.14)' }}>
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h5">{isLogin ? 'Войти в систему' : 'Регистрация клиента'}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                    {isLogin
                      ? 'Введите логин и пароль, чтобы открыть личный кабинет.'
                      : 'Создайте аккаунт, чтобы получить доступ к чату поддержки и личному кабинету.'}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button variant={isLogin ? 'contained' : 'outlined'} onClick={() => setMode('login')}>
                    Войти
                  </Button>
                  <Button variant={!isLogin ? 'contained' : 'outlined'} onClick={() => setMode('register')}>
                    Регистрация
                  </Button>
                </Stack>

                {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

                {isLogin ? (
                  <Box component="form" onSubmit={handleLoginSubmit}>
                    <Stack spacing={2}>
                      <TextField
                        label="Логин или email"
                        value={loginForm.login}
                        onChange={(event) => setLoginForm((previous) => ({ ...previous, login: event.target.value }))}
                        autoComplete="username"
                      />
                      <TextField
                        label="Пароль"
                        type="password"
                        value={loginForm.password}
                        onChange={(event) => setLoginForm((previous) => ({ ...previous, password: event.target.value }))}
                        autoComplete="current-password"
                      />
                      <Button type="submit" variant="contained" size="large" disabled={loading}>
                        {loading ? 'Выполняется вход...' : 'Войти'}
                      </Button>
                    </Stack>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handleRegisterSubmit}>
                    <Stack spacing={2}>
                      <TextField
                        label="Логин"
                        value={registerForm.login}
                        onChange={(event) => setRegisterForm((previous) => ({ ...previous, login: event.target.value }))}
                        autoComplete="username"
                      />
                      <TextField
                        label="ФИО"
                        value={registerForm.fullName}
                        onChange={(event) => setRegisterForm((previous) => ({ ...previous, fullName: event.target.value }))}
                        autoComplete="name"
                      />
                      <TextField
                        label="Email"
                        value={registerForm.email}
                        onChange={(event) => setRegisterForm((previous) => ({ ...previous, email: event.target.value }))}
                        autoComplete="email"
                      />
                      <TextField
                        label="Телефон"
                        value={registerForm.phone}
                        onChange={(event) => setRegisterForm((previous) => ({ ...previous, phone: event.target.value }))}
                        autoComplete="tel"
                      />
                      <TextField
                        label="Название компании"
                        value={registerForm.companyName}
                        onChange={(event) => setRegisterForm((previous) => ({ ...previous, companyName: event.target.value }))}
                      />
                      <TextField
                        label="Пароль"
                        type="password"
                        value={registerForm.password}
                        onChange={(event) => setRegisterForm((previous) => ({ ...previous, password: event.target.value }))}
                        autoComplete="new-password"
                      />
                      <Button type="submit" variant="contained" size="large" disabled={loading}>
                        {loading ? 'Создание...' : 'Создать аккаунт'}
                      </Button>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
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
  const initialNavigation = getNavigationState(window.location.pathname);
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
  const [selectedOrderId, setSelectedOrderId] = useState(initialNavigation.orderId);
  const [tab, setTab] = useState(initialNavigation.tab);
  const [orderFilters, setOrderFilters] = useState({
    search: '',
    sort: 'updatedDesc',
    status: 'ALL',
    priority: 'ALL',
  });
  const [userFilters, setUserFilters] = useState({
    search: '',
    sort: 'nameAsc',
    role: 'ALL',
    active: 'ALL',
  });
  const [clientFilters, setClientFilters] = useState({
    search: '',
    sort: 'nameAsc',
    city: 'ALL',
  });
  const [statusFilters, setStatusFilters] = useState({
    search: '',
    sort: 'labelAsc',
  });
  const [roleFilters, setRoleFilters] = useState({
    search: '',
    sort: 'labelAsc',
  });
  const [historyFilters, setHistoryFilters] = useState({
    search: '',
    sort: 'dateDesc',
  });
  const [chatFilters, setChatFilters] = useState({
    search: '',
    sort: 'dateAsc',
    role: 'ALL',
  });
  const [supportChatFilters, setSupportChatFilters] = useState({
    search: '',
    sort: 'dateAsc',
    role: 'ALL',
  });
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
  const [actionLoading, setActionLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiErrorSeverity, setApiErrorSeverity] = useState('error');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatDraft, setChatDraft] = useState('');
  const [chatLastMessageAt, setChatLastMessageAt] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatLastMessageAtRef = useRef(null);
  const chatScrollRef = useRef(null);
  const [selectedSupportCompanyId, setSelectedSupportCompanyId] = useState(
    auth.role === 'CLIENT' ? auth.clientCompanyId || '' : '',
  );
  const [supportChatMessages, setSupportChatMessages] = useState([]);
  const [supportChatDraft, setSupportChatDraft] = useState('');
  const [supportChatLastMessageAt, setSupportChatLastMessageAt] = useState(null);
  const [supportChatLoading, setSupportChatLoading] = useState(false);
  const [supportChatSending, setSupportChatSending] = useState(false);
  const [supportChatError, setSupportChatError] = useState('');
  const supportChatLastMessageAtRef = useRef(null);
  const supportChatScrollRef = useRef(null);

  const tabs = ROLE_TABS[auth.role] || ROLE_TABS.CLIENT;
  const allowedStatuses = useMemo(() => getAllowedStatuses(data.statuses, auth.role), [data.statuses, auth.role]);

  const filteredOrders = useMemo(() => {
    const query = normalizeSearchValue(orderFilters.search);
    const base = data.orders.filter((order) => {
      const statusMatch = orderFilters.status === 'ALL' || order.status === orderFilters.status;
      const priorityMatch = orderFilters.priority === 'ALL' || order.priority === orderFilters.priority;
      const searchMatch = matchesSearch(
        [
          order.orderNumber,
          order.title,
          order.clientName,
          order.statusLabel,
          order.priorityLabel,
          order.description,
        ],
        query,
      );
      return statusMatch && priorityMatch && searchMatch;
    });

    const sorted = [...base].sort((a, b) => {
      switch (orderFilters.sort) {
        case 'numberAsc':
          return compareText(a.orderNumber, b.orderNumber);
        case 'numberDesc':
          return compareText(b.orderNumber, a.orderNumber);
        case 'titleAsc':
          return compareText(a.title, b.title);
        case 'titleDesc':
          return compareText(b.title, a.title);
        case 'clientAsc':
          return compareText(a.clientName, b.clientName);
        case 'clientDesc':
          return compareText(b.clientName, a.clientName);
        case 'statusAsc':
          return compareText(a.statusLabel, b.statusLabel);
        case 'statusDesc':
          return compareText(b.statusLabel, a.statusLabel);
        case 'priorityAsc':
          return getPriorityWeight(a.priority) - getPriorityWeight(b.priority);
        case 'priorityDesc':
          return getPriorityWeight(b.priority) - getPriorityWeight(a.priority);
        case 'dueAsc':
          return compareDateValue(a.dueDate, b.dueDate);
        case 'dueDesc':
          return compareDateValue(b.dueDate, a.dueDate);
        case 'updatedAsc':
          return compareDateValue(a.createdAt, b.createdAt);
        case 'updatedDesc':
        default:
          return compareDateValue(b.createdAt, a.createdAt);
      }
    });

    return sorted;
  }, [data.orders, orderFilters]);

  const filteredUsers = useMemo(() => {
    const query = normalizeSearchValue(userFilters.search);
    const base = data.users.filter((user) => {
      const roleMatch = userFilters.role === 'ALL' || user.role === userFilters.role;
      const activeMatch =
        userFilters.active === 'ALL'
        || (userFilters.active === 'ACTIVE' && user.active)
        || (userFilters.active === 'INACTIVE' && !user.active);
      const searchMatch = matchesSearch(
        [user.fullName, user.login, user.email, user.phone, user.clientCompanyName, user.role],
        query,
      );
      return roleMatch && activeMatch && searchMatch;
    });

    return [...base].sort((a, b) => {
      switch (userFilters.sort) {
        case 'loginAsc':
          return compareText(a.login, b.login);
        case 'loginDesc':
          return compareText(b.login, a.login);
        case 'roleAsc':
          return compareText(a.role, b.role);
        case 'roleDesc':
          return compareText(b.role, a.role);
        case 'statusAsc':
          return compareText(String(a.active), String(b.active));
        case 'statusDesc':
          return compareText(String(b.active), String(a.active));
        case 'nameDesc':
          return compareText(b.fullName, a.fullName);
        case 'nameAsc':
        default:
          return compareText(a.fullName, b.fullName);
      }
    });
  }, [data.users, userFilters]);

  const filteredClients = useMemo(() => {
    const query = normalizeSearchValue(clientFilters.search);
    const base = data.clients.filter((client) => {
      const cityMatch = clientFilters.city === 'ALL' || client.city === clientFilters.city;
      const searchMatch = matchesSearch(
        [client.name, client.inn, client.contactPerson, client.phone, client.email, client.city],
        query,
      );
      return cityMatch && searchMatch;
    });

    return [...base].sort((a, b) => {
      switch (clientFilters.sort) {
        case 'nameDesc':
          return compareText(b.name, a.name);
        case 'cityAsc':
          return compareText(a.city, b.city);
        case 'cityDesc':
          return compareText(b.city, a.city);
        case 'ordersAsc':
          return (a.orderCount || 0) - (b.orderCount || 0);
        case 'ordersDesc':
          return (b.orderCount || 0) - (a.orderCount || 0);
        case 'nameAsc':
        default:
          return compareText(a.name, b.name);
      }
    });
  }, [clientFilters, data.clients]);

  const filteredStatuses = useMemo(() => {
    const query = normalizeSearchValue(statusFilters.search);
    const base = data.statuses.filter((status) => matchesSearch([status.label, status.value], query));
    return [...base].sort((a, b) => {
      switch (statusFilters.sort) {
        case 'valueAsc':
          return compareText(a.value, b.value);
        case 'valueDesc':
          return compareText(b.value, a.value);
        case 'labelDesc':
          return compareText(b.label, a.label);
        case 'labelAsc':
        default:
          return compareText(a.label, b.label);
      }
    });
  }, [data.statuses, statusFilters]);

  const filteredRoleTabs = useMemo(() => {
    const query = normalizeSearchValue(roleFilters.search);
    const base = tabs.filter((item) => matchesSearch([item.label, item.value], query));
    return [...base].sort((a, b) => {
      switch (roleFilters.sort) {
        case 'labelDesc':
          return compareText(b.label, a.label);
        case 'valueAsc':
          return compareText(a.value, b.value);
        case 'valueDesc':
          return compareText(b.value, a.value);
        case 'labelAsc':
        default:
          return compareText(a.label, b.label);
      }
    });
  }, [roleFilters.search, roleFilters.sort, tabs]);

  const filteredHistory = useMemo(() => {
    const detail = (selectedOrderId ? orderDetails[selectedOrderId] : null)
      || data.orders.find((order) => order.id === selectedOrderId)
      || null;
    const items = detail?.history || [];
    const query = normalizeSearchValue(historyFilters.search);
    const base = items.filter((item) =>
      matchesSearch([item.statusLabel, item.comment, item.changedByName, item.changedByRole], query),
    );

    return [...base].sort((a, b) => {
      switch (historyFilters.sort) {
        case 'dateAsc':
          return compareDateValue(a.changedAt, b.changedAt);
        case 'statusAsc':
          return compareText(a.statusLabel, b.statusLabel);
        case 'statusDesc':
          return compareText(b.statusLabel, a.statusLabel);
        case 'dateDesc':
        default:
          return compareDateValue(b.changedAt, a.changedAt);
      }
    });
  }, [historyFilters, selectedOrderId, orderDetails, data.orders]);

  const filteredChatMessages = useMemo(() => {
    const query = normalizeSearchValue(chatFilters.search);
    const base = chatMessages.filter((message) => {
      const roleMatch = chatFilters.role === 'ALL' || message.authorRole === chatFilters.role;
      const searchMatch = matchesSearch([message.authorName, message.authorRole, message.message], query);
      return roleMatch && searchMatch;
    });

    return [...base].sort((a, b) => {
      switch (chatFilters.sort) {
        case 'dateDesc':
          return compareDateValue(b.createdAt, a.createdAt);
        case 'authorAsc':
          return compareText(a.authorName, b.authorName);
        case 'authorDesc':
          return compareText(b.authorName, a.authorName);
        case 'dateAsc':
        default:
          return compareDateValue(a.createdAt, b.createdAt);
      }
    });
  }, [chatFilters, chatMessages]);

  const filteredSupportChatMessages = useMemo(() => {
    const query = normalizeSearchValue(supportChatFilters.search);
    const base = supportChatMessages.filter((message) => {
      const roleMatch = supportChatFilters.role === 'ALL' || message.authorRole === supportChatFilters.role;
      const searchMatch = matchesSearch([message.authorName, message.authorRole, message.message], query);
      return roleMatch && searchMatch;
    });

    return [...base].sort((a, b) => {
      switch (supportChatFilters.sort) {
        case 'dateDesc':
          return compareDateValue(b.createdAt, a.createdAt);
        case 'authorAsc':
          return compareText(a.authorName, b.authorName);
        case 'authorDesc':
          return compareText(b.authorName, a.authorName);
        case 'dateAsc':
        default:
          return compareDateValue(a.createdAt, b.createdAt);
      }
    });
  }, [supportChatFilters, supportChatMessages]);

  const orderStatusOptions = useMemo(
    () => [
      { value: 'ALL', label: 'Все статусы' },
      ...data.statuses.map((status) => ({ value: status.value, label: status.label })),
    ],
    [data.statuses],
  );

  const orderPriorityOptions = useMemo(
    () => [
      { value: 'ALL', label: 'Все приоритеты' },
      ...data.priorities.map((priority) => ({ value: priority.value, label: priority.label })),
    ],
    [data.priorities],
  );

  const userRoleOptions = useMemo(
    () => [
      { value: 'ALL', label: 'Все роли' },
      ...(data.roles.length
        ? data.roles
        : [
            { value: 'ADMIN', label: 'Администратор' },
            { value: 'MANAGER', label: 'Менеджер' },
            { value: 'EXECUTOR', label: 'Исполнитель' },
            { value: 'CLIENT', label: 'Клиент' },
          ]),
    ],
    [data.roles],
  );

  const clientCityOptions = useMemo(() => {
    const uniqueCities = [...new Set(data.clients.map((client) => client.city).filter(Boolean))].sort(compareText);
    return [
      { value: 'ALL', label: 'Все города' },
      ...uniqueCities.map((city) => ({ value: city, label: city })),
    ];
  }, [data.clients]);

  const chatRoleOptions = [
    { value: 'ALL', label: 'Все роли' },
    { value: 'ADMIN', label: 'Администратор' },
    { value: 'MANAGER', label: 'Менеджер' },
    { value: 'EXECUTOR', label: 'Исполнитель' },
    { value: 'CLIENT', label: 'Клиент' },
  ];

  const orderSortOptions = [
    { value: 'updatedDesc', label: 'Сначала новые' },
    { value: 'updatedAsc', label: 'Сначала старые' },
    { value: 'numberAsc', label: 'По номеру А-Я' },
    { value: 'numberDesc', label: 'По номеру Я-А' },
    { value: 'titleAsc', label: 'По названию А-Я' },
    { value: 'titleDesc', label: 'По названию Я-А' },
    { value: 'clientAsc', label: 'По клиенту А-Я' },
    { value: 'clientDesc', label: 'По клиенту Я-А' },
    { value: 'statusAsc', label: 'По статусу А-Я' },
    { value: 'statusDesc', label: 'По статусу Я-А' },
    { value: 'priorityAsc', label: 'По приоритету по возрастанию' },
    { value: 'priorityDesc', label: 'По приоритету по убыванию' },
    { value: 'dueAsc', label: 'По дедлайну ближе' },
    { value: 'dueDesc', label: 'По дедлайну дальше' },
  ];

  const userSortOptions = [
    { value: 'nameAsc', label: 'По имени А-Я' },
    { value: 'nameDesc', label: 'По имени Я-А' },
    { value: 'loginAsc', label: 'По логину А-Я' },
    { value: 'loginDesc', label: 'По логину Я-А' },
    { value: 'roleAsc', label: 'По роли А-Я' },
    { value: 'roleDesc', label: 'По роли Я-А' },
    { value: 'statusAsc', label: 'Сначала активные' },
    { value: 'statusDesc', label: 'Сначала отключённые' },
  ];

  const clientSortOptions = [
    { value: 'nameAsc', label: 'По названию А-Я' },
    { value: 'nameDesc', label: 'По названию Я-А' },
    { value: 'cityAsc', label: 'По городу А-Я' },
    { value: 'cityDesc', label: 'По городу Я-А' },
    { value: 'ordersAsc', label: 'По числу заказов по возрастанию' },
    { value: 'ordersDesc', label: 'По числу заказов по убыванию' },
  ];

  const statusSortOptions = [
    { value: 'labelAsc', label: 'По названию А-Я' },
    { value: 'labelDesc', label: 'По названию Я-А' },
    { value: 'valueAsc', label: 'По коду А-Я' },
    { value: 'valueDesc', label: 'По коду Я-А' },
  ];

  const roleSortOptions = [
    { value: 'labelAsc', label: 'По названию А-Я' },
    { value: 'labelDesc', label: 'По названию Я-А' },
    { value: 'valueAsc', label: 'По коду А-Я' },
    { value: 'valueDesc', label: 'По коду Я-А' },
  ];

  const historySortOptions = [
    { value: 'dateDesc', label: 'Сначала новые' },
    { value: 'dateAsc', label: 'Сначала старые' },
    { value: 'statusAsc', label: 'По статусу А-Я' },
    { value: 'statusDesc', label: 'По статусу Я-А' },
  ];

  const chatSortOptions = [
    { value: 'dateAsc', label: 'Сначала старые' },
    { value: 'dateDesc', label: 'Сначала новые' },
    { value: 'authorAsc', label: 'По автору А-Я' },
    { value: 'authorDesc', label: 'По автору Я-А' },
  ];

  const selectedOrderDetails = orderDetails[selectedOrderId] || null;
  const selectedOrder =
    selectedOrderDetails || data.orders.find((order) => order.id === selectedOrderId) || null;
  const canUseChat =
    Boolean(selectedOrderDetails) &&
    (auth.role === 'ADMIN'
      || (auth.role === 'MANAGER' && selectedOrderDetails.manager?.id === auth.id)
      || (auth.role === 'CLIENT' && selectedOrderDetails.clientCompany?.id === auth.clientCompanyId));
  const selectedSupportCompanyIdValue =
    auth.role === 'CLIENT' ? auth.clientCompanyId || '' : selectedSupportCompanyId;

  const showMessage = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, [setSnackbar]);

  const handleApiError = useCallback((error) => {
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
  }, [onLogout, showMessage]);

  useEffect(() => {
    const syncNavigationState = () => {
      const route = getNavigationState(window.location.pathname);
      setTab(route.tab);
      setSelectedOrderId(route.orderId);
    };

    syncNavigationState();
    window.addEventListener('popstate', syncNavigationState);
    return () => {
      window.removeEventListener('popstate', syncNavigationState);
    };
  }, []);

  const refreshWorkspace = async (preferOrderId = selectedOrderId) => {
    setApiError('');
    const workspace = await loadWorkspaceData(auth.role);
    setData(workspace);

    if (preferOrderId) {
      try {
        const detail = await loadOrderDetails(preferOrderId);
        setOrderDetails((previous) => ({ ...previous, [preferOrderId]: detail }));
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
    chatLastMessageAtRef.current = chatLastMessageAt;
  }, [chatLastMessageAt]);

  useEffect(() => {
    if (!selectedOrderId || !canUseChat) {
      setChatMessages([]);
      setChatDraft('');
      setChatLastMessageAt(null);
      setChatLoading(false);
      setChatError('');
      chatLastMessageAtRef.current = null;
      return;
    }

    let active = true;
    const syncChat = async () => {
      setChatLoading(true);
      setChatError('');
      try {
        await reloadChat(selectedOrderId);
      } catch (error) {
        if (active) {
          handleApiError(error);
          setChatError(error.message);
        }
      } finally {
        if (active) {
          setChatLoading(false);
        }
      }
    };

    syncChat();
    const intervalId = setInterval(async () => {
      if (!active) {
        return;
      }
      try {
        const state = await loadOrderChatState(selectedOrderId);
        const nextLastMessageAt = state?.lastMessageAt || null;
        if ((nextLastMessageAt || '') !== (chatLastMessageAtRef.current || '')) {
          await reloadChat(selectedOrderId);
        }
      } catch (error) {
        if (active && error?.status !== 401) {
          setChatError(error.message);
        } else if (error?.status === 401) {
          handleApiError(error);
        }
      }
    }, 5000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [selectedOrderId, canUseChat, handleApiError]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, selectedOrderId]);

  useEffect(() => {
    if (auth.role === 'CLIENT') {
      setSelectedSupportCompanyId(auth.clientCompanyId || '');
      return;
    }
    if (data.clients.length && !selectedSupportCompanyId) {
      setSelectedSupportCompanyId(String(data.clients[0].id));
    }
  }, [auth.clientCompanyId, auth.role, data.clients, selectedSupportCompanyId]);

  useEffect(() => {
    supportChatLastMessageAtRef.current = supportChatLastMessageAt;
  }, [supportChatLastMessageAt]);

  useEffect(() => {
    if (tab !== 'support-chat' || !selectedSupportCompanyIdValue) {
      setSupportChatMessages([]);
      setSupportChatDraft('');
      setSupportChatLastMessageAt(null);
      setSupportChatLoading(false);
      setSupportChatError('');
      supportChatLastMessageAtRef.current = null;
      return;
    }

    let active = true;
    const syncSupportChat = async () => {
      setSupportChatLoading(true);
      setSupportChatError('');
      try {
        await reloadSupportChat(selectedSupportCompanyIdValue);
      } catch (error) {
        if (active) {
          handleApiError(error);
          setSupportChatError(error.message);
        }
      } finally {
        if (active) {
          setSupportChatLoading(false);
        }
      }
    };

    syncSupportChat();
    const intervalId = setInterval(async () => {
      if (!active) {
        return;
      }
      try {
        const state = await loadSupportChatState(selectedSupportCompanyIdValue);
        const nextLastMessageAt = state?.lastMessageAt || null;
        if ((nextLastMessageAt || '') !== (supportChatLastMessageAtRef.current || '')) {
          await reloadSupportChat(selectedSupportCompanyIdValue);
        }
      } catch (error) {
        if (active && error?.status !== 401) {
          setSupportChatError(error.message);
        } else if (error?.status === 401) {
          handleApiError(error);
        }
      }
    }, 5000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [tab, selectedSupportCompanyIdValue, handleApiError]);

  useEffect(() => {
    if (supportChatScrollRef.current) {
      supportChatScrollRef.current.scrollTop = supportChatScrollRef.current.scrollHeight;
    }
  }, [supportChatMessages, selectedSupportCompanyIdValue]);

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

  const reloadChat = async (orderId) => {
    const [messages, state] = await Promise.all([
      loadOrderChatMessages(orderId),
      loadOrderChatState(orderId),
    ]);
    const nextLastMessageAt = state?.lastMessageAt || null;
    setChatError('');
    setChatMessages(messages);
    setChatLastMessageAt(nextLastMessageAt);
    chatLastMessageAtRef.current = nextLastMessageAt;
  };

  const handleSendChatMessage = async (event) => {
    event.preventDefault();
    if (!selectedOrderId || !chatDraft.trim() || !canUseChat) {
      return;
    }

    setChatSending(true);
    setChatError('');
    try {
      await sendOrderChatMessage(selectedOrderId, {
        message: chatDraft.trim(),
      });
      setChatDraft('');
      await reloadChat(selectedOrderId);
    } catch (error) {
      handleApiError(error);
      setChatError(error.message);
    } finally {
      setChatSending(false);
    }
  };

  const reloadSupportChat = async (clientCompanyId) => {
    const [messages, state] = await Promise.all([
      loadSupportChatMessages(clientCompanyId),
      loadSupportChatState(clientCompanyId),
    ]);
    const nextLastMessageAt = state?.lastMessageAt || null;
    setSupportChatError('');
    setSupportChatMessages(messages);
    setSupportChatLastMessageAt(nextLastMessageAt);
    supportChatLastMessageAtRef.current = nextLastMessageAt;
  };

  const handleSendSupportChatMessage = async (event) => {
    event.preventDefault();
    if (!selectedSupportCompanyIdValue || !supportChatDraft.trim()) {
      return;
    }

    setSupportChatSending(true);
    setSupportChatError('');
    try {
      await sendSupportChatMessage(selectedSupportCompanyIdValue, {
        message: supportChatDraft.trim(),
      });
      setSupportChatDraft('');
      await reloadSupportChat(selectedSupportCompanyIdValue);
    } catch (error) {
      handleApiError(error);
      setSupportChatError(error.message);
    } finally {
      setSupportChatSending(false);
    }
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
      navigateToOrder(created.id);
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
    const path = ROUTE_PATHS[value] || '/';
    window.history.pushState({}, '', path);
    setSelectedOrderId(null);
    setTab(value);
    if (!isDesktop) {
      setDrawerOpen(false);
    }
  };

  const navigateToOrder = (orderId) => {
    window.history.pushState({}, '', `/orders/${orderId}`);
    setTab('orders');
    setSelectedOrderId(orderId);
    if (!isDesktop) {
      setDrawerOpen(false);
    }
  };

  const navigateBackToOrders = () => {
    window.history.pushState({}, '', '/orders');
    setTab('orders');
    setSelectedOrderId(null);
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
            {getRoleLabel(auth.role)}
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
                  borderRadius: '14px',
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
    const recentOrders = filteredOrders.slice(0, 4);

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
                    label={getRoleLabel(auth.role)}
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
                  {auth.role === 'CLIENT' ? (
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.92)', maxWidth: 720 }}>
                      Для нового заказа напишите запрос в чат поддержки, и менеджер свяжется с вами.
                    </Typography>
                  ) : null}
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack spacing={1.5}>
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
                        sx={{ mt: 1, height: 8, borderRadius: '12px', bgcolor: 'rgba(26,115,232,0.08)' }}
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
                        sx={{ mt: 1, height: 8, borderRadius: '12px', bgcolor: 'rgba(15,157,88,0.08)' }}
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
          <ListControls
            search={orderFilters.search}
            onSearchChange={(value) => setOrderFilters((previous) => ({ ...previous, search: value }))}
            searchLabel="Поиск заказов"
            searchPlaceholder="Номер, название, клиент"
            sortValue={orderFilters.sort}
            onSortChange={(value) => setOrderFilters((previous) => ({ ...previous, sort: value }))}
            sortOptions={orderSortOptions}
          />
          <Stack spacing={1.5}>
            {recentOrders.length ? (
              recentOrders.map((order) => (
                <Paper
                  key={order.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 10px 30px rgba(60,64,67,0.12)',
                    },
                  }}
                  onClick={() => navigateToOrder(order.id)}
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
              onClick={() => navigateToOrder(order.id)}
              sx={{
                p: 2,
                cursor: 'pointer',
                borderRadius: '14px',
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
      return null;
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
          <SectionCard title="Сменить статус" subtitle={`Доступно для роли ${getRoleLabel(auth.role)}`}>
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

        <SectionCard title="История статусов" subtitle="Последовательность изменений по заказу">
          <ListControls
            search={historyFilters.search}
            onSearchChange={(value) => setHistoryFilters((previous) => ({ ...previous, search: value }))}
            searchLabel="Поиск по истории"
            searchPlaceholder="Статус, комментарий, автор"
            sortValue={historyFilters.sort}
            onSortChange={(value) => setHistoryFilters((previous) => ({ ...previous, sort: value }))}
            sortOptions={historySortOptions}
          />
          <Stack spacing={1.2}>
            {filteredHistory.length ? (
              filteredHistory.map((item) => (
                <Paper key={item.id} variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
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
      </Stack>
    );
  };

  const renderChatSection = () => {
    if (!selectedOrderId || !canUseChat) {
      return null;
    }

    return (
      <Stack spacing={2.2}>
        <ListControls
          search={chatFilters.search}
          onSearchChange={(value) => setChatFilters((previous) => ({ ...previous, search: value }))}
          searchLabel="Поиск в чате"
          searchPlaceholder="Автор, роль, сообщение"
          sortValue={chatFilters.sort}
          onSortChange={(value) => setChatFilters((previous) => ({ ...previous, sort: value }))}
          sortOptions={chatSortOptions}
          filters={[
            {
              label: 'Роль',
              value: chatFilters.role,
              onChange: (value) => setChatFilters((previous) => ({ ...previous, role: value })),
              options: chatRoleOptions,
            },
          ]}
        />
        <ChatPanel
          title="Чат заказа"
          subtitle="Сообщения в этом чате доступны администратору, менеджеру этого заказа и клиенту этого заказа."
          messages={filteredChatMessages}
          loading={chatLoading}
          error={chatError}
          draft={chatDraft}
          onDraftChange={setChatDraft}
          onSend={handleSendChatMessage}
          sending={chatSending}
          scrollRef={chatScrollRef}
          currentRole={auth.role}
          currentName={auth.fullName}
        />
      </Stack>
    );
  };

  const renderSupportChatSection = () => {
    if (auth.role !== 'ADMIN' && auth.role !== 'MANAGER' && auth.role !== 'CLIENT') {
      return null;
    }

    if (!selectedSupportCompanyIdValue) {
      return (
        <SectionCard
          title="Чат поддержки"
          subtitle="Выберите клиента, чтобы открыть его общий чат."
        >
          <EmptyState
            title="Нет клиента для чата"
            subtitle="Пока нет доступных компаний-заказчиков."
          />
        </SectionCard>
      );
    }

    return (
      <Stack spacing={2.2}>
        {auth.role !== 'CLIENT' ? (
          <SectionCard title="Клиент для чата" subtitle="Выберите компанию, чтобы открыть её общий чат поддержки.">
            <TextField
              select
              label="Компания"
              value={String(selectedSupportCompanyIdValue)}
              onChange={(event) => setSelectedSupportCompanyId(event.target.value)}
              fullWidth
            >
              {data.clients.map((client) => (
                <MenuItem key={client.id} value={String(client.id)}>
                  {client.name}
                </MenuItem>
              ))}
            </TextField>
          </SectionCard>
        ) : null}
        <ListControls
          search={supportChatFilters.search}
          onSearchChange={(value) => setSupportChatFilters((previous) => ({ ...previous, search: value }))}
          searchLabel="Поиск в чате"
          searchPlaceholder="Автор, роль, сообщение"
          sortValue={supportChatFilters.sort}
          onSortChange={(value) => setSupportChatFilters((previous) => ({ ...previous, sort: value }))}
          sortOptions={chatSortOptions}
          filters={[
            {
              label: 'Роль',
              value: supportChatFilters.role,
              onChange: (value) => setSupportChatFilters((previous) => ({ ...previous, role: value })),
              options: chatRoleOptions,
            },
          ]}
        />
        <ChatPanel
          title="Чат поддержки"
          subtitle="Здесь клиент пишет запрос на новый заказ, а менеджер или администратор отвечает в том же диалоге."
          messages={filteredSupportChatMessages}
          loading={supportChatLoading}
          error={supportChatError}
          draft={supportChatDraft}
          onDraftChange={setSupportChatDraft}
          onSend={handleSendSupportChatMessage}
          sending={supportChatSending}
          scrollRef={supportChatScrollRef}
          currentRole={auth.role}
          currentName={auth.fullName}
        />
      </Stack>
    );
  };

  const renderOrdersWorkspace = (list) => (
    <Grid container spacing={2.2}>
      <Grid item xs={12} lg={auth.role === 'CLIENT' ? 12 : 4}>
        <SectionCard
          title={auth.role === 'EXECUTOR' ? 'Очередь задач' : auth.role === 'CLIENT' ? 'Мои заказы' : 'Список заказов'}
          subtitle="Откройте карточку, чтобы работать с деталями заказа"
          action={<Chip label={`${list.length}`} size="small" variant="outlined" />}
        >
          <ListControls
            search={orderFilters.search}
            onSearchChange={(value) => setOrderFilters((previous) => ({ ...previous, search: value }))}
            searchLabel="Поиск заказов"
            searchPlaceholder="Номер, название, клиент"
            sortValue={orderFilters.sort}
            onSortChange={(value) => setOrderFilters((previous) => ({ ...previous, sort: value }))}
            sortOptions={orderSortOptions}
            filters={[
              {
                label: 'Статус',
                value: orderFilters.status,
                onChange: (value) => setOrderFilters((previous) => ({ ...previous, status: value })),
                options: orderStatusOptions,
              },
              {
                label: 'Приоритет',
                value: orderFilters.priority,
                onChange: (value) => setOrderFilters((previous) => ({ ...previous, priority: value })),
                options: orderPriorityOptions,
              },
            ]}
          />
          {renderOrderList(list)}
        </SectionCard>
      </Grid>
      {auth.role !== 'CLIENT' ? (
        <Grid item xs={12} lg={8}>
          {renderOrderDetail()}
        </Grid>
      ) : null}
    </Grid>
  );

  const renderOrderPage = () => {
    if (!selectedOrderId) {
      return null;
    }

    if (!selectedOrder) {
      return (
        <SectionCard
          title="Заказ не найден"
          subtitle="Возможно, карточка была удалена или доступ к ней ограничен."
          action={
            <Button variant="outlined" onClick={navigateBackToOrders}>
              Назад к заказам
            </Button>
          }
        >
          <EmptyState title="Карточка недоступна" subtitle="Вернитесь к списку заказов и выберите другую карточку." />
        </SectionCard>
      );
    }

    return (
      <Stack spacing={2.2}>
        <Paper sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(18px)' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h5">
                {selectedOrder.orderNumber} · {selectedOrder.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Отдельная страница заказа с полным контекстом, историей и комментариями.
              </Typography>
            </Box>
            <Button variant="outlined" onClick={navigateBackToOrders}>
              Назад к списку
            </Button>
          </Stack>
        </Paper>
        {renderOrderDetail()}
        {renderChatSection()}
      </Stack>
    );
  };

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
          <ListControls
            search={userFilters.search}
            onSearchChange={(value) => setUserFilters((previous) => ({ ...previous, search: value }))}
            searchLabel="Поиск пользователей"
            searchPlaceholder="Имя, логин, email, телефон"
            sortValue={userFilters.sort}
            onSortChange={(value) => setUserFilters((previous) => ({ ...previous, sort: value }))}
            sortOptions={userSortOptions}
            filters={[
              {
                label: 'Роль',
                value: userFilters.role,
                onChange: (value) => setUserFilters((previous) => ({ ...previous, role: value })),
                options: userRoleOptions,
              },
              {
                label: 'Состояние',
                value: userFilters.active,
                onChange: (value) => setUserFilters((previous) => ({ ...previous, active: value })),
                options: [
                  { value: 'ALL', label: 'Все' },
                  { value: 'ACTIVE', label: 'Активные' },
                  { value: 'INACTIVE', label: 'Отключённые' },
                ],
              },
            ]}
          />
          <Stack spacing={1.2}>
            {filteredUsers.length ? (
              filteredUsers.map((user) => (
                <Paper key={user.id} variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Box>
                      <Typography variant="subtitle1">{user.fullName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user.email} · {user.phone}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap justifyContent="flex-end">
                      <Chip label={getRoleLabel(user.role)} color="primary" size="small" />
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
          <ListControls
            search={clientFilters.search}
            onSearchChange={(value) => setClientFilters((previous) => ({ ...previous, search: value }))}
            searchLabel="Поиск клиентов"
            searchPlaceholder="Название, ИНН, контакт, город"
            sortValue={clientFilters.sort}
            onSortChange={(value) => setClientFilters((previous) => ({ ...previous, sort: value }))}
            sortOptions={clientSortOptions}
            filters={[
              {
                label: 'Город',
                value: clientFilters.city,
                onChange: (value) => setClientFilters((previous) => ({ ...previous, city: value })),
                options: clientCityOptions,
              },
            ]}
          />
          <Stack spacing={1.2}>
            {filteredClients.length ? (
              filteredClients.map((client) => (
                <Paper key={client.id} variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
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
          <ListControls
            search={statusFilters.search}
            onSearchChange={(value) => setStatusFilters((previous) => ({ ...previous, search: value }))}
            searchLabel="Поиск статусов"
            searchPlaceholder="Название или код статуса"
            sortValue={statusFilters.sort}
            onSortChange={(value) => setStatusFilters((previous) => ({ ...previous, sort: value }))}
            sortOptions={statusSortOptions}
          />
          <Stack spacing={1.2}>
            {filteredStatuses.map((status) => (
              <Paper key={status.value} variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
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
          <ListControls
            search={roleFilters.search}
            onSearchChange={(value) => setRoleFilters((previous) => ({ ...previous, search: value }))}
            searchLabel="Поиск ролей"
            searchPlaceholder="Название роли"
            sortValue={roleFilters.sort}
            onSortChange={(value) => setRoleFilters((previous) => ({ ...previous, sort: value }))}
            sortOptions={roleSortOptions}
          />
          <Stack spacing={1.2}>
            {filteredRoleTabs.map((item) => (
              <Paper key={item.value} variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
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
          <Chip label={getRoleLabel(auth.role)} color="primary" variant="outlined" sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />
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

            {loading ? <LinearProgress sx={{ borderRadius: '12px' }} /> : null}
            {apiError ? <Alert severity={apiErrorSeverity}>{apiError}</Alert> : null}

            {tab === 'dashboard' ? renderDashboard() : null}
            {selectedOrderId ? renderOrderPage() : null}
            {!selectedOrderId && (tab === 'orders' || tab === 'tasks') ? renderOrdersWorkspace(auth.role === 'CLIENT' ? data.orders : filteredOrders) : null}
            {!selectedOrderId && tab === 'support-chat' ? renderSupportChatSection() : null}
            {!selectedOrderId && tab === 'create-order' ? (
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
            {!selectedOrderId && tab === 'users' ? renderUsers() : null}
            {!selectedOrderId && tab === 'clients' ? renderClients() : null}
            {!selectedOrderId && tab === 'statuses' ? renderStatuses() : null}
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
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const syncPath = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', syncPath);

    const token = localStorage.getItem('tukhtarov_token');
    if (!token) {
      setBootstrapping(false);
      return () => {
        window.removeEventListener('popstate', syncPath);
      };
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
    return () => {
      window.removeEventListener('popstate', syncPath);
    };
  }, []);

  const navigateTo = (path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
    }
  };

  const handleLoginSuccess = (user, token) => {
    setAuth(user);
    setAuthToken(token);
    navigateTo('/');
  };

  const handleLogout = () => {
    clearAuthToken();
    setAuth(null);
    navigateTo('/');
  };

  const normalizedPath = currentPath.replace(/\/+$/, '') || '/';
  const isLandingPage = normalizedPath === '/';
  const initialAuthMode = normalizedPath === '/register' ? 'register' : 'login';

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
      ) : isLandingPage ? (
        <LandingPage
          onLogin={() => navigateTo('/login')}
          onRegister={() => navigateTo('/register')}
          snackbar={snackbar}
          setSnackbar={setSnackbar}
        />
      ) : (
        <LoginScreen
          initialMode={initialAuthMode}
          onNavigate={navigateTo}
          onSuccess={handleLoginSuccess}
          snackbar={snackbar}
          setSnackbar={setSnackbar}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
