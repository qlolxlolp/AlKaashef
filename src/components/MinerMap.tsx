
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';

const MinerMap = () => {
  const { detections, stats, refreshData, isLoading } = useData();
  const [selectedMiner, setSelectedMiner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  
  useEffect(() => {
    // Load map script dynamically
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    document.head.appendChild(script);
    
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
    
    script.onload = () => initializeMap();
    
    return () => {
      document.head.removeChild(script);
      document.head.removeChild(link);
    };
  }, [detections]);
  
  const initializeMap = () => {
    if (typeof window !== 'undefined' && window.L) {
      const mapDiv = document.getElementById('map');
      if (!mapDiv) return;
      
      // Default to Ilam, Iran coordinates
      const map = window.L.map('map').setView([33.6380, 46.4153], 13);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);
      
      // Add miners to map
      detections.forEach(miner => {
        const markerColor = miner.confidence > 80 
          ? 'text-mining-danger' 
          : 'text-mining-highlight';
        
        const markerIcon = window.L.divIcon({
          className: `map-marker ${markerColor}`,
          html: `<div class="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" 
                       class="w-8 h-8 ${markerColor}">
                    <path fill-rule="evenodd" clip-rule="evenodd" 
                          d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742z" />
                  </svg>
                  <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs font-bold">
                    ${miner.confidence}
                  </div>
                 </div>`,
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        });
        
        const marker = window.L.marker([miner.location.lat, miner.location.lng], { icon: markerIcon })
          .addTo(map)
          .on('click', () => {
            setSelectedMiner(miner);
          });
      });
      
      // Add a pulsing circle to simulate active scan
      const pulseCircle = window.L.circle([33.6380, 46.4153], {
        color: '#03dac6',
        fillColor: '#03dac6',
        fillOpacity: 0.1,
        weight: 1,
        radius: 500
      }).addTo(map);
      
      let growing = true;
      let radius = 500;
      
      const pulseAnimation = setInterval(() => {
        if (growing) {
          radius += 100;
          if (radius >= 1500) growing = false;
        } else {
          radius -= 100;
          if (radius <= 500) growing = true;
        }
        
        pulseCircle.setRadius(radius);
      }, 100);
      
      return () => {
        clearInterval(pulseAnimation);
        map.remove();
      };
    }
  };
  
  const handleStartScan = () => {
    setIsScanning(true);
    toast({
      title: "اسکن منطقه",
      description: "در حال جستجوی دستگاه‌های ماینر...",
      duration: 2000,
    });
    
    // Simulate scanning
    setTimeout(() => {
      refreshData().then(() => {
        setIsScanning(false);
        toast({
          title: "اسکن کامل شد",
          description: `${detections.length} دستگاه مشکوک شناسایی شد.`,
          variant: "default",
        });
      });
    }, 3000);
  };

  return (
    <div className="relative flex flex-col h-full">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card className="bg-mining/80 border-mining-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-mining-accent">محدوده اسکن فعلی</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">ایلام - مرکز شهر</div>
          </CardContent>
        </Card>
        
        <Card className="bg-mining/80 border-mining-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-mining-accent">دستگاه‌های مشکوک</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mining-highlight">{detections.length}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-mining/80 border-mining-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-mining-accent">متوسط اطمینان تشخیص</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-mining-accent">٪{stats?.averageConfidence || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-mining/80 border-mining-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-mining-accent">آخرین اسکن</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{stats?.lastScanDate || 'بدون داده'}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card className="h-full bg-mining/80 border-mining-border overflow-hidden">
            <CardHeader className="pb-2 border-b border-mining-border">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md text-mining-foreground">نقشه منطقه</CardTitle>
                <Badge variant="outline" className="bg-mining-accent/10 text-mining-accent border-mining-accent/30">
                  نوع نقشه: OpenStreetMap
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative h-[calc(100%-48px)]">
              <div id="map" className="h-full w-full z-10"></div>
              <div className="scan-line"></div>
              <div className="noise-pattern"></div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full bg-mining/80 border-mining-border">
            <CardHeader className="pb-2 border-b border-mining-border">
              <CardTitle className="text-md text-mining-foreground">جزئیات دستگاه</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {selectedMiner ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-mining-accent/10 p-3 rounded-md">
                      <div className="text-xs text-mining-muted mb-1">شناسه دستگاه</div>
                      <div className="font-bold">{selectedMiner.id}</div>
                    </div>
                    <div className="bg-mining-accent/10 p-3 rounded-md">
                      <div className="text-xs text-mining-muted mb-1">درصد اطمینان</div>
                      <div className="font-bold text-mining-highlight">٪{selectedMiner.confidence}</div>
                    </div>
                    <div className="bg-mining-accent/10 p-3 rounded-md">
                      <div className="text-xs text-mining-muted mb-1">نوع دستگاه</div>
                      <div className="font-bold">{selectedMiner.type}</div>
                    </div>
                    <div className="bg-mining-accent/10 p-3 rounded-md">
                      <div className="text-xs text-mining-muted mb-1">روش تشخیص</div>
                      <div className="font-bold">{selectedMiner.detectionMethod}</div>
                    </div>
                  </div>
                  
                  <div className="bg-mining-accent/10 p-3 rounded-md">
                    <div className="text-xs text-mining-muted mb-1">موقعیت جغرافیایی</div>
                    <div className="font-mono text-sm tracking-wider">
                      {selectedMiner.location.lat}, {selectedMiner.location.lng}
                    </div>
                    <div className="mt-1 text-sm">{selectedMiner.location.address}</div>
                  </div>
                  
                  <div className="bg-mining-accent/10 p-3 rounded-md">
                    <div className="text-xs text-mining-muted mb-1">زمان تشخیص</div>
                    <div className="font-bold">{selectedMiner.timestamp}</div>
                  </div>
                  
                  {selectedMiner.deviceInfo && (
                    <div className="bg-mining-accent/10 p-3 rounded-md">
                      <div className="text-xs text-mining-muted mb-1">اطلاعات تکمیلی</div>
                      <div className="font-medium">{selectedMiner.deviceInfo}</div>
                    </div>
                  )}
                  
                  <div className="flex space-x-2 space-x-reverse">
                    <Button 
                      className="flex-1 bg-mining-accent hover:bg-mining-accent/80 text-black font-medium"
                      onClick={() => {
                        toast({
                          title: "گزارش تشخیص",
                          description: "گزارش کامل دستگاه در حال آماده‌سازی است",
                        });
                      }}
                    >
                      نمایش گزارش
                    </Button>
                    <Button 
                      className="flex-1 bg-mining-danger/80 hover:bg-mining-danger text-white font-medium"
                      onClick={() => {
                        toast({
                          title: "اعلام به مرکز",
                          description: "اطلاعات با موفقیت به مرکز نظارت ارسال شد",
                          variant: "default",
                        });
                      }}
                    >
                      اعلام به مرکز
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-mining-muted py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                    className="w-12 h-12 opacity-30">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <p>یک دستگاه را از روی نقشه انتخاب کنید</p>
                  <Button 
                    className="bg-mining-accent/20 hover:bg-mining-accent/30 text-mining-accent font-medium py-2 px-4 rounded-md transition-colors"
                    onClick={handleStartScan}
                    disabled={isScanning || isLoading}
                  >
                    {isScanning ? "در حال اسکن..." : "اسکن منطقه"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MinerMap;
