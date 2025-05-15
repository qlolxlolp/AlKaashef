import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/Spinner';
import { toast } from '@/hooks/use-toast';
import { analyzeEMISignals } from '@/services/api';
import { useData } from '@/context/DataContext';
import { EMIVisualizer } from '@/components/EMIVisualizer';
import { CONFIDENCE_THRESHOLDS } from '@/config/constants';

// مشخصات سیگنال‌های EMI انواع ماینر برای مقایسه
const MINER_EMI_SIGNATURES = {
  'Antminer S19': { frequency: '150-250kHz', pattern: 'pulsed', strength: 'high' },
  'Whatsminer M30S': { frequency: '180-280kHz', pattern: 'continuous', strength: 'very high' },
  'Avalon A1246': { frequency: '120-220kHz', pattern: 'modulated', strength: 'medium-high' },
  'GPU Mining Rig': { frequency: '80-150kHz', pattern: 'variable', strength: 'medium' },
};

const EMIAnalysis = () => {
  const { addNewDetection } = useData();
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [emiData, setEmiData] = useState<number[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [frequencyRange, setFrequencyRange] = useState<[number, number]>([0, 500]);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [scanDirection, setScanDirection] = useState(0);
  const [signalStrength, setSignalStrength] = useState(0);
  
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
  
  // شروع اسکن EMI
  const startEMIScan = async () => {
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
    setEmiData([]);
    setAnalysisResult(null);
    setSignalStrength(0);
    
    toast({
      title: "اسکن سیگنال‌های EMI",
      description: "در حال جمع‌آوری داده‌های الکترومغناطیسی...",
    });
    
    try {
      // شبیه‌سازی جمع‌آوری داده‌های EMI
      await simulateEMIDataCollection();
      
      // در یک سیستم واقعی، اینجا داده‌های واقعی EMI جمع‌آوری می‌شود
      const emiScanData = generateEMIData();
      setEmiData(emiScanData.data);
      
      // تحلیل داده‌های EMI با استفاده از هوش مصنوعی
      const analysisResult = await analyzeEMISignals({
        data: emiScanData.data,
        sampleRate: emiScanData.sampleRate,
        frequencyRange: emiScanData.frequencyRange,
        timestamp: new Date().toISOString(),
        location: location
      });
      
      // ذخیره نتایج
      setAnalysisResult(analysisResult);
      setSignalStrength(analysisResult.signalStrength);
      
      // اگر سیگنال ماینر تشخیص داده شد، به لیست تشخیص‌ها اضافه کن
      if (analysisResult.minerSignatureDetected && analysisResult.confidence >= 70) {
        // دریافت آدرس از مختصات جغرافیایی
        const addressResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1`);
        const addressData = await addressResponse.json();
        const address = addressData.display_name || 'آدرس نامشخص';
        
        // افزودن تشخیص جدید
        await addNewDetection({
          timestamp: new Date().toLocaleString('fa-IR'),
          location: {
            lat: location.lat,
            lng: location.lng,
            address
          },
          confidence: analysisResult.confidence,
          type: analysisResult.possibleDevices[0] || 'UNKNOWN',
          detectionMethod: 'emi',
          deviceInfo: analysisResult.possibleDevices.join(', ') || 'دستگاه ناشناخته',
          emiSignature: {
            strength: analysisResult.signalStrength,
            frequency: emiScanData.dominantFrequency,
            pattern: analysisResult.signalPattern || 'نامشخص'
          }
        });
        
        toast({
          title: "تشخیص موفق",
          description: `سیگنال EMI ماینر با اطمینان ${analysisResult.confidence}% شناسایی شد`,
          variant: "default",
        });
      } else {
        toast({
          title: "نتیجه تحلیل",
          description: analysisResult.minerSignatureDetected 
            ? `سیگنال مشکوک با اطمینان ${analysisResult.confidence}% شناسایی شد`
            : "هیچ سیگنال مشکوک به ماینر شناسایی نشد",
        });
      }
    } catch (error) {
      console.error('EMI scan error:', error);
      toast({
        title: "خطا در اسکن EMI",
        description: "مشکلی در انجام اسکن سیگنال‌های الکترومغناطیسی رخ داد",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };
  
  // شبیه‌سازی جمع‌آوری داده‌های EMI
  const simulateEMIDataCollection = async () => {
    const totalSteps = 20;
    const directions = 8;
    
    for (let direction = 0; direction < directions; direction++) {
      setScanDirection(direction * 45);
      
      for (let step = 0; step < totalSteps; step++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const progress = Math.floor(((direction * totalSteps) + step) / (directions * totalSteps) * 100);
        setScanProgress(progress);
        
        // شبیه‌سازی تغییر در قدرت سیگنال بر اساس جهت
        const baseStrength = Math.random() * 50 + 20;
        const directionFactor = Math.abs(Math.sin((direction + 2) * Math.PI / 4)) * 2;
        setSignalStrength(Math.floor(baseStrength * directionFactor));
        
        // تولید داده‌های EMI موقت برای نمایش
        const tempData = Array(100).fill(0).map((_, i) => {
          const x = i / 100;
          const noise = Math.random() * 10;
          const signal = Math.sin(x * 10) * 20 * directionFactor;
          const peak = direction === 2 || direction === 3 ? Math.exp(-Math.pow((x - 0.5) * 5, 2)) * 50 : 0;
          return Math.max(0, noise + signal + peak);
        });
        setEmiData(tempData);
      }
    }
  };
  
  // تولید داده‌های EMI شبیه‌سازی شده
  const generateEMIData = () => {
    // در یک سیستم واقعی، این داده‌ها از سنسورهای EMI دریافت می‌شوند
    const sampleCount = 500;
    const sampleRate = 1000; // نمونه در ثانیه
    const frequencyRange = [0, 500]; // کیلوهرتز
    
    // شبیه‌سازی وجود یا عدم وجود سیگنال ماینر
    const hasMinerSignal = Math.random() > 0.3;
    
    // تولید داده‌های شبیه‌سازی شده
    const data = Array(sampleCount).fill(0).map((_, i) => {
      const x = i / sampleCount;
      
      // نویز پایه
      const baseNoise = Math.random() * 10;
      
      // سیگنال‌های محیطی معمول
      const environmentalSignal = 
        Math.sin(x * 20) * 5 + // 50Hz برق شهری
        Math.sin(x * 80) * 3 + // سیگنال‌های رادیویی
        Math.sin(x * 120) * 2; // سایر منابع الکترونیکی
      
      // سیگنال ماینر (اگر وجود داشته باشد)
      let minerSignal = 0;
      if (hasMinerSignal) {
        // سیگنال‌های مشخصه ماینر در محدوده 150-250 کیلوهرتز
        minerSignal = 
          Math.sin(x * 150) * 25 * Math.exp(-Math.pow((x - 0.3) * 5, 2)) +
          Math.sin(x * 200) * 30 * Math.exp(-Math.pow((x - 0.5) * 5, 2)) +
          Math.sin(x * 250) * 20 * Math.exp(-Math.pow((x - 0.7) * 5, 2));
      }
      
      return Math.max(0, baseNoise + environmentalSignal + minerSignal);
    });
    
    // محاسبه فرکانس غالب
    let maxValue = 0;
    let dominantFrequency = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i] > maxValue) {
        maxValue = data[i];
        dominantFrequency = i / data.length * (frequencyRange[1] - frequencyRange[0]) + frequencyRange[0];
      }
    }
    
    return {
      data,
      sampleRate,
      frequencyRange,
      dominantFrequency,
      hasMinerSignal
    };
  };
  
  // تعیین رنگ نشانگر اطمینان
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return 'text-red-500';
    if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'text-yellow-500';
    return 'text-green-500';
  };
  
  // تعیین رنگ نشانگر قدرت سیگنال
  const getSignalStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-red-500';
    if (strength >= 50) return 'text-yellow-500';
    if (strength >= 30) return 'text-green-500';
    return 'text-mining-muted';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-mining/80 border-mining-border">
        <CardHeader className="pb-2 border-b border-mining-border">
          <div className="flex justify-between items-center">
            <CardTitle className="text-md text-mining-foreground">اسکن سیگنال‌های EMI</CardTitle>
            {isScanning && (
              <Badge className="bg-mining-accent/20 text-mining-accent border-mining-accent/30">
                {scanProgress}% تکمیل شده
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="relative h-48 bg-mining-accent/5 rounded-md border border-mining-border overflow-hidden">
            <EMIVisualizer 
              data={emiData} 
              height={180} 
              isScanning={isScanning}
            />
            
            {isScanning && (
              <div 
                className="absolute top-0 left-0 h-full w-1 bg-mining-accent"
                style={{ 
                  transform: `rotate(${scanDirection}deg)`,
                  transformOrigin: 'center center',
                  boxShadow: '0 0 10px #03dac6, 0 0 20px #03dac6'
                }}
              ></div>
            )}
            
            {!isScanning && !emiData.length && (
              <div className="absolute inset-0 flex items-center justify-center text-mining-muted">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                    className="w-12 h-12 mx-auto opacity-30 mb-2">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p>برای شروع اسکن EMI دکمه زیر را فشار دهید</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-mining-accent/10 p-3 rounded-md text-center">
              <div className="text-xs text-mining-muted mb-1">محدوده فرکانس</div>
              <div className="font-bold">{frequencyRange[0]}-{frequencyRange[1]} kHz</div>
            </div>
            
            <div className="bg-mining-accent/10 p-3 rounded-md text-center">
              <div className="text-xs text-mining-muted mb-1">قدرت سیگنال</div>
              <div className={`font-bold ${getSignalStrengthColor(signalStrength)}`}>
                {signalStrength}%
              </div>
            </div>
          </div>
          
          <div className="bg-mining-accent/10 p-3 rounded-md">
            <h3 className="text-sm font-medium mb-2">محدوده فرکانسی ماینرها</h3>
            <div className="h-8 w-full bg-mining/50 rounded-md relative">
              {/* نمایش محدوده فرکانسی انواع ماینر */}
              <div className="absolute h-full w-1/4 left-1/4 bg-red-500/20 rounded-md border border-red-500/30" 
                title="ASIC Miners (150-250kHz)"></div>
              <div className="absolute h-full w-1/6 left-1/12 bg-yellow-500/20 rounded-md border border-yellow-500/30"
                title="GPU Miners (80-150kHz)"></div>
              <div className="absolute h-full w-1/5 left-3/5 bg-purple-500/20 rounded-md border border-purple-500/30"
                title="FPGA Miners (250-350kHz)"></div>
              
              {/* خط نشانگر */}
              <div className="absolute top-0 h-full w-0.5 bg-mining-accent"
                style={{ left: `${(frequencyRange[1] / 500) * 100}%` }}></div>
              
              {/* برچسب‌های محور */}
              <div className="absolute -bottom-5 left-0 text-xs text-mining-muted">0</div>
              <div className="absolute -bottom-5 left-1/4 text-xs text-mining-muted">125</div>
              <div className="absolute -bottom-5 left-2/4 text-xs text-mining-muted">250</div>
              <div className="absolute -bottom-5 left-3/4 text-xs text-mining-muted">375</div>
              <div className="absolute -bottom-5 right-0 text-xs text-mining-muted">500 kHz</div>
            </div>
          </div>
          
          <Button 
            className="w-full bg-mining-accent hover:bg-mining-accent/80 text-black font-medium"
            onClick={startEMIScan}
            disabled={isScanning}
          >
            {isScanning ? "در حال اسکن..." : "شروع اسکن EMI"}
          </Button>
          
          {location && (
            <div className="text-xs text-mining-muted text-center">
              موقعیت فعلی: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-mining/80 border-mining-border">
        <CardHeader className="pb-2 border-b border-mining-border">
          <CardTitle className="text-md text-mining-foreground">نتایج تحلیل EMI</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isScanning ? (
            <div className="h-full flex flex-col items-center justify-center py-12">
              <Spinner size="lg" />
              <p className="mt-4 text-mining-muted">در حال تحلیل سیگنال‌های EMI...</p>
              <p className="text-xs text-mining-muted mt-2">این فرآیند ممکن است چند دقیقه طول بکشد</p>
            </div>
          ) : analysisResult ? (
            <div className="space-y-4">
              <div className="bg-mining-accent/10 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">نتیجه تشخیص</h3>
                  <Badge className={analysisResult.minerSignatureDetected ? 
                    'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}>
                    {analysisResult.minerSignatureDetected ? 
                      'سیگنال ماینر شناسایی شد' : 'سیگنال ماینر شناسایی نشد'}
                  </Badge>
                </div>
                <div className="flex items-center mt-2">
                  <div className="w-full bg-mining-border rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getConfidenceColor(analysisResult.confidence)}`}
                      style={{ width: `${analysisResult.confidence}%` }}
                    ></div>
                  </div>
                  <span className={`ml-2 text-sm font-medium ${getConfidenceColor(analysisResult.confidence)}`}>
                    {analysisResult.confidence}%
                  </span>
                </div>
              </div>
              
              {analysisResult.minerSignatureDetected && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-mining-accent/10 p-3 rounded-md">
                      <div className="text-xs text-mining-muted mb-1">قدرت سیگنال</div>
                      <div className={`font-bold ${getSignalStrengthColor(analysisResult.signalStrength)}`}>
                        {analysisResult.signalStrength}%
                      </div>
                    </div>
                    <div className="bg-mining-accent/10 p-3 rounded-md">
                      <div className="text-xs text-mining-muted mb-1">الگوی سیگنال</div>
                      <div className="font-bold">{analysisResult.signalPattern || 'پیوسته'}</div>
                    </div>
                    <div className="bg-mining-accent/10 p-3 rounded-md">
                      <div className="text-xs text-mining-muted mb-1">فاصله تخمینی</div>
                      <div className="font-bold">{Math.floor(100 - analysisResult.signalStrength * 0.8)} متر</div>
                    </div>
                    <div className="bg-mining-accent/10 p-3 rounded-md">
                      <div className="text-xs text-mining-muted mb-1">جهت احتمالی</div>
                      <div className="font-bold">{['شمال', 'شمال شرقی', 'شرق', 'جنوب شرقی', 'جنوب', 'جنوب غربی', 'غرب', 'شمال غربی'][Math.floor(Math.random() * 8)]}</div>
                    </div>
                  </div>
                  
                  <div className="bg-mining-accent/10 p-3 rounded-md">
                    <h3 className="text-sm font-medium mb-2">دستگاه‌های احتمالی</h3>
                    <div className="space-y-2">
                      {analysisResult.possibleDevices.map((device, index) => (
                        <Badge key={index} className="bg-mining-accent/20 text-mining-accent border-mining-accent/30 mr-2 mb-2">
                          {device}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-mining-accent/10 p-3 rounded-md">
                    <h3 className="text-sm font-medium mb-2">مقایسه با الگوهای شناخته شده</h3>
                    <div className="space-y-2">
                      {Object.entries(MINER_EMI_SIGNATURES).map(([device, signature]) => (
                        <div key={device} className="flex justify-between text-xs">
                          <span>{device}</span>
                          <span className="text-mining-muted">
                            {signature.frequency}, {signature.pattern}, {signature.strength}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
              
              <div className="flex space-x-2 space-x-reverse">
                <Button 
                  className="flex-1 bg-mining-accent hover:bg-mining-accent/80 text-black font-medium"
                  onClick={startEMIScan}
                >
                  اسکن مجدد
                </Button>
                
                {analysisResult.minerSignatureDetected && (
                  <Button 
                    className="flex-1 bg-mining-danger/80 hover:bg-mining-danger text-white font-medium"
                    onClick={() => {
                      toast({
                        title: "اعلام به مرکز",
                        description: "اطلاعات EMI با موفقیت به مرکز نظارت ارسال شد",
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
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div>
                <p className="mb-2">هنوز اسکنی انجام نشده است</p>
                <p className="text-xs">برای شروع، دکمه اسکن EMI را فشار دهید</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EMIAnalysis;