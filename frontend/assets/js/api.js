/* ============================================
   GLOBAL API UTILITY — Student Management System
   ============================================ */

// const API_BASE = 'http://localhost:5000/api';
const API_BASE = '/api';

// ---- Token Management ----
const getToken = () => localStorage.getItem('sms_token');
const getUser  = () => JSON.parse(localStorage.getItem('sms_user') || 'null');
const setAuth  = (token, user) => {
  localStorage.setItem('sms_token', token);
  localStorage.setItem('sms_user', JSON.stringify(user));
};
const clearAuth = () => {
  localStorage.removeItem('sms_token');
  localStorage.removeItem('sms_user');
};

// ---- Core Fetch Wrapper ----
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API Error');
  }
  return data;
};

// ---- Auth Redirects ----
const requireAuth = (allowedRoles = []) => {
  const user = getUser();
  if (!user || !getToken()) {
    window.location.href = '/auth/login.html';
    return null;
  }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    redirectByRole(user.role);
    return null;
  }
  return user;
};

const redirectByRole = (role) => {
  if (role === 'admin')   window.location.href = '/admin/dashboard.html';
  else if (role === 'teacher') window.location.href = '/teacher/dashboard.html';
  else window.location.href = '/student/dashboard.html';
};


// ---- Logout ----
const logout = () => {
  clearAuth();
  window.location.href = '/auth/login.html';
};

// ---- UI Helpers ----
const showAlert = (message, type = 'info', container = null) => {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  const icons = { success: '&#10003;', danger: '&#9888;', info: '&#8505;', warning: '&#9888;' };
  alert.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
  const target = container || document.querySelector('.alert-container') || document.querySelector('.page-content');
  if (target) {
    target.prepend(alert);
    setTimeout(() => alert.remove(), 4000);
  }
};

const setLoading = (btn, loading = true, text = 'Loading...') => {
  if (!btn) return;
  if (loading) {
    btn.dataset.originalText = btn.textContent;
    btn.textContent = text;
    btn.disabled = true;
  } else {
    btn.textContent = btn.dataset.originalText || 'Submit';
    btn.disabled = false;
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getPercentageClass = (pct) => {
  const p = parseFloat(pct);
  if (p >= 75) return 'good';
  if (p >= 50) return 'warning';
  return 'danger';
};

const getPillClass = (pct) => {
  const p = parseFloat(pct);
  if (p >= 75) return 'pill-high';
  if (p >= 50) return 'pill-medium';
  return 'pill-low';
};

// ---- Sidebar Population ----
const populateSidebarUser = () => {
  const user = getUser();
  if (!user) return;
  const nameEl = document.getElementById('sidebar-user-name');
  const roleEl = document.getElementById('sidebar-user-role');
  const avatarEl = document.getElementById('sidebar-avatar');
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) roleEl.textContent = user.role;
  if (avatarEl) avatarEl.textContent = user.name.charAt(0).toUpperCase();
};

// ---- API Methods ----
const API = {
  // Auth
  login:    (data) => apiFetch('/auth/login',    { method: 'POST', body: JSON.stringify(data) }),
  register: (data) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe:    ()     => apiFetch('/auth/me'),

  // Students
  getStudents:  (params = '') => apiFetch(`/students${params}`),
  getStudent:   (id)          => apiFetch(`/students/${id}`),
  createStudent:(data)        => apiFetch('/students', { method: 'POST', body: JSON.stringify(data) }),
  updateStudent:(id, data)    => apiFetch(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteStudent:(id)          => apiFetch(`/students/${id}`, { method: 'DELETE' }),

  // Classes
  getClasses:  ()         => apiFetch('/classes'),
  getClass:    (id)       => apiFetch(`/classes/${id}`),
  createClass: (data)     => apiFetch('/classes', { method: 'POST', body: JSON.stringify(data) }),
  updateClass: (id, data) => apiFetch(`/classes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClass: (id)       => apiFetch(`/classes/${id}`, { method: 'DELETE' }),

  // Subjects
  getSubjects:  (classId = '') => apiFetch(`/subjects${classId ? '?classId=' + classId : ''}`),
  createSubject:(data)         => apiFetch('/subjects', { method: 'POST', body: JSON.stringify(data) }),
  updateSubject:(id, data)     => apiFetch(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSubject:(id)           => apiFetch(`/subjects/${id}`, { method: 'DELETE' }),

  // Attendance
  getAttendance: (params = '') => apiFetch(`/attendance${params}`),
  markAttendance:(data)        => apiFetch('/attendance', { method: 'POST', body: JSON.stringify(data) }),
  getAttendanceSummary:(id, subject = '') => apiFetch(`/attendance/summary/${id}${subject ? '?subjectId='+subject : ''}`),

  // Reports
  getMonthlyReport:(month, year, classId = '', subjectId = '') => apiFetch(`/reports/monthly?month=${month}&year=${year}${classId?'&classId='+classId:''}${subjectId?'&subjectId='+subjectId:''}`),
  getClassReport:  (classId, params = '') => apiFetch(`/reports/class/${classId}${params}`),

  // Profiles
  getProfiles:   (search = '') => apiFetch(`/profiles${search ? '?search=' + search : ''}`),
  getMyProfile:  ()            => apiFetch('/profiles/my'),
  createProfile: (data)        => apiFetch('/profiles', { method: 'POST', body: JSON.stringify(data) }),
  updateProfile: (id, data)    => apiFetch(`/profiles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProfile: (id)          => apiFetch(`/profiles/${id}`, { method: 'DELETE' }),

  // createStudentAdmin: (data) => apiFetch('/students', { 
  //   method: 'POST', 
  //   body: JSON.stringify({ ...data, role: 'student' }) 
  // }),
  
  // createTeacherAdmin: (data) => apiFetch('/teachers', { 
  //   method: 'POST', 
  //   body: JSON.stringify({ ...data, role: 'teacher' }) 
  // })
};

