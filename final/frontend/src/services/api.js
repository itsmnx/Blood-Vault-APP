// CRA-safe environment variable handling
const API_URL =
  (typeof process !== 'undefined' && process.env.REACT_APP_API_URL)
    ? process.env.REACT_APP_API_URL
    : 'http://localhost:5000/api';


// Helper function for cleaner fetch error handling
const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.error || data.message || 'Request failed';
    throw new Error(message);
  }
  return data;
};

// ======================= AUTH =======================
export const login = async (email, password, userType) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, userType }),
  });
  return handleResponse(res);
};


export const register = async (email, password, userType) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, userType }),
  });
  return handleResponse(res);
};


// ======================= RECIPIENTS =======================
export const getRecipients = async (token) =>
  handleResponse(
    await fetch(`${API_URL}/recipients`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );

export const createRecipient = async (token, data) =>
  handleResponse(
    await fetch(`${API_URL}/recipients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  );

// ======================= DONORS =======================
export const getDonors = async (token) =>
  handleResponse(
    await fetch(`${API_URL}/donors`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );

export const createDonor = async (token, data) =>
  handleResponse(
    await fetch(`${API_URL}/donors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  );

// ======================= INVENTORY =======================
export const getInventory = async (token) =>
  handleResponse(
    await fetch(`${API_URL}/blood/inventory`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );

export const initializeInventory = async (token) =>
  handleResponse(
    await fetch(`${API_URL}/blood/inventory/initialize`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  );

export const createBloodUnit = async (token, data) =>
  handleResponse(
    await fetch(`${API_URL}/blood`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  );

export const getBloodUnits = async (token, includeExpired = false) =>
  handleResponse(
    await fetch(`${API_URL}/blood/units?includeExpired=${includeExpired}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );

export const deleteBloodUnit = async (token, unitId) =>
  handleResponse(
    await fetch(`${API_URL}/blood/units/${unitId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  );

export const deleteExpiredBlood = async (token) =>
  handleResponse(
    await fetch(`${API_URL}/blood/expired`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
  );

export const getExpiryReport = async (token) =>
  handleResponse(
    await fetch(`${API_URL}/blood/expiry-report`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );

export const getExpiringUnits = async (token, days = 7) =>
  handleResponse(
    await fetch(`${API_URL}/blood/expiring?days=${days}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );

export const initializeSampleBloodUnits = async (token) =>
  handleResponse(
    await fetch(`${API_URL}/blood/initialize-samples`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
  );

// ======================= ORDERS =======================
export const getOrders = async (token) =>
  handleResponse(
    await fetch(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );

export const createOrder = async (token, data) =>
  handleResponse(
    await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  );

export const fulfillOrder = async (token, orderId) =>
  handleResponse(
    await fetch(`${API_URL}/orders/${orderId}/fulfill`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
  );

export const autoFulfillOrders = async (token) =>
  handleResponse(
    await fetch(`${API_URL}/orders/auto-fulfill`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
  );

// ======================= ML SERVICES =======================
export const getMLInsights = async (token) =>
  handleResponse(
    await fetch(`${API_URL}/ml/insights`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );

export const getDemandForecast = async (token) =>
  handleResponse(
    await fetch(`${API_URL}/ml/forecast`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );

export const matchDonors = async (token, recipientId) =>
  handleResponse(
    await fetch(`${API_URL}/ml/match-donors/${recipientId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
  );

  export const optimizeLocation = async (token, recipientLocation) =>
  handleResponse(
    await fetch(`${API_URL}/ml/optimize-location`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipientLocation }),
    })
  );
