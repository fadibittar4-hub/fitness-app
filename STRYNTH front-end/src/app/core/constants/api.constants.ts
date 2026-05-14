export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    PROFILE_IMAGE: '/auth/me/profile-image',
  },
  TRAINERS: {
    LIST: '/trainers',
    GET: (id: number): string => `/trainers/${id}`,
    UPDATE_PROFILE: '/trainers/profile',
  },
  SESSIONS: {
    AVAILABLE: '/sessions/available',
    TRAINER: '/sessions/trainer',
    CREATE: '/sessions',
    UPDATE: (id: number): string => `/sessions/${id}`,
    DELETE: (id: number): string => `/sessions/${id}`,
  },
  BOOKINGS: {
    PAY: '/bookings/pay',
    MY: '/bookings/my',
    TRAINER: '/bookings/trainer',
  },
  ADMIN: {
    STATS: '/admin/stats',
    BOOKINGS: '/admin/bookings',
    SESSIONS: '/admin/sessions',
    USERS: '/admin/users',
    UPDATE_USER: (id: number): string => `/admin/users/${id}`,
    UPDATE_TRAINER_PROFILE: (id: number): string => `/admin/trainers/${id}/profile`,
    UPDATE_SESSION: (id: number): string => `/admin/sessions/${id}`,
  },
} as const;
