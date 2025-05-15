import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/Spinner';
import { toast } from '@/hooks/use-toast';
import { analyzeAudioSample } from '@/services/api';
import { useData } from '@/context/DataContext';
import { AudioVisualizer } from '@/components/AudioVisualizer';
import { FrequencySpectrum } from '@/components/FrequencySpectrum';
import { CONFIDENCE_THRESHOLDS } from '@/config/constants';

// مشخصات صوتی انواع ماینر برای مقایسه
const MINER_AUDIO_SIGNATURES = {
  'Antminer S19': { frequency: '40-60Hz', pattern: 'continuous', decibels: '65-75dB' },
  'Whatsminer M30S': { frequency: '45-65Hz', pattern: 'pulsating', decibels: '70-80dB' },
  'Avalon A1246': { frequency: '50-70Hz', pattern: 'rhythmic', decibels: '60-70dB' },
  'GPU Mining Rig': { frequency: '30-50Hz', pattern: 'variable', decibels: '55-65dB' },
};

const AcousticAnalysis = () => {
  const { addNewDetection } = useData();
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [sensitivity, setSensitivity] = useState(75);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
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
          toast({
            title: "خطا در دریافت موقعیت",
            description: "امکان دسترسی به موقعیت جغرافیایی وجود ندارد",
            variant: "destructive",
          });
        }
      );
    }
  }, []);
  
  // پاکسازی منابع هنگام خروج از کامپوننت
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  // شروع ضبط صدا
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // ایجاد AudioContext برای تحلیل صدا در لحظه
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      source.connect(analyserRef.current);
      
      // ایجاد MediaRecorder برای ذخیره صدا
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.start(100);
      setIsRecording(true);
      setRecordingTime(0);
      setAnalysisResult(null);
      
      // شروع تایمر برای نمایش زمان ضبط
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
        
        // به‌روزرسانی داده‌های صوتی برای نمایش
        if (analyserRef.current) {
          const bufferLength = analyserRef.current.frequencyBinCount;
          const audioDataArray = new Float32Array(bufferLength);
          const frequencyDataArray = new Uint8Array(bufferLength);
          
          analyserRef.current.getFloatTimeDomainData(audioDataArray);
          analyserRef.current.getByteFrequencyData(frequencyDataArray);
          
          setAudioData(audioDataArray);
          setFrequencyData(frequencyDataArray);
        }
      }, 1000);
      
      toast({
        title: "ضبط صدا",
        description: "در حال ضبط صدای محیط...",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "خطا در ضبط صدا",
        description: "دسترسی به میکروفون امکان‌پذیر نیست",
        variant: "destructive",
      });
    }
  };
  
  // توقف ضبط صدا
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      mediaRecorderRef.current.onstop = async () => {
        // تبدیل قطعات صوتی به یک فایل صوتی
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // شروع تحلیل صدا
        await analyzeAudio(audioBlob);
      };
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setIsRecording(false);
    }
  };
  
  // تحلیل صدای ضبط شده
  const analyzeAudio = async (audioBlob: Blob) => {
    if (!location) {
      toast({
        title: "خطا در تحلیل",
        description: "موقعیت جغرافیایی در دسترس نیست",
        variant: "destructive",
      });
      return;
    }
    
    setIsAnalyzing(true);
    
    try {
      toast({
        title: "تحلیل صدا",
        description: "در حال تحلیل نمونه صوتی با هوش مصنوعی...",
      });
      
      // ارسال صدا به API تحلیل صوتی
      const result = await analyzeAudioSample(audioBlob);
      setAnalysisResult(result);
      
      // اگر صدای ماینر تشخیص داده شد، به لیست تشخیص‌ها اضافه کن
      if (result.isMiningSoundDetected && result.confidence >= sensitivity) {
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
          confidence: result.confidence,
          type: result.minerType || 'UNKNOWN',
          detectionMethod: 'acoustic',
          deviceInfo: result.analysis.possibleDevice || 'دستگاه ناشناخته',
          audioProfile: {
            frequency: result.analysis.dominantFrequency,
            pattern: result.analysis.pattern,
            decibels: result.analysis.decibels
          }
        });
        
        toast({
          title: "تشخیص موفق",
          description: `دستگاه ماینر با اطمینان ${result.confidence}% شناسایی شد`,
          variant: "default",
        });
      } else {
        toast({
          title: "نتیجه تحلیل",
          description: result.isMiningSoundDetected 
            ? `صدای مشکوک با اطمینان ${result.confidence}% شناسایی شد (کمتر از آستانه ${sensitivity}%)`
            : "هیچ صدای مشکوک به ماینر شناسایی نشد",
        });
      }
    } catch (error) {
      console.error('Error analyzing audio:', error);
      toast({
        title: "خطا در تحلیل صدا",
        description: "مشکلی در پردازش نمونه صوتی رخ داد",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // تعیین رنگ نشانگر اطمینان
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) return 'text-red-500';
    if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-mining/80 border-mining-border">
        <CardHeader className="pb-2 border-b border-mining-border">
          <div className="flex justify-between items-center">
            <CardTitle className="text-md text-mining-foreground">ضبط و تحلیل صدا</CardTitle>
            {isRecording && (
              <Badge className="bg-red-500/20 text-red-500 border-red-500/30 animate-pulse">
                در حال ضبط: {recordingTime} ثانیه
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="h-40 bg-mining-accent/5 rounded-md border border-mining-border flex items-center justify-center overflow-hidden">
            {audioData ? (
              <AudioVisualizer audioData={audioData} height={150} />
            ) : (
              <div className="text-mining-muted text-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                  className="w-12 h-12 mx-auto opacity-30 mb-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                <p>برای شروع ضبط صدا دکمه زیر را فشار دهید</p>
              </div>
            )}
          </div>
          
          {frequencyData && (
            <div className="h-32 bg-mining-accent/5 rounded-md border border-mining-border overflow-hidden">
              <FrequencySpectrum frequencyData={frequencyData} height={120} />
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-mining-muted">حساسیت تشخیص</span>
              <span className="text-sm font-medium">{sensitivity}%</span>
            </div>
            <Slider
              value={[sensitivity]}
              min={50}
              max={95}
              step={5}
              onValueChange={(value) => setSensitivity(value[0])}
              disabled={isRecording || isAnalyzing}
              className="my-4"
            />
            <div className="flex justify-between text-xs text-mining-muted">
              <span>حساسیت کم</span>
              <span>حساسیت زیاد</span>
            </div>
          </div>
          
          <div className="flex space-x-3 space-x-reverse">
            {!isRecording ? (
              <Button 
                className="flex-1 bg-mining-accent hover:bg-mining-accent/80 text-black font-medium"
                onClick={startRecording}
                disabled={isAnalyzing}
              >
                شروع ضبط صدا
              </Button>
            ) : (
              <Button 
                className="flex-1 bg-mining-danger hover:bg-mining-danger/80 text-white font-medium"
                onClick={stopRecording}
              >
                توقف و تحلیل
              </Button>
            )}
          </div>
          
          {location && (
            <div className="text-xs text-mining-muted text-center mt-2">
              موقعیت فعلی: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-mining/80 border-mining-border">
        <CardHeader className="pb-2 border-b border-mining-border">
          <CardTitle className="text-md text-mining-foreground">نتایج تحلیل صوتی</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isAnalyzing ? (
            <div className="h-full flex flex-col items-center justify-center py-12">
              <Spinner size="lg" />
              <p className="mt-4 text-mining-muted">در حال تحلیل نمونه صوتی...</p>
              <p className="text-xs text-mining-muted mt-2">این فرآیند ممکن است چند ثانیه طول بکشد</p>
            </div>
          ) : analysisResult ? (
            <div className="space-y-4">
              <div className="bg-mining-accent/10 p-4 rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">نتیجه تشخیص</h3>
                  <Badge className={`${analysisResult.isMiningSoundDetected ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                    {analysisResult.isMiningSoundDetected ? 'صدای ماینر شناسایی شد' : 'صدای ماینر شناسایی نشد'}
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
                <p className="text-xs text-mining-muted mt-2">
                  {analysisResult.confidence >= CONFIDENCE_THRESHOLDS.HIGH ? 'اطمینان بالا - احتمال زیاد ماینر است' :
                   analysisResult.confidence >= CONFIDENCE_THRESHOLDS.MEDIUM ? 'اطمینان متوسط - نیاز به بررسی بیشتر' :
                   'اطمینان پایین - احتمالاً صدای محیطی است'}
                </p>
              </div>
              
              {analysisResult.isMiningSoundDetected && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-mining-accent/10 p-3 rounded-md">
                      <div className="text-xs text-mining-muted mb-1">فرکانس غالب</div>
                      <div className="font-bold">{analysisResult.analysis.dominantFrequency} Hz</div>
                    </div>
                    <div className="bg-mining-accent/10 p-3 rounded-md">
                      <div className="text-xs text-mining-muted mb-1">شدت صدا</div>
                      <div className="font-bold">{analysisResult.analysis.decibels} dB</div>
                    </div>
                    <div className="bg-mining-accent/10 p-3 rounded-md">
                      <div className="text-xs text-mining-muted mb-1">الگوی صوتی</div>
                      <div className="font-bold">{analysisResult.analysis.pattern}</div>
                    </div>
                    <div className="bg-mining-accent/10 p-3 rounded-md">
                      <div className="text-xs text-mining-muted mb-1">دستگاه احتمالی</div>
                      <div className="font-bold">{analysisResult.analysis.possibleDevice || 'نامشخص'}</div>
                    </div>
                  </div>
                  
                  <div className="bg-mining-accent/10 p-3 rounded-md">
                    <h3 className="text-sm font-medium mb-2">مقایسه با الگوهای شناخته شده</h3>
                    <div className="space-y-2">
                      {Object.entries(MINER_AUDIO_SIGNATURES).map(([device, signature]) => (
                        <div key={device} className="flex justify-between text-xs">
                          <span>{device}</span>
                          <span className="text-mining-muted">
                            {signature.frequency}, {signature.pattern}, {signature.decibels}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-mining-accent/10 p-3 rounded-md">
                    <h3 className="text-sm font-medium mb-2">توضیحات تکمیلی</h3>
                    <p className="text-sm">{analysisResult.analysis.description || 'الگوی صوتی با مشخصات دستگاه‌های استخراج ارز دیجیتال مطابقت دارد. فن‌های خنک‌کننده با سرعت بالا و الگوی صوتی مداوم از مشخصات اصلی این تشخیص است.'}</p>
                  </div>
                </>
              )}
              
              <div className="flex space-x-2 space-x-reverse">
                <Button 
                  className="flex-1 bg-mining-accent hover:bg-mining-accent/80 text-black font-medium"
                  onClick={startRecording}
                >
                  ضبط مجدد
                </Button>
                
                {analysisResult.isMiningSoundDetected && (
                  <Button 
                    className="flex-1 bg-mining-danger/80 hover:bg-mining-danger text-white font-medium"
                    onClick={() => {
                      toast({
                        title: "اعلام به مرکز",
                        description: "اطلاعات صوتی با موفقیت به مرکز نظارت ارسال شد",
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
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <div>
                <p className="mb-2">هنوز تحلیلی انجام نشده است</p>
                <p className="text-xs">برای شروع، صدای محیط را ضبط کنید</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcousticAnalysis;