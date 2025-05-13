
import { toast } from '@/hooks/use-toast';

// شبیه‌سازی تاخیر شبکه
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// اطلاعات ماینرهای شناسایی شده
export const fetchMinerData = async () => {
  try {
    // در محیط واقعی، این یک درخواست API خواهد بود
    // const response = await fetch('/api/miners');
    // return await response.json();
    
    await delay(800); // شبیه‌سازی تاخیر شبکه
    
    // داده‌های نمونه - در محیط واقعی، این داده‌ها از سرور دریافت می‌شوند
    return [
      { 
        id: 1, 
        timestamp: '۱۴۰۴/۰۲/۲۴ ۱۴:۳۰:۱۵',
        location: {
          lat: 33.6380, 
          lng: 46.4153,
          address: 'ایلام، خیابان طالقانی، کوچه شماره ۵'
        },
        confidence: 87,
        type: 'ASIC',
        detectionMethod: 'acoustic',
        deviceInfo: 'Bitmain Antminer S19'
      },
      { 
        id: 2, 
        timestamp: '۱۴۰۴/۰۲/۲۳ ۱۸:۱۵:۳۹',
        location: {
          lat: 33.6299, 
          lng: 46.4215,
          address: 'ایلام، میدان امام، پاساژ مرکزی، طبقه سوم'
        },
        confidence: 65,
        type: 'GPU',
        detectionMethod: 'network',
        deviceInfo: 'GPU Mining Rig'
      },
      { 
        id: 3, 
        timestamp: '۱۴۰۴/۰۲/۲۴ ۱۰:۰۵:۵۲',
        location: {
          lat: 33.6440, 
          lng: 46.4253,
          address: 'ایلام، بلوار آزادی، مجتمع تجاری نور'
        },
        confidence: 92,
        type: 'ASIC',
        detectionMethod: 'emi',
        deviceInfo: 'Whatsminer M30S'
      },
      { 
        id: 4, 
        timestamp: '۱۴۰۴/۰۲/۲۰ ۰۹:۱۷:۴۵',
        location: {
          lat: 33.6375, 
          lng: 46.4180,
          address: 'ایلام، خیابان فردوسی، کوچه شهید رضایی'
        },
        confidence: 78,
        type: 'ASIC',
        detectionMethod: 'combined',
        deviceInfo: 'MicroBT Whatsminer M32'
      },
      { 
        id: 5, 
        timestamp: '۱۴۰۴/۰۲/۱۸ ۲۲:۴۰:۱۲',
        location: {
          lat: 33.6320, 
          lng: 46.4190,
          address: 'ایلام، شهرک صنعتی، بلوک ۱۲'
        },
        confidence: 95,
        type: 'ASIC',
        detectionMethod: 'acoustic',
        deviceInfo: 'Multiple ASICs'
      }
    ];
  } catch (error) {
    console.error('Error fetching miner data:', error);
    throw new Error('خطا در دریافت اطلاعات ماینرها');
  }
};

// تاریخچه اسکن‌ها
export const fetchScanHistory = async () => {
  try {
    await delay(600);
    
    return [
      {
        id: 1,
        date: '۱۴۰۴/۰۲/۲۴',
        location: 'ایلام، مرکز شهر',
        detectedMiners: 3,
        duration: 45, // دقیقه
        operator: 'امیری، محمد',
        status: 'completed'
      },
      {
        id: 2,
        date: '۱۴۰۴/۰۲/۲۰',
        location: 'ایلام، منطقه صنعتی',
        detectedMiners: 5,
        duration: 65,
        operator: 'صادقی، علی',
        status: 'completed'
      },
      {
        id: 3,
        date: '۱۴۰۴/۰۲/۱۸',
        location: 'ایلام، شهرک جنوبی',
        detectedMiners: 1,
        duration: 30,
        operator: 'امیری، محمد',
        status: 'completed'
      },
      {
        id: 4,
        date: '۱۴۰۴/۰۲/۱۵',
        location: 'ایلام، منطقه شمالی',
        detectedMiners: 0,
        duration: 25,
        operator: 'مرادی، حسین',
        status: 'completed'
      },
      {
        id: 5,
        date: '۱۴۰۴/۰۲/۱۲',
        location: 'ایلام، مرکز تجاری',
        detectedMiners: 2,
        duration: 40,
        operator: 'صادقی، علی',
        status: 'completed'
      },
      {
        id: 6,
        date: '۱۴۰۴/۰۲/۱۰',
        location: 'ایلام، منطقه گلستان',
        detectedMiners: 1,
        duration: 35,
        operator: 'امیری، محمد',
        status: 'completed'
      },
      {
        id: 7,
        date: '۱۴۰۴/۰۲/۰۵',
        location: 'ایلام، منطقه بانبرز',
        detectedMiners: 3,
        duration: 50,
        operator: 'مرادی، حسین',
        status: 'completed'
      }
    ];
  } catch (error) {
    console.error('Error fetching scan history:', error);
    throw new Error('خطا در دریافت تاریخچه اسکن‌ها');
  }
};

// آمار کلی تشخیص
export const fetchDetectionStats = async () => {
  try {
    await delay(500);
    
    return {
      totalScans: 15,
      totalDetections: 19,
      averageConfidence: 81,
      lastScanDate: '۱۴۰۴/۰۲/۲۴ ۱۴:۳۰',
      scansByMethod: {
        acoustic: 7,
        network: 4,
        emi: 3,
        combined: 5
      }
    };
  } catch (error) {
    console.error('Error fetching detection stats:', error);
    throw new Error('خطا در دریافت آمار تشخیص');
  }
};

// موقعیت‌های جغرافیایی ماینرها
export const fetchMinerLocations = async () => {
  try {
    const miners = await fetchMinerData();
    return miners.map(miner => ({
      id: miner.id,
      lat: miner.location.lat,
      lng: miner.location.lng,
      confidence: miner.confidence,
      type: miner.type
    }));
  } catch (error) {
    console.error('Error fetching miner locations:', error);
    throw new Error('خطا در دریافت موقعیت ماینرها');
  }
};

// ارسال گزارش جدید (شبیه‌سازی)
export const sendReport = async (reportData: any) => {
  try {
    await delay(1000);
    
    // شبیه‌سازی وضعیت موفق
    return { success: true, id: Date.now() };
  } catch (error) {
    console.error('Error sending report:', error);
    throw new Error('خطا در ارسال گزارش');
  }
};
