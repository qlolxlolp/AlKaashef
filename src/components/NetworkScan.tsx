import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/Spinner';
import { toast } from '@/hooks/use-toast';
import { analyzeNetworkTraffic } from '@/services/api';
import { useData } from '@/context/DataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NetworkGraph } from '@/components/NetworkGraph';
import { CONFIDENCE_THRESHOLDS } from '@/config/constants';

// لیست پول‌های استخراج شناخته شده
const KNOWN_MINING_POOLS = [
  { name: 'Antpool', url: '*.antpool.com', ports: [3333, 8080, 8443] },
  { name: 'F2Pool', url: '*.f2pool.com', ports: [3333, 8888, 25] },
  { name: 'Poolin', url: '*.poolin.com', ports: [443, 5555, 1883] },
  { name: 'BTC.com', url: '*.btc.com', ports: [1800, 1801, 8080] },
  { name: 'ViaBTC', url: '*.viabtc.com', ports: [3333, 8888, 3256] },
  { name: 'Binance Pool', url: '*.binancepool.com', ports: [8888, 3333, 443] },
  { name: 'SlushPool', url: '*.slushpool.com', ports: [3333, 3353] },
  { name: 'Foundry USA', url: '*.foundryusapool.com', ports: [4444, 3333] },
  { name: 'Ezil', url: '*.ezil.me', ports: [5555, 5556] },
  { name: 'NiceHash', url: '*.nicehash.com', ports: [3333, 3353] },
];

// الگوهای ترافیک شبکه مشکوک
const SUSPICIOUS_PATTERNS = [
  { name: 'Stratum Protocol', description: 'پروتکل استخراج ارز دیجیتال', severity: 'high' },
  { name: 'High Frequency TCP', description: 'ارتباطات TCP با فرکانس بالا', severity: 'medium' },
  { name: 'Persistent Connections', description: 'اتصالات پایدار به سرورهای خارجی', severity: 'medium' },
  { name: 'Mining Port Usage', description: 'استفاده از پورت‌های رایج استخراج', severity: 'high' },
  { name: 'Encrypted Mining Traffic', description: 'ترافیک رمزنگاری شده به پول‌های استخراج', severity: 'high' },
];

const NetworkScan = () => {
  const { addNewDetection } = useData();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const [scanResults, setScanResults] = useState<any>(null);
  const [detectedDevices, setDetectedDevices] = useState<any[]>([]);
  const [networkData, setNetworkData] = useState<any>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  // دریافت موقعیت جغرافیایی کاربر
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);
  
  // شروع اسکن شبکه
  const startNetworkScan = async () => {
    if (!location) {
      toast({
        title: "خطا در اسکن",
        description: "موقعیت جغرافیایی در دسترس نیست",
        variant: "destructive",
      });
      return;
    }
    
    setIsScanning(true);
    setScanProgress(0);
    setScanStage('initializing');
    setScanResults(null);
    setDetectedDevices([]);
    
    toast({
      title: "اسکن شبکه",
      description: "در حال آماده‌سازی اسکن شبکه...",
    });
    
    try {
      // شبیه‌سازی مراحل اسکن شبکه
      await simulateScanStage('شناسایی دستگاه‌های شبکه', 20);
      await simulateScanStage('بررسی پورت‌های باز', 40);
      await simulateScanStage('تحلیل ترافیک شبکه', 70);
      await simulateScanStage('جستجوی الگوهای مشکوک', 90);
      
      // در یک سیستم واقعی، اینجا داده‌های واقعی شبکه جمع‌آوری می‌شود
      const networkScanData = await collectNetworkData();
      
      // تحلیل داده‌های شبکه با استفاده از هوش مصنوعی
      const analysisResult = await analyzeNetworkTraffic(networkScanData);
      
      // ذخیره نتایج
      setScanResults(analysisResult);
      setNetworkData(networkScanData);
      
      // پردازش دستگاه‌های شناسایی شده
      if (analysisResult.miningPoolsDetected.length > 0 || analysisResult.suspiciousConnections.length > 0) {
        // ایجاد لیست دستگاه‌های مشکوک
        const devices = networkScanData.devices
          .filter(device => device.suspiciousScore > 50)
          .map(device => ({
            ...device,
            confidence: Math.min(device.suspiciousScore, 95)
          }));
        
        setDetectedDevices(devices);
        
        // افزودن دستگاه‌های با اطمینان بالا به لیست تشخیص‌ها
        for (const device of devices) {
          if (device.confidence >= 75) {
            // دریافت آدرس از مختصات جغرافیایی
            const addressResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1`);
            const addressData = await addressResponse.json();
            const address = addressData.display_name || 'آدرس نامشخص';
            
            await addNewDetection({
              timestamp: new Date().toLocaleString('fa-IR'),
              location: {
                lat: location.lat,
                lng: location.lng,
                address
              },
              confidence: device.confidence,
              type: device.probableType || 'UNKNOWN',
              detectionMethod: 'network',
              deviceInfo: `${device.manufacturer || ''} ${device.model || 'دستگاه ناشناخته'}`,
              networkActivity: {
                pools: device.connectedPools || [],
                connections: device.connections || 0,
                bandwidth: device.bandwidth || 0
              }
            });
          }
        }
        
        toast({
          title: "تشخیص موفق",
          description: `${devices.length} دستگاه مشکوک به استخراج شناسایی شد`,
          variant: "default",
        });
      } else {
        toast({
          title: "نتیجه اسکن",
          description: "هیچ فعالیت مشکوک به استخراج در شبکه شناسایی نشد",
        });
      }
    } catch (error) {
      console.error('Network scan error:', error);
      toast({
        title: "خطا در اسکن شبکه",
        description: "مشکلی در انجام اسکن شبکه رخ داد",
        variant: "destructive",
      });
    } finally {
      setScanProgress(100);
      setScanStage('completed');
      setIsScanning(false);
    }
  };
  
  // شبیه‌سازی مراحل اسکن
  const simulateScanStage = async (stage: string, targetProgress: number) => {
    setScanStage(stage);
    const startProgress = scanProgress;
    const duration = 1000; // مدت زمان هر مرحله (میلی‌ثانیه)
    const startTime = Date.now();
    
    return new Promise<void>(resolve => {
      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(
          startProgress + ((targetProgress - startProgress) * elapsed / duration),
          targetProgress
        );
        
        setScanProgress(Math.floor(progress));
        
        if (progress < targetProgress) {
          requestAnimationFrame(updateProgress);
        } else {
          resolve();
        }
      };
      
      updateProgress();
    });
  };
  
  // جمع‌آوری داده‌های شبکه (در یک سیستم واقعی، این تابع داده‌های واقعی را جمع‌آوری می‌کند)
  const collectNetworkData = async () => {
    // در یک سیستم واقعی، اینجا از API‌های شبکه استفاده می‌شود
    // این داده‌ها برای نمایش قابلیت‌های سیستم شبیه‌سازی شده‌اند
    
    // شبیه‌سازی تأخیر شبکه
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // تولید داده‌های شبیه‌سازی شده
    const hasMiners = Math.random() > 0.5;
    
    const devices = [];
    const totalDevices = 5 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < totalDevices; i++) {
      const isMiner = hasMiners && Math.random() > 0.7;
      const suspiciousScore = isMiner ? 
        75 + Math.floor(Math.random() * 20) : 
        Math.floor(Math.random() * 40);
      
      let connectedPools = [];
      if (isMiner) {
        const poolCount = 1 + Math.floor(Math.random() * 2);
        for (let j = 0; j < poolCount; j++) {
          const randomPool = KNOWN_MINING_POOLS[Math.floor(Math.random() * KNOWN_MINING_POOLS.length)];
          connectedPools.push(randomPool.name);
        }
      }
      
      devices.push({
        id: `device-${i + 1}`,
        ipAddress: `192.168.1.${10 + i}`,
        macAddress: `00:1A:2B:${i < 10 ? '0' + i : i}:${i * 3}:${i * 5}`,
        manufacturer: isMiner ? 'Bitmain' : ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Asus'][Math.floor(Math.random() * 5)],
        model: isMiner ? 'Antminer S19' : 'Generic Device',
        connections: isMiner ? 10 + Math.floor(Math.random() * 20) : 1 + Math.floor(Math.random() * 5),
        bandwidth: isMiner ? 500 + Math.floor(Math.random() * 1500) : 10 + Math.floor(Math.random() * 200),
        suspiciousScore,
        connectedPools,
        probableType: isMiner ? 'ASIC' : 'UNKNOWN',
        openPorts: isMiner ? 
          [3333, 8080, 443] : 
          [80, 443]
      });
    }
    
    const connections = [];
    devices.forEach(device => {
      const connectionCount = device.connections;
      for (let i = 0; i < connectionCount; i++) {
        const isMiningPool = device.connectedPools && device.connectedPools.length > 0 && Math.random() > 0.5;
        let target;
        
        if (isMiningPool) {
          const pool = KNOWN_MINING_POOLS[Math.floor(Math.random() * KNOWN_MINING_POOLS.length)];
          target = pool.name;
        } else {
          target = ['cdn.example.com', 'api.service.com', 'update.system.net', 'time.server.org'][Math.floor(Math.random() * 4)];
        }
        
        connections.push({
          source: device.id,
          target,
          protocol: Math.random() > 0.3 ? 'TCP' : 'UDP',
          port: isMiningPool ? 
            KNOWN_MINING_POOLS[Math.floor(Math.random() * KNOWN_MINING_POOLS.length)].ports[0] : 
            [80, 443, 53, 123][Math.floor(Math.random() * 4)],
          bandwidth: 10 + Math.floor(Math.random() * 100),
          isSuspicious: isMiningPool
        });
      }
    });
    
    return {
      scanTime: new Date().toISOString(),
      networkName: 'Local Network',
      devices,
      connections,
      totalBandwidth: devices.reduce((sum, device) => sum + device.bandwidth, 0),
      suspiciousConnections: connections.filter(conn => conn.isSuspicious)
    };
  };
  
  // تعیین رنگ نشانگر اطمینان
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return 'text-red-500';
    if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  // تعیین کلاس CSS برای نمایش شدت خطر
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-500 border-green-500/30';
      default: return 'bg-mining-accent/20 text-mining-accent border-mining-accent/30';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-mining/80 border-mining-border">
        <CardHeader className="pb-2 border-b border-mining-border">
          <div className="flex justify-between items-center">
            <CardTitle className="text-md text-mining-foreground">اسکن شبکه</CardTitle>
            {isScanning && (
              <Badge className="bg-mining-accent/20 text-mining-accent border-mining-accent/30">
                {scanProgress}% تکمیل شده
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {isScanning ? (
            <div className="space-y-4">
              <div className="h-4 w-full bg-mining-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-mining-accent transition-all duration-300 ease-out"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
              
              <div className="text-center">
                <p className="text-mining-accent font-medium">{scanStage}</p>
                <p className="text-xs text-mining-muted mt-1">لطفاً صبر کنید...</p>
              </div>
              
              <div className="bg-mining-accent/5 border border-mining-border rounded-md p-4 h-64 overflow-auto font-mono text-xs">
                {/* نمایش لاگ‌های شبیه‌سازی شده */}
                {scanProgress >= 10 && <p className="text-mining-muted">[INFO] شروع اسکن شبکه محلی...</p>}
                {scanProgress >= 15 && <p className="text-mining-muted">[INFO] جستجوی دستگاه‌های متصل به شبکه...</p>}
                {scanProgress >= 20 && <p className="text-mining-accent">[INFO] شناسایی {5 + Math.floor(Math.random() * 10)} دستگاه در شبکه محلی</p>}
                {scanProgress >= 30 && <p className="text-mining-muted">[INFO] بررسی پورت‌های باز روی دستگاه‌ها...</p>}
                {scanProgress >= 40 && <p className="text-mining-accent">[INFO] شناسایی پورت‌های باز: 80, 443, 3333, 8080</p>}
                {scanProgress >= 50 && <p className="text-mining-muted">[INFO] تحلیل ترافیک شبکه...</p>}
                {scanProgress >= 60 && <p className="text-mining-muted">[INFO] بررسی اتصالات خارجی...</p>}
                {scanProgress >= 70 && <p className="text-mining-accent">[ALERT] شناسایی اتصال به سرورهای مشکوک</p>}
                {scanProgress >= 80 && <p className="text-mining-muted">[INFO] جستجوی الگوهای ترافیک استخراج ارز دیجیتال...</p>}
                {scanProgress >= 90 && <p className="text-mining-accent">[ALERT] شناسایی الگوی ترافیک Stratum Protocol</p>}
                {scanProgress >= 95 && <p className="text-mining-muted">[INFO] تکمیل تحلیل شبکه...</p>}
                {scanProgress >= 100 && <p className="text-green-500">[SUCCESS] اسکن شبکه با موفقیت انجام شد</p>}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-mining-accent/5 p-4 rounded-md">
                <h3 className="font-medium mb-2">اطلاعات شبکه</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-mining-muted text-xs">نام شبکه</p>
                    <p>شبکه محلی</p>
                  </div>
                  <div>
                    <p className="text-mining-muted text-xs">آدرس IP</p>
                    <p>192.168.1.0/24</p>
                  </div>
                  <div>
                    <p className="text-mining-muted text-xs">روش اسکن</p>
                    <p>پسیو + اکتیو</p>
                  </div>
                  <div>
                    <p className="text-mining-muted text-xs">عمق اسکن</p>
                    <p>کامل</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-mining-accent/5 p-4 rounded-md">
                <h3 className="font-medium mb-2">پول‌های استخراج شناخته شده</h3>
                <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                  {KNOWN_MINING_POOLS.slice(0, 5).map((pool, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{pool.name}</span>
                      <span className="text-mining-muted">{pool.url} ({pool.ports.join(', ')})</span>
                    </div>
                  ))}
                  <div className="text-mining-muted text-center pt-1">
                    + {KNOWN_MINING_POOLS.length - 5} مورد دیگر
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full bg-mining-accent hover:bg-mining-accent/80 text-black font-medium"
                onClick={startNetworkScan}
              >
                شروع اسکن شبکه
              </Button>
              
              {location && (
                <div className="text-xs text-mining-muted text-center">
                  موقعیت فعلی: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-mining/80 border-mining-border">
        <CardHeader className="pb-2 border-b border-mining-border">
          <CardTitle className="text-md text-mining-foreground">نتایج اسکن شبکه</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isScanning ? (
            <div className="h-full flex flex-col items-center justify-center py-12">
              <Spinner size="lg" />
              <p className="mt-4 text-mining-muted">در حال تحلیل ترافیک شبکه...</p>
              <p className="text-xs text-mining-muted mt-2">این فرآیند ممکن است چند دقیقه طول بکشد</p>
            </div>
          ) : scanResults ? (
            <div className="space-y-4">
              <div className="bg-mining-accent/10 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">نتیجه تشخیص</h3>
                  <Badge className={scanResults.miningPoolsDetected.length > 0 ? 
                    'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}>
                    {scanResults.miningPoolsDetected.length > 0 ? 
                      'فعالیت استخراج شناسایی شد' : 'فعالیت استخراج شناسایی نشد'}
                  </Badge>
                </div>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-mining-border rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getConfidenceColor(scanResults.confidence)}`}
                      style={{ width: `${scanResults.confidence}%` }}
                    ></div>
                  </div>
                  <span className={`ml-2 text-sm font-medium ${getConfidenceColor(scanResults.confidence)}`}>
                    {scanResults.confidence}%
                  </span>
                </div>
              </div>
              
              {scanResults.miningPoolsDetected.length > 0 && (
                <div className="bg-mining-accent/10 p-4 rounded-md">
                  <h3 className="font-medium mb-2">پول‌های استخراج شناسایی شده</h3>
                  <div className="space-y-2">
                    {scanResults.miningPoolsDetected.map((pool, index) => (
                      <Badge key={index} className="bg-red-500/20 text-red-500 border-red-500/30 mr-2 mb-2">
                        {pool}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {detectedDevices.length > 0 && (
                <div className="bg-mining-accent/10 p-4 rounded-md">
                  <h3 className="font-medium mb-2">دستگاه‌های مشکوک</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-mining-accent">IP</TableHead>
                          <TableHead className="text-mining-accent">نوع</TableHead>
                          <TableHead className="text-mining-accent">اطمینان</TableHead>
                          <TableHead className="text-mining-accent">پورت‌ها</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detectedDevices.map((device, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono">{device.ipAddress}</TableCell>
                            <TableCell>{device.probableType}</TableCell>
                            <TableCell className={getConfidenceColor(device.confidence)}>
                              {device.confidence}%
                            </TableCell>
                            <TableCell className="font-mono">
                              {device.openPorts.join(', ')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              
              {networkData && (
                <div className="bg-mining-accent/10 p-4 rounded-md">
                  <h3 className="font-medium mb-2">نمودار ارتباطات شبکه</h3>
                  <div className="h-48 bg-mining/50 rounded border border-mining-border">
                    <NetworkGraph 
                      devices={networkData.devices} 
                      connections={networkData.connections} 
                    />
                  </div>
                </div>
              )}
              
              <div className="bg-mining-accent/10 p-4 rounded-md">
                <h3 className="font-medium mb-2">الگوهای مشکوک شناسایی شده</h3>
                <div className="space-y-2">
                  {SUSPICIOUS_PATTERNS.filter((_, i) => scanResults.miningPoolsDetected.length > 0 ? i < 3 : i === 2).map((pattern, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{pattern.name}</p>
                        <p className="text-xs text-mining-muted">{pattern.description}</p>
                      </div>
                      <Badge className={getSeverityClass(pattern.severity)}>
                        {pattern.severity === 'high' ? 'خطر بالا' : 
                         pattern.severity === 'medium' ? 'خطر متوسط' : 'خطر کم'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex space-x-2 space-x-reverse">
                <Button 
                  className="flex-1 bg-mining-accent hover:bg-mining-accent/80 text-black font-medium"
                  onClick={startNetworkScan}
                >
                  اسکن مجدد
                </Button>
                
                {scanResults.miningPoolsDetected.length > 0 && (
                  <Button 
                    className="flex-1 bg-mining-danger/80 hover:bg-mining-danger text-white font-medium"
                    onClick={() => {
                      toast({
                        title: "اعلام به مرکز",
                        description: "اطلاعات شبکه با موفقیت به مرکز نظارت ارسال شد",
                        variant: "default",
                      });
                    }}
                  >
                    اعلام به مرکز
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-mining-muted py-12">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                className="w-12 h-12 opacity-30">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <div>
                <p className="mb-2">هنوز اسکنی انجام نشده است</p>
                <p className="text-xs">برای شروع، دکمه اسکن شبکه را فشار دهید</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkScan;