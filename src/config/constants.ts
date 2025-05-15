// تنظیمات API و سرور
export const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL || 'https://api.alkaashef.ir/v1';
export const ML_API_ENDPOINT = process.env.REACT_APP_ML_API_URL || 'https://ml.alkaashef.ir/v1';

// تنظیمات نقشه
export const DEFAULT_MAP_CENTER = { lat: 33.6380, lng: 46.4153 }; // ایلام، ایران
export const DEFAULT_MAP_ZOOM = 13;

// تنظیمات اسکن
export const SCAN_METHODS = [
  { id: 'acoustic', name: 'تحلیل صوتی', icon: 'sound-wave' },
  { id: 'network', name: 'اسکن شبکه', icon: 'network' },
  { id: 'emi', name: 'سیگنال‌های EMI', icon: 'lightning' },
  { id: 'thermal', name: 'تصویربرداری حرارتی', icon: 'thermometer' },
  { id: 'combined', name: 'روش ترکیبی', icon: 'layers' },
];

// آستانه‌های اطمینان
export const CONFIDENCE_THRESHOLDS = {
  LOW: 50,
  MEDIUM: 70,
  HIGH: 85,
};

// انواع دستگاه‌های ماینر
export const MINER_TYPES = [
  { id: 'ASIC', name: 'ASIC ماینر', description: 'دستگاه‌های مخصوص استخراج با قدرت بالا' },
  { id: 'GPU', name: 'GPU ماینر', description: 'ریگ‌های استخراج با کارت گرافیک' },
  { id: 'CPU', name: 'CPU ماینر', description: 'استخراج با پردازنده کامپیوتر' },
  { id: 'FPGA', name: 'FPGA ماینر', description: 'استخراج با مدارهای قابل برنامه‌ریزی' },
  { id: 'UNKNOWN', name: 'ناشناخته', description: 'نوع دستگاه قابل تشخیص نیست' },
];

// تنظیمات امنیتی
export const AUTH_CONFIG = {
  TOKEN_EXPIRY: 8 * 60 * 60 * 1000, // 8 ساعت
  REFRESH_INTERVAL: 30 * 60 * 1000, // 30 دقیقه
};