const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

function getAuthHeaders(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('dh_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// ---------------- AUTH API ----------------
export async function registerUser(payload: any) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function loginUser(payload: any) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function googleLoginUser(payload: any) {
  const res = await fetch(`${API_BASE_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Google Login failed');
  return data;
}

// ---------------- PROFILE API ----------------
export async function getProfile() {
  const res = await fetch(`${API_BASE_URL}/profile`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
  return data;
}

export async function updateProfile(payload: any) {
  const res = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update profile');
  return data;
}

// ---------------- HEALTH LOG API ----------------
export async function submitHealthLog(payload: any) {
  const res = await fetch(`${API_BASE_URL}/health/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit health metrics');
  return data;
}

export async function getHealthHistory(limit = 14) {
  const res = await fetch(`${API_BASE_URL}/health/history?limit=${limit}`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
  return data;
}

export async function syncMobileSteps(payload: { date: string; count: number; distance: number; activeMinutes: number; caloriesBurned: number }) {
  const res = await fetch(`${API_BASE_URL}/health/sync-steps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to sync steps');
  return data;
}

export async function getHealthInsights(date: string) {
  const res = await fetch(`${API_BASE_URL}/health/insights?date=${date}`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch AI insights');
  return data;
}

// ---------------- SETTINGS API ----------------
export async function getSettings() {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch settings');
  return data;
}

export async function updateSettings(payload: any) {
  const res = await fetch(`${API_BASE_URL}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update settings');
  return data;
}

export async function changePassword(payload: any) {
  const res = await fetch(`${API_BASE_URL}/settings/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to change password');
  return data;
}

export async function exportUserData() {
  const res = await fetch(`${API_BASE_URL}/settings/export`, {
    method: 'POST',
    headers: { ...getAuthHeaders() },
  });
  if (!res.ok) throw new Error('Failed to export data');
  return await res.json();
}

export async function deleteUserAccount() {
  const res = await fetch(`${API_BASE_URL}/settings/delete-account`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete account');
  return data;
}

// ---------------- NOTIFICATIONS API ----------------
export async function getNotifications() {
  const res = await fetch(`${API_BASE_URL}/notifications`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch notifications');
  return data;
}

export async function markNotificationAsRead(id: string) {
  const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PUT',
    headers: { ...getAuthHeaders() },
  });
  return await res.json();
}

export async function markAllNotificationsAsRead() {
  const res = await fetch(`${API_BASE_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: { ...getAuthHeaders() },
  });
  return await res.json();
}

// ---------------- ADMIN API ----------------
export async function getAdminUsers() {
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch user list');
  return data;
}

export async function getAdminReports() {
  const res = await fetch(`${API_BASE_URL}/admin/reports`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch logs');
  return data;
}

export async function getAdminStats() {
  const res = await fetch(`${API_BASE_URL}/admin/stats`, {
    headers: { ...getAuthHeaders() },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
  return data;
}

export async function updateAdminUserRole(userId: string, role: 'USER' | 'ADMIN') {
  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ role }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update user role');
  return data;
}

export async function sendAdminNotification(payload: { userId?: string; title: string; message: string; type: string }) {
  const res = await fetch(`${API_BASE_URL}/admin/notify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to dispatch notification');
  return data;
}


// ---------------- SMART SENSOR ADAPTER ----------------
export interface SensorData {
  steps: number;
  distance: number;
  calories: number;
  activeMinutes: number;
  speed: number;
}

class MobileSensorManager {
  private active = false;
  private intervalId: any = null;
  private data: SensorData = { steps: 0, distance: 0, calories: 0, activeMinutes: 0, speed: 0 };
  private listeners: ((data: SensorData) => void)[] = [];

  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // Check standard browser Accelerometer permission
    try {
      if ('DeviceMotionEvent' in window && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState === 'granted') {
          this.initAccelerometer();
        }
      } else {
        this.initAccelerometer();
      }
    } catch (e) {
      console.warn('Accelerometer permission request failed, using background simulator:', e);
    }

    this.active = true;
    this.startSimulation();
    return true;
  }

  private initAccelerometer() {
    if (typeof window === 'undefined') return;

    let lastX = 0, lastY = 0, lastZ = 0;
    let threshold = 12; // step movement trigger threshold

    window.addEventListener('devicemotion', (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;

      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      if ((deltaX + deltaY + deltaZ) > threshold) {
        // Accelerometer detected step
        this.addSteps(1);
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    });
  }

  private startSimulation() {
    if (this.intervalId) clearInterval(this.intervalId);

    // Simulate stepping activity periodically every few seconds
    this.intervalId = setInterval(() => {
      if (!this.active) return;

      // Random speed 0 - 6 km/h
      const speed = Math.random() > 0.4 ? 4 + Math.random() * 2 : 0;
      if (speed > 0) {
        // 4-6 steps per second when active
        const simulatedSteps = Math.round(1 + Math.random() * 3);
        this.addSteps(simulatedSteps, speed);
      }
    }, 2000);
  }

  private addSteps(steps: number, speed = 4) {
    this.data.steps += steps;
    const distanceGain = steps * 0.00075; // 0.75 meters per step
    this.data.distance = parseFloat((this.data.distance + distanceGain).toFixed(3));
    this.data.activeMinutes = Math.round(this.data.steps / 100);
    this.data.calories = Math.round(this.data.steps * 0.04);
    this.data.speed = parseFloat(speed.toFixed(1));

    this.notifyListeners();
  }

  getCurrentData(): SensorData {
    return { ...this.data };
  }

  reset() {
    this.data = { steps: 0, distance: 0, calories: 0, activeMinutes: 0, speed: 0 };
    this.notifyListeners();
  }

  subscribe(callback: (data: SensorData) => void) {
    this.listeners.push(callback);
    callback(this.data);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(l => l(this.data));
  }
}

export const sensorManager = new MobileSensorManager();
