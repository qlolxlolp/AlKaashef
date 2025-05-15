// تعریف انواع داده‌های سیستم

// نوع داده تشخیص ماینر
export interface Detection {
  id: number;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  confidence: number;
  type: string;
  detectionMethod: string;
  deviceInfo?: string;
  powerConsumption?: number;
  heatSignature?: number;
  networkActivity?: {
    pools: string[];
    connections: number;
    bandwidth: number;
  };
  audioProfile?: {
    frequency: number;
    pattern: string;
    decibels: number;
  };
  emiSignature?: {
    strength: number;
    frequency: number;
    pattern: string;
  };
  verified: boolean;
  verificationMethod?: string;
  notes?: string;
}

// نوع داده تاریخچه اسکن
export interface ScanHistory {
  id: number;
  scanId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radius: number;
  detectedMiners: number;
  operator: string;
  operatorId: string;
  methods: string[];
  status: 'completed' | 'failed' | 'partial' | 'in_progress';
  errorDetails?: string;
  weatherConditions?: {
    temperature: number;
    humidity: number;
    conditions: string;
  };
  deviceUsed?: string;
}

// نوع داده آمار
export interface Stats {
  totalScans: number;
  totalDetections: number;
  averageConfidence: number;
  lastScanDate: string;
  scansByMethod: {
    acoustic: number;
    network: number;
    emi: number;
    thermal: number;
    combined: number;
  };
  detectionsByRegion: {
    [region: string]: number;
  };
  detectionsByType: {
    [type: string]: number;
  };
  successRate: number;
  averageScanDuration: number;
  powerSavings: {
    estimated: number;
    unit: string;
  };
}

// نوع داده نتیجه اسکن
export interface ScanResult {
  scanId: string;
  status: 'initializing' | 'scanning' | 'analyzing' | 'completed' | 'failed';
  progress: number;
  startTime: string;
  currentTime: string;
  estimatedTimeRemaining?: number;
  detections: Detection[];
  currentMethod?: string;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  errors?: string[];
  logs: string[];
}

// نوع داده تنظیمات کاربر
export interface UserSettings {
  operatorName: string;
  operatorId: string;
  department: string;
  notificationEmail: string;
  darkMode: boolean;
  language: string;
  autoRefresh: boolean;
  refreshInterval: number;
  defaultLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  preferredScanMethods: string[];
  notificationPreferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    sound: boolean;
  };
}

// نوع داده تنظیمات سرور
export interface ServerSettings {
  apiEndpoint: string;
  authToken: string;
  refreshInterval: number;
  enableSSL: boolean;
  debugMode: boolean;
  proxySettings?: {
    enabled: boolean;
    url: string;
    port: number;
  };
  dataRetentionDays: number;
}

// نوع داده تنظیمات اسکن
export interface ScanSettings {
  defaultLocation: string;
  scanRadius: number;
  minConfidence: number;
  enableAcoustic: boolean;
  enableNetwork: boolean;
  enableEMI: boolean;
  enableThermal: boolean;
  autosaveReports: boolean;
  notifyOnDetection: boolean;
  scanInterval: number;
  maxScanDuration: number;
  deviceCalibration: {
    acoustic: number;
    emi: number;
    thermal: number;
  };
}