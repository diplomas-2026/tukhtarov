const API_BASE = (process.env.REACT_APP_API_BASE_URL || 'https://tukhtarov.danbel.ru/api/').replace(/\/+$/, '');
const TOKEN_KEY = 'tukhtarov_token';

let authToken = localStorage.getItem(TOKEN_KEY) || '';

export function setAuthToken(token) {
  authToken = token || '';
  if (authToken) {
    localStorage.setItem(TOKEN_KEY, authToken);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function clearAuthToken() {
  setAuthToken('');
}

export function getStoredToken() {
  return authToken;
}

async function request(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${normalizedPath}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || message;
    } catch (error) {
      // Ignore parse errors and keep the fallback message.
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export function login(loginValue, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ login: loginValue, password }),
  });
}

export function register(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function me() {
  return request('/auth/me');
}

export function loadWorkspaceData(role) {
  const requests = {
    dashboard: request('/dashboard'),
    orders: request('/orders'),
  };

  if (role === 'ADMIN' || role === 'MANAGER' || role === 'EXECUTOR') {
    requests.statuses = request('/meta/statuses');
  }

  if (role === 'ADMIN' || role === 'MANAGER') {
    requests.users = request('/users/list');
    requests.clients = request('/clients/list');
    requests.roles = request('/meta/roles');
    requests.priorities = request('/meta/priorities');
  }

  return Promise.all(Object.values(requests)).then((responses) => {
    const keys = Object.keys(requests);
    const payload = keys.reduce((accumulator, key, index) => {
      accumulator[key] = responses[index];
      return accumulator;
    }, {});

    return {
      dashboard: payload.dashboard,
      orders: payload.orders,
      users: payload.users || [],
      clients: payload.clients || [],
      roles: payload.roles || [],
      statuses: payload.statuses || [],
      priorities: payload.priorities || [],
    };
  });
}

export function loadOrderDetails(orderId) {
  return request(`/orders/${orderId}`);
}

export function loadOrderChatState(orderId) {
  return request(`/orders/${orderId}/chat/state`);
}

export function loadOrderChatMessages(orderId) {
  return request(`/orders/${orderId}/chat/messages`);
}

export function sendOrderChatMessage(orderId, payload) {
  return request(`/orders/${orderId}/chat/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

function buildQueryString(params = {}) {
  const entries = Object.entries(params).filter(([, value]) => value !== null && value !== undefined && value !== '');
  if (!entries.length) {
    return '';
  }
  const searchParams = new URLSearchParams();
  entries.forEach(([key, value]) => {
    searchParams.set(key, value);
  });
  return `?${searchParams.toString()}`;
}

export function loadSupportChatState(clientCompanyId = '') {
  return request(`/support-chat/state${buildQueryString({ clientCompanyId })}`);
}

export function loadSupportChatMessages(clientCompanyId = '') {
  return request(`/support-chat/messages${buildQueryString({ clientCompanyId })}`);
}

export function sendSupportChatMessage(clientCompanyId, payload) {
  return request(`/support-chat/messages${buildQueryString({ clientCompanyId })}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createOrder(payload) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateOrder(orderId, payload) {
  return request(`/orders/${orderId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function changeOrderStatus(orderId, payload) {
  return request(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function addOrderComment(orderId, payload) {
  return sendOrderChatMessage(orderId, payload);
}

export function createUser(payload) {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateUser(userId, payload) {
  return request(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function createClient(payload) {
  return request('/clients', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateClient(clientId, payload) {
  return request(`/clients/${clientId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
