import axios from 'axios';
import { toast } from '@/hooks/use-toast';
import { Detection, ScanHistory, Stats, ScanResult } from '@/types/data';
import { ML_API_ENDPOINT, BACKEND_API_URL } from '@/config/constants';

// تنظیم پیکربندی اصلی axios
const api = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// افزودن توکن احراز هویت به درخواست‌ها
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// مدیریت خطاها
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    const message = error.response?.data?.message || 'خطا در ارتباط با سرور';
    toast({
      title: "خطای سیستم",
      description: message,
      variant: "destructive",
    });
    return Promise.reject(error);
  }
);

// دریافت اطلاعات ماینرهای شناسایی شده
export const fetchMinerData = async (): Promise<Detection[]> => {
  try {
    const response = await api.get('/miners/detections');
    return response.data;
  } catch (error) {
    console.error('Error fetching miner data:', error);
    throw new Error('خطا در دریافت اطلاعات ماینرها');
  }
};

// دریافت تاریخچه اسکن‌ها
export const fetchScanHistory = async (): Promise<ScanHistory[]> => {
  try {
    const response = await api.get('/scans/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching scan history:', error);
    throw new Error('خطا در دریافت تاریخچه اسکن‌ها');
  }
};

// دریافت آمار کلی تشخیص
export const fetchDetectionStats = async (): Promise<Stats> => {
  try {
    const response = await api.get('/stats/detection');
    return response.data;
  } catch (error) {
    console.error('Error fetching detection stats:', error);
    throw new Error('خطا در دریافت آمار تشخیص');
  }
};

// دریافت موقعیت‌های جغرافیایی ماینرها
export const fetchMinerLocations = async () => {
  try {
    const response = await api.get('/miners/locations');
    return response.data;
  } catch (error) {
    console.error('Error fetching miner locations:', error);
    throw new Error('خطا در دریافت موقعیت ماینرها');
  }
};

// شروع اسکن جدید
export const startNewScan = async (scanParams: {
  location: { lat: number, lng: number },
  radius: number,
  methods: string[],
  operator: string
}): Promise<{ scanId: string }> => {
  try {
    const response = await api.post('/scans/start', scanParams);
    return response.data;
  } catch (error) {
    console.error('Error starting new scan:', error);
    throw new Error('خطا در شروع اسکن جدید');
  }
};

// دریافت وضعیت اسکن در حال انجام
export const getScanStatus = async (scanId: string): Promise<ScanResult> => {
  try {
    const response = await api.get(`/scans/${scanId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error getting scan status:', error);
    throw new Error('خطا در دریافت وضعیت اسکن');
  }
};

// تحلیل صوتی با استفاده از هوش مصنوعی
export const analyzeAudioSample = async (audioData: Blob): Promise<{
  isMiningSoundDetected: boolean,
  confidence: number,
  minerType?: string,
  analysis: any
}> => {
  try {
    const formData = new FormData();
    formData.append('audio', audioData);

    const response = await axios.post(`${ML_API_ENDPOINT}/analyze/audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error analyzing audio sample:', error);
    throw new Error('خطا در تحلیل نمونه صوتی');
  }
};

// تحلیل ترافیک شبکه
export const analyzeNetworkTraffic = async (networkData: any): Promise<{
  miningPoolsDetected: string[],
  suspiciousConnections: any[],
  confidence: number
}> => {
  try {
    const response = await axios.post(`${ML_API_ENDPOINT}/analyze/network`, networkData);
    return response.data;
  } catch (error) {
    console.error('Error analyzing network traffic:', error);
    throw new Error('خطا در تحلیل ترافیک شبکه');
  }
};

// تحلیل سیگنال‌های الکترومغناطیسی
export const analyzeEMISignals = async (emiData: any): Promise<{
  minerSignatureDetected: boolean,
  signalStrength: number,
  confidence: number,
  possibleDevices: string[]
}> => {
  try {
    const response = await axios.post(`${ML_API_ENDPOINT}/analyze/emi`, emiData);
    return response.data;
  } catch (error) {
    console.error('Error analyzing EMI signals:', error);
    throw new Error('خطا در تحلیل سیگنال‌های EMI');
  }
};

// ارسال گزارش جدید
export const sendReport = async (reportData: any) => {
  try {
    const response = await api.post('/reports', reportData);
    return response.data;
  } catch (error) {
    console.error('Error sending report:', error);
    throw new Error('خطا در ارسال گزارش');
  }
};

// دریافت اطلاعات تکمیلی ماینر
export const getMinerDetails = async (minerId: number): Promise<any> => {
  try {
    const response = await api.get(`/miners/${minerId}/details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching miner details:', error);
    throw new Error('خطا در دریافت اطلاعات تکمیلی ماینر');
  }
};

// احراز هویت کاربر
export const login = async (username: string, password: string): Promise<{
  token: string,
  user: any
}> => {
  try {
    const response = await api.post('/auth/login', { username, password });
    localStorage.setItem('auth_token', response.data.token);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('خطا در ورود به سیستم');
  }
};

// خروج کاربر
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('auth_token');
  } catch (error) {
    console.error('Logout error:', error);
  }
};
};