
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { 
  fetchMinerData, 
  fetchScanHistory, 
  fetchDetectionStats, 
  fetchMinerLocations 
} from '@/services/api';

type Detection = {
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
};

type ScanHistory = {
  id: number;
  date: string;
  location: string;
  detectedMiners: number;
  duration: number;
  operator: string;
  status: 'completed' | 'failed' | 'partial';
};

type Stats = {
  totalScans: number;
  totalDetections: number;
  averageConfidence: number;
  lastScanDate: string;
  scansByMethod: {
    acoustic: number;
    network: number;
    emi: number;
    combined: number;
  };
};

interface DataContextType {
  detections: Detection[];
  scanHistory: ScanHistory[];
  stats: Stats | null;
  isLoading: boolean;
  error: Error | null;
  refreshData: () => Promise<void>;
  addNewDetection: (detection: Omit<Detection, 'id'>) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [minersData, historyData, statsData] = await Promise.all([
        fetchMinerData(),
        fetchScanHistory(),
        fetchDetectionStats(),
      ]);
      
      setDetections(minersData);
      setScanHistory(historyData);
      setStats(statsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err : new Error('خطا در بارگذاری داده‌ها'));
      toast({
        title: "خطا در بارگذاری اطلاعات",
        description: "اتصال به سرور داده امکان‌پذیر نیست. لطفاً از اتصال خود به شبکه مطمئن شوید.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const refreshData = async () => {
    toast({
      title: "بروزرسانی داده‌ها",
      description: "در حال دریافت اطلاعات جدید...",
    });
    
    await loadData();
    
    toast({
      title: "بروزرسانی موفق",
      description: "اطلاعات با موفقیت بروزرسانی شد",
    });
  };
  
  const addNewDetection = async (detection: Omit<Detection, 'id'>) => {
    try {
      // در یک سیستم واقعی، اینجا یک API call انجام می‌شود
      const newDetection = {
        ...detection,
        id: Math.max(...detections.map(d => d.id), 0) + 1
      };
      
      // به روز کردن state محلی
      setDetections([...detections, newDetection as Detection]);
      
      // به روز کردن آمار
      if (stats) {
        setStats({
          ...stats,
          totalDetections: stats.totalDetections + 1,
          lastScanDate: new Date().toISOString()
        });
      }
      
      toast({
        title: "افزودن تشخیص جدید",
        description: "تشخیص جدید با موفقیت ثبت شد",
      });
    } catch (err) {
      console.error('Error adding new detection:', err);
      toast({
        title: "خطا در ثبت تشخیص",
        description: "مشکلی در ذخیره‌سازی اطلاعات رخ داد",
        variant: "destructive",
      });
    }
  };

  const value = {
    detections,
    scanHistory,
    stats,
    isLoading,
    error,
    refreshData,
    addNewDetection
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
