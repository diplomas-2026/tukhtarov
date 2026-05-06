const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://tukhtarov.danbel.ru/api/';
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
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
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

export function me() {
  return request('/auth/me');
}

export function loadWorkspaceData() {
  return Promise.all([
    request('/dashboard'),
    request('/orders'),
    request('/users/list'),
    request('/clients/list'),
    request('/meta/roles'),
    request('/meta/statuses'),
    request('/meta/priorities'),
  ]).then(([dashboard, orders, users, clients, roles, statuses, priorities]) => ({
    dashboard,
    orders,
    users,
    clients,
    roles,
    statuses,
    priorities,
  }));
}

export function loadOrderDetails(orderId) {
  return request(`/orders/${orderId}`);
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
  return request(`/orders/${orderId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
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
