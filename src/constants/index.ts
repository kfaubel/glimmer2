export const APP_CONFIG = {
  UPDATE_INTERVAL_MS: 60 * 1000, // 60 seconds
  SCREEN_LIST_REFRESH_HOURS: 24,
  REQUEST_TIMEOUT_MS: 20000, // 20 seconds
  FADE_OUT_DELAY_MS: 100,
  INITIAL_DISPLAY_TIME_MS: 10000, // 10 seconds
  ERROR_RETRY_DELAY_MINUTES: 10,
  NULL_IMAGE_DISPLAY_TIME_MS: 1000,
} as const;

export const IMAGE_VALIDATION = {
  MIN_RESOURCE_LENGTH: 10,
  MAX_RESOURCE_LENGTH: 200,
  MAX_FRIENDLY_NAME_LENGTH: 50,
  MIN_REFRESH_MINUTES: 5,
  MAX_REFRESH_MINUTES: 24 * 60, // 1440 minutes = 24 hours
  MIN_DISPLAY_SECONDS: 5,
  MAX_DISPLAY_SECONDS: 60,
} as const;

export const IMAGE_TYPES = {
  JPEG: 'jpeg',
  PNG: 'png',
  GIF: 'gif',
  WEBP: 'webp',
} as const;

export const TIME_BUG_CLASSES = {
  'lower-right-light': 'time-bug-lower-right-light',
  'lower-right-dark': 'time-bug-lower-right-dark',
  'upper-right-light': 'time-bug-upper-right-light',
  'upper-right-dark': 'time-bug-upper-right-dark',
} as const;

export const DEFAULT_SCREENS = {
  STARTING: {
    image: null,
    imageUri: '',
    displaySecs: 10,
    nextUpdate: 0,
    refreshMinutes: 0,
    resource: '',
    friendlyName: 'Starting (dawn)',
    message: 'Starting...',
    timeBug: 'lower-right-light',
  },
  STILL_STARTING: {
    image: null,
    imageUri: '',
    displaySecs: 10,
    nextUpdate: 0,
    refreshMinutes: 0,
    resource: '',
    friendlyName: 'Still starting',
    message: 'Still starting...',
    timeBug: '',
  },
  NO_IMAGES: {
    image: null,
    imageUri: '',
    displaySecs: 10,
    nextUpdate: 0,
    refreshMinutes: 0,
    resource: '',
    friendlyName: 'No images',
    message: 'No images...',
    timeBug: 'lower-right-light',
  },
  NO_LIST: {
    enabled: true,
    friendlyName: 'No list',
    resource: '',
    refreshMinutes: 999999,
    displaySecs: 60,
    nextUpdate: 0,
    image: null,
    imageUri: '',
    message: '',
    timeBug: '',
  },
} as const;
