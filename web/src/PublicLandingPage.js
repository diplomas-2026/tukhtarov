import { useMemo } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

export default function PublicLandingPage({ onLogin, onRegister, snackbar, setSnackbar }) {
  const services = useMemo(() => ([
    { title: 'Изготовление по чертежам', text: 'Индивидуальные изделия, узлы и сборки по вашим требованиям и срокам.' },
    { title: 'Металлоконструкции', text: 'Каркасы, корпуса, крепежные элементы и серийные позиции для производства.' },
    { title: 'Согласование заявок', text: 'Единый канал связи с менеджером без долгих звонков и потерянной переписки.' },
  ]), []);

  const advantages = useMemo(() => ([
    'Быстрый старт заявки через личный кабинет',
    'Понятный путь от запроса до готового заказа',
    'История сообщений и статусов в одном месте',
    'Контроль сроков и этапов выполнения',
  ]), []);

  const processSteps = useMemo(() => ([
    'Создаёте аккаунт или сразу входите в кабинет.',
    'Отправляете запрос в чат и описываете задачу.',
    'Менеджер отвечает, согласует детали и запускает заказ.',
  ]), []);

  const testimonials = useMemo(() => ([
    { name: 'Алексей, ООО «ПромТех»', text: 'Удобно, что можно быстро оставить запрос и получить ответ без долгой переписки.' },
    { name: 'Марина, снабжение', text: 'Стало проще согласовывать сроки: все сообщения и статусы видны в одном месте.' },
    { name: 'Игорь, производственный отдел', text: 'Понравилось, что карточка заказа всегда под рукой и ничего не теряется.' },
  ]), []);

  const faqItems = useMemo(() => ([
    { question: 'Как оставить заявку?', answer: 'Создайте аккаунт или войдите в систему, затем отправьте сообщение в чат поддержки с описанием задачи.' },
    { question: 'Нужно ли звонить менеджеру?', answer: 'Нет, менеджер ответит в чате и при необходимости переведет запрос в заказ.' },
    { question: 'Где смотреть статус заказа?', answer: 'После входа вы увидите свои заказы и сможете открыть карточку с подробностями и историей.' },
  ]), []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        px: { xs: 2, sm: 3, md: 4, xl: 6 },
        py: { xs: 2, md: 4 },
        background:
          'radial-gradient(circle at top left, rgba(26,115,232,0.14), transparent 32%), radial-gradient(circle at right 20%, rgba(15,157,88,0.12), transparent 24%), linear-gradient(180deg, #f8fbff 0%, #f6f8fc 100%)',
      }}
    >
      <Box sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -120, left: -120, width: 320, height: 320, borderRadius: '50%', background: 'rgba(26,115,232,0.10)', filter: 'blur(4px)' }} />
        <Box sx={{ position: 'absolute', right: -100, top: 140, width: 260, height: 260, borderRadius: '50%', background: 'rgba(15,157,88,0.12)', filter: 'blur(4px)' }} />
      </Box>

      <Box sx={{ position: 'relative', width: '100%' }}>
        <Stack spacing={6}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 1, width: '100%' }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>И</Avatar>
              <Box>
                <Typography variant="h6">ПК «Импульс»</Typography>
                <Typography variant="body2" color="text.secondary">
                  Производство и сопровождение заказов под ключ
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Button variant="text" onClick={onLogin}>Войти</Button>
              <Button variant="contained" onClick={onRegister}>Регистрация</Button>
            </Stack>
          </Stack>

          <Card sx={{ overflow: 'hidden', background: 'linear-gradient(135deg, rgba(26,115,232,0.98) 0%, rgba(26,115,232,0.86) 45%, rgba(15,157,88,0.90) 100%)', color: '#fff', boxShadow: '0 24px 60px rgba(60,64,67,0.14)' }}>
            <CardContent sx={{ p: { xs: 3, md: 4, xl: 5 } }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} lg={7}>
                  <Stack spacing={3}>
                    <Chip
                      label="Заявка на производство без лишней переписки"
                      sx={{ alignSelf: 'flex-start', bgcolor: 'rgba(255,255,255,0.16)', color: '#fff', fontWeight: 600 }}
                    />
                    <Typography variant="h3" sx={{ fontSize: { xs: '2.4rem', md: '3.4rem', xl: '3.9rem' }, lineHeight: 1.05, maxWidth: 820, fontWeight: 800 }}>
                      Производим, согласовываем и ведем заказы так, чтобы клиенту было просто и понятно
                    </Typography>
                    <Typography variant="h6" sx={{ maxWidth: 760, fontWeight: 400, color: 'rgba(255,255,255,0.92)' }}>
                      Оставьте заявку, напишите в чат и получите понятный маршрут по заказу, срокам и статусу выполнения.
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <Button variant="contained" color="inherit" onClick={onRegister} sx={{ bgcolor: '#fff', color: 'primary.main', '&:hover': { bgcolor: '#f8fbff' } }}>
                        Оставить заявку
                      </Button>
                      <Button variant="outlined" onClick={onLogin} sx={{ borderColor: 'rgba(255,255,255,0.44)', color: '#fff', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}>
                        Войти в кабинет
                      </Button>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid item xs={12} lg={5}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: '22px', bgcolor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)', color: '#fff' }}>
                    <Stack spacing={2.1}>
                      <Typography variant="subtitle1" sx={{ color: '#fff' }}>Что получает клиент</Typography>
                      <Stack spacing={1.2}>
                        {advantages.map((item) => (
                          <Stack key={item} direction="row" spacing={1.2} alignItems="flex-start">
                            <CheckCircleRoundedIcon fontSize="small" />
                            <Typography variant="body2" sx={{ pt: 0.1, color: 'rgba(255,255,255,0.92)' }}>{item}</Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Stack spacing={2.2} sx={{ width: '100%' }}>
            {services.map((service, index) => (
              <Card key={service.title} sx={{ width: '100%' }}>
                <CardContent sx={{ p: 2.6 }}>
                  <Stack spacing={1.3}>
                    <Avatar
                      sx={{
                        bgcolor: index === 0 ? alpha('#1a73e8', 0.12) : index === 1 ? alpha('#0f9d58', 0.12) : alpha('#f29900', 0.12),
                        color: index === 0 ? '#1a73e8' : index === 1 ? '#0f9d58' : '#f29900',
                        width: 42,
                        height: 42,
                      }}
                    >
                      <CheckCircleRoundedIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="subtitle1">{service.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{service.text}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Stack spacing={2.2} sx={{ width: '100%' }}>
            <Card sx={{ width: '100%' }}>
              <CardContent sx={{ p: { xs: 2.6, md: 3 } }}>
                <Stack spacing={2}>
                  <Typography variant="h6">Как все происходит</Typography>
                  <Stack spacing={1.3}>
                    {processSteps.map((step, index) => (
                      <Paper key={step} variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.8rem' }}>{index + 1}</Avatar>
                          <Typography variant="body2" color="text.secondary" sx={{ pt: 0.3 }}>{step}</Typography>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ width: '100%' }}>
              <CardContent sx={{ p: { xs: 2.6, md: 3 } }}>
                <Stack spacing={2}>
                  <Typography variant="h6">Почему нас выбирают</Typography>
                  <Stack spacing={1.2}>
                    {advantages.map((item) => (
                      <Paper key={item} variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
                        <Typography variant="body2">{item}</Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          <Card sx={{ width: '100%' }}>
            <CardContent sx={{ p: { xs: 2.6, md: 3 } }}>
              <Stack spacing={2.4}>
                <Typography variant="h6">Отзывы клиентов</Typography>
                <Stack spacing={2.2}>
                  {testimonials.map((item) => (
                    <Paper key={item.name} variant="outlined" sx={{ p: 2.4, borderRadius: '14px' }}>
                      <Stack spacing={1.2}>
                        <Typography variant="subtitle2">{item.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.text}</Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Stack spacing={2.2} sx={{ width: '100%' }}>
            <Card sx={{ width: '100%' }}>
              <CardContent sx={{ p: { xs: 2.6, md: 3 } }}>
                <Stack spacing={2.2}>
                  <Typography variant="h6">Частые вопросы</Typography>
                  <Stack spacing={1.2}>
                    {faqItems.map((item) => (
                      <Paper key={item.question} variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
                        <Stack spacing={0.8}>
                          <Typography variant="subtitle2">{item.question}</Typography>
                          <Typography variant="body2" color="text.secondary">{item.answer}</Typography>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ width: '100%', boxShadow: '0 24px 60px rgba(60,64,67,0.14)' }}>
              <CardContent sx={{ p: { xs: 2.6, md: 3 } }}>
                <Stack spacing={2.2}>
                  <Typography variant="h6">Начать работу</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Зарегистрируйтесь или войдите, чтобы отправить заявку и отслеживать ее выполнение.
                  </Typography>
                  <Stack spacing={1.2}>
                    <Button variant="contained" onClick={onRegister}>Регистрация</Button>
                    <Button variant="outlined" onClick={onLogin}>Войти</Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
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
