const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://tukhtarov.danbel.ru/api/';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const body = await response.json();
      message = body.message || message;
    } catch (error) {
      // Keep the fallback message.
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function query(params = {}) {
  const entries = Object.entries(params).filter(([, value]) => value !== null && value !== undefined && value !== '');
  if (!entries.length) {
    return '';
  }
  return `?${new URLSearchParams(entries)}`;
}

export async function loadWorkspaceData(role, userId) {
  const suffix = query({ role, userId });
  const [dashboard, orders, users, clients, roles, statuses, priorities] = await Promise.all([
    request(`/dashboard${suffix}`),
    request(`/orders${suffix}`),
    request('/users'),
    request('/clients'),
    request('/meta/roles'),
    request('/meta/statuses'),
    request('/meta/priorities'),
  ]);

  return {
    dashboard,
    orders,
    users,
    clients,
    roles,
    statuses,
    priorities,
  };
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
