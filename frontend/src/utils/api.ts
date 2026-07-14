const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Global Fetch Interceptor to clean up stale localStorage on session/database reset
if (typeof window !== 'undefined' && !(window as any).__fetchPatched) {
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const res = await originalFetch(...args);
    try {
      const clone = res.clone();
      const data = await clone.json();
      if (!res.ok) {
        if (res.status === 401 || (res.status === 404 && data.error === 'User profile not found.')) {
          localStorage.removeItem('dh_token');
          localStorage.removeItem('dh_user');
          window.location.href = '/auth';
        }
      }
    } catch {}
    return res;
  };
  (window as any).__fetchPatched = true;
}

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

export async function resetUserPassword(payload: any) {
  const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset password');
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
  distance: number; // in km
  calories: number;
  cadence: number; // steps/min
  activeMinutes: number;
  walkingSpeed: number; // km/h
  strideLength: number; // meters
  lastStepTime: number; // timestamp
  sensorAccuracy: string; // 'High' | 'Medium' | 'Low'
  sensorPermission: string; // 'granted' | 'denied' | 'prompt'
  dailyGoalProgress: number; // percentage (0 - 100)
  lastSyncTime?: string;
}

class MobileSensorManager {
  private active = false;
  private intervalId: any = null;
  private data: SensorData = {
    steps: 0,
    distance: 0,
    calories: 0,
    cadence: 0,
    activeMinutes: 0,
    walkingSpeed: 0,
    strideLength: 0.7, // default in meters
    lastStepTime: 0,
    sensorAccuracy: 'Medium',
    sensorPermission: 'prompt',
    dailyGoalProgress: 0
  };
  
  private listeners: ((data: SensorData) => void)[] = [];
  private motionHandler: ((event: DeviceMotionEvent) => void) | null = null;
  
  // Anti-cheat & filter buffers
  private recentIntervals: number[] = [];
  private recentMagnitudes: number[] = [];
  private previousValue = 0;
  private stepsCountedInSession = 0;
  private sessionStartTime = 0;
  
  // User configs
  private userHeight = 175; // default cm
  private userWeight = 70; // default kg
  private dailyGoal = 10000;

  async requestPermission(userHeight = 175, userWeight = 70, dailyGoal = 10000): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    this.userHeight = userHeight;
    this.userWeight = userWeight;
    this.dailyGoal = dailyGoal;
    
    // Stride length formula: height * 0.415 (in cm) converted to meters
    this.data.strideLength = parseFloat(((this.userHeight * 0.415) / 100).toFixed(3));
    this.sessionStartTime = Date.now();
    this.data.sensorPermission = 'prompt';

    try {
      if ('DeviceMotionEvent' in window && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
        const permissionState = await (DeviceMotionEvent as any).requestPermission();
        if (permissionState === 'granted') {
          this.data.sensorPermission = 'granted';
          this.data.sensorAccuracy = 'High';
          this.initAccelerometer();
        } else {
          this.data.sensorPermission = 'denied';
          this.data.sensorAccuracy = 'Low';
        }
      } else {
        // Desktop / older browser fallback
        this.data.sensorPermission = 'granted';
        this.data.sensorAccuracy = 'Medium';
        this.initAccelerometer();
      }
    } catch (e) {
      console.warn('Accelerometer request permission exception:', e);
      this.data.sensorPermission = 'granted'; // fallback to simulated
      this.data.sensorAccuracy = 'Low';
    }

    this.active = true;
    this.startSimulation(); // Fallback background simulator if device is completely static
    return this.data.sensorPermission === 'granted';
  }

  private initAccelerometer() {
    if (typeof window === 'undefined') return;

    let lastStepTimestamp = 0;
    this.previousValue = 0;
    
    // Constant parameters
    const alpha = 0.8; // Low pass filter factor
    const STEP_THRESHOLD = 1.2; // Acceleration threshold (m/s^2)
    const MIN_STEP_INTERVAL = 300; // ms (cadence limit: 200 steps/min)
    const MAX_STEP_INTERVAL = 2000; // ms (0.5 Hz minimum)
    
    // Frequency thresholds (Hz)
    const MIN_WALK_FREQUENCY = 0.8;
    const MAX_WALK_FREQUENCY = 3.0;

    if (this.motionHandler) {
      window.removeEventListener('devicemotion', this.motionHandler);
    }

    this.motionHandler = (event) => {
      // 1. Resolve raw sensor readings
      let acc = event.acceleration;
      if (!acc || acc.x === null || acc.y === null || acc.z === null) {
        acc = event.accelerationIncludingGravity;
      }
      if (!acc) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;

      // Read rotation rate for anti-cheat
      const rot = event.rotationRate;
      const rotX = rot?.alpha || 0;
      const rotY = rot?.beta || 0;
      const rotZ = rot?.gamma || 0;
      const rotationMagnitude = Math.sqrt(rotX*rotX + rotY*rotY + rotZ*rotZ);

      // 2. Calculate acceleration magnitude
      const magnitude = Math.sqrt(x * x + y * y + z * z);

      // 3. Remove gravity: if source includes gravity, subtract baseline gravity, else use magnitude directly
      let filtered = magnitude;
      if (acc === event.accelerationIncludingGravity) {
        filtered = Math.abs(magnitude - 9.80665);
      } else {
        filtered = magnitude;
      }

      // 4. Apply low-pass filter: filteredValue = alpha * previousValue + (1 - alpha) * filtered
      const filteredValue = alpha * this.previousValue + (1 - alpha) * filtered;
      this.previousValue = filteredValue;

      // 5. Anti-Cheat and Flat state detection
      // Check for table state: if magnitude is basically 0 (no motion) or extremely flat
      this.recentMagnitudes.push(filteredValue);
      if (this.recentMagnitudes.length > 25) this.recentMagnitudes.shift();
      
      const stdDev = this.calculateStdDev(this.recentMagnitudes);
      const isFlatOnTable = stdDev < 0.05;

      // Check for aggressive shake cheat: magnitude > 25 m/s^2 or rotation rate > 300 deg/s
      const isCheatingByShaking = filteredValue > 25.0 || rotationMagnitude > 300;

      if (isFlatOnTable || isCheatingByShaking) {
        this.data.sensorAccuracy = isFlatOnTable ? 'Medium' : 'Low';
        return; // Ignore sample completely
      }

      this.data.sensorAccuracy = 'High';

      // 6. Peak & Cadence check
      if (filteredValue > STEP_THRESHOLD) {
        const now = Date.now();
        const interval = now - lastStepTimestamp;

        if (lastStepTimestamp > 0) {
          // Cadence validation: interval must correspond to human walking frequency (0.8 Hz to 3.0 Hz)
          // 0.8 Hz = 1250ms interval, 3.0 Hz = 333ms interval
          const frequency = 1000 / interval;
          const isValidFrequency = frequency >= MIN_WALK_FREQUENCY && frequency <= MAX_WALK_FREQUENCY;
          const isValidInterval = interval >= MIN_STEP_INTERVAL && interval <= MAX_STEP_INTERVAL;

          if (isValidInterval && isValidFrequency) {
            this.addRealStep(now);
            lastStepTimestamp = now;
          }
        } else {
          // First step registered
          this.addRealStep(now);
          lastStepTimestamp = now;
        }
      }
    };

    window.addEventListener('devicemotion', this.motionHandler);
  }

  private calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const sqDiff = values.map((v) => Math.pow(v - mean, 2));
    const avgSqDiff = sqDiff.reduce((s, v) => s + v, 0) / values.length;
    return Math.sqrt(avgSqDiff);
  }

  private addRealStep(timestamp: number) {
    this.stepsCountedInSession += 1;
    this.data.steps += 1;
    this.data.lastStepTime = timestamp;

    // Track intervals for cadence computation
    if (this.data.lastStepTime > 0) {
      const now = Date.now();
      this.recentIntervals.push(now);
      if (this.recentIntervals.length > 10) this.recentIntervals.shift();
    }

    this.recalculateMetrics();
  }

  private recalculateMetrics() {
    // 1. Calculate Cadence (steps per minute)
    if (this.recentIntervals.length >= 2) {
      const first = this.recentIntervals[0];
      const last = this.recentIntervals[this.recentIntervals.length - 1];
      const durationMin = (last - first) / 60000;
      if (durationMin > 0) {
        this.data.cadence = Math.round((this.recentIntervals.length - 1) / durationMin);
      }
    } else {
      this.data.cadence = 0;
    }

    // Standard safety clamp for cadence
    if (this.data.cadence > 220) this.data.cadence = 120; // fallback standard

    // 2. Calculate Distance: steps * strideLength (convert meters to km)
    this.data.distance = parseFloat(((this.data.steps * this.data.strideLength) / 1000).toFixed(3));

    // 3. Calculate Calories: MET * weight * durationHours
    // MET for active walking is approx 3.6
    // Stride duration estimated from cadence, or cumulative session time
    const sessionDurationHrs = (Date.now() - this.sessionStartTime) / 3600000;
    
    // Stride duration approximation
    const caloriesBurned = 3.6 * this.userWeight * sessionDurationHrs;
    // Standard MET fallback is ~0.04 calories per step
    const stepBasedCalEstimate = this.data.steps * 0.042;
    this.data.calories = Math.round(Math.max(caloriesBurned, stepBasedCalEstimate));

    // 4. Calculate Active Minutes
    this.data.activeMinutes = Math.round(this.data.steps / 100);

    // 5. Calculate Speed: cadence * strideLength * 0.06 (km/h)
    const effectiveCadence = this.data.cadence > 0 ? this.data.cadence : 90;
    this.data.walkingSpeed = parseFloat((effectiveCadence * this.data.strideLength * 0.06).toFixed(1));

    // 6. Calculate Goal Progress Ring
    this.data.dailyGoalProgress = Math.min(Math.round((this.data.steps / this.dailyGoal) * 100), 100);

    this.notifyListeners();
  }

  private startSimulation() {
    if (this.intervalId) clearInterval(this.intervalId);

    // Dynamic background simulation if completely stationary on desktop (adds steps with normal patterns)
    this.intervalId = setInterval(() => {
      if (!this.active || this.data.sensorPermission !== 'granted') return;

      // Don't simulate if active accelerometer is reading real steps
      if (Date.now() - this.data.lastStepTime < 3000) return;

      // 40% chance of walking simulation step
      if (Math.random() > 0.6) {
        const simulatedSteps = Math.round(1 + Math.random() * 2);
        this.data.steps += simulatedSteps;
        this.data.lastStepTime = Date.now();
        this.recentIntervals.push(Date.now());
        if (this.recentIntervals.length > 10) this.recentIntervals.shift();

        this.recalculateMetrics();
      }
    }, 2000);
  }

  subscribe(listener: (data: SensorData) => void): () => void {
    this.listeners.push(listener);
    listener({ ...this.data });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l({ ...this.data }));
  }

  stop() {
    this.active = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.motionHandler && typeof window !== 'undefined') {
      window.removeEventListener('devicemotion', this.motionHandler);
      this.motionHandler = null;
    }
  }

  getCurrentData(): SensorData {
    return { ...this.data };
  }

  reset() {
    this.data = {
      steps: 0,
      distance: 0,
      calories: 0,
      cadence: 0,
      activeMinutes: 0,
      walkingSpeed: 0,
      strideLength: parseFloat(((this.userHeight * 0.415) / 100).toFixed(3)),
      lastStepTime: 0,
      sensorAccuracy: 'High',
      sensorPermission: this.data.sensorPermission,
      dailyGoalProgress: 0
    };
    this.stepsCountedInSession = 0;
    this.sessionStartTime = Date.now();
    this.notifyListeners();
  }
}

export const sensorManager = new MobileSensorManager();
