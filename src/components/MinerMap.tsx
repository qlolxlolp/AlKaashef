
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useData } from '@/context/DataContext';
import { Button } from '@/components/ui/button';

  const { detections, stats, refreshData, isLoading } = useData();
  const [selectedMiner, setSelectedMiner] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanRadius, setScanRadius] = useState(500);
  const [mapInstance, setMapInstance] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [heatmapLayer, setHeatmapLayer] = useState(null);
  const [scanCircle, setScanCircle] = useState(null);
  const [scanId, setScanId] = useState(null);
  const [scanStatus, setScanStatus] = useState(null);

  useEffect(() => {
    // دریافت موقعیت کاربر
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
          toast({
            title: "خطا در دریافت موقعیت",
            description: "امکان دسترسی به موقعیت جغرافیایی وجود ندارد",
            variant: "destructive",
          });
        }
      );
    }

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

    // Load heatmap plugin
    const heatmapScript = document.createElement('script');
    heatmapScript.src = 'https://unpkg.com/leaflet.heat/dist/leaflet-heat.js';
    document.head.appendChild(heatmapScript);

    script.onload = () => {
      if (heatmapScript.loaded) {
        initializeMap();
      } else {
        heatmapScript.onload = initializeMap;
      }
    };

    heatmapScript.loaded = false;
    heatmapScript.onload = () => {
      heatmapScript.loaded = true;
      if (script.loaded) {
        initializeMap();
      }
    };

    script.loaded = false;
    script.onload = () => {
      script.loaded = true;
      if (heatmapScript.loaded) {
        initializeMap();
      }
    };

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(link);
      document.head.removeChild(heatmapScript);
    };
  }, []);

  // به‌روزرسانی نقشه هنگام تغییر داده‌ها
  useEffect(() => {
    if (mapInstance && detections.length > 0) {
      updateMapMarkers();
      updateHeatmap();
    }
  }, [mapInstance, detections]);

  // پیگیری وضعیت اسکن در حال انجام
  useEffect(() => {
    let intervalId = null;

    if (isScanning && scanId) {
      intervalId = setInterval(async () => {
        try {
          const status = await getScanStatus(scanId);
          setScanStatus(status);

          if (status.status === 'completed' || status.status === 'failed') {
            setIsScanning(false);
            clearInterval(intervalId);

            if (status.status === 'completed') {
              await refreshData();
              toast({
                title: "اسکن کامل شد",
                description: `${status.detections.length} دستگاه مشکوک شناسایی شد.`,
                variant: "default",
              });
            } else {
              toast({
                title: "خطا در اسکن",
                description: status.errors?.[0] || "مشکلی در انجام اسکن رخ داد",
                variant: "destructive",
              });
            }
          }

          // به‌روزرسانی دایره اسکن
          if (scanCircle && status.progress) {
            const progress = status.progress / 100;
            scanCircle.setRadius(scanRadius * progress);
          }

        } catch (error) {
          console.error('Error checking scan status:', error);
        }
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isScanning, scanId]);

  const initializeMap = () => {
    if (typeof window !== 'undefined' && window.L) {
      const mapDiv = document.getElementById('map');
      if (!mapDiv) return;

      // استفاده از موقعیت کاربر یا موقعیت پیش‌فرض
      const center = userLocation || DEFAULT_MAP_CENTER;

      const map = window.L.map('map').setView([center.lat, center.lng], DEFAULT_MAP_ZOOM);
      setMapInstance(map);

      // افزودن لایه‌های مختلف نقشه
      const baseMaps = {
        "OpenStreetMap": window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '© OpenStreetMap'
        }).addTo(map),
        "ماهواره‌ای": window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }),
        "نقشه تاریک": window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        })
      };

      // افزودن کنترل لایه‌ها
      window.L.control.layers(baseMaps).addTo(map);

      // افزودن مقیاس
      window.L.control.scale({ imperial: false }).addTo(map);

      // افزودن نشانگر موقعیت کاربر
      if (userLocation) {
        window.L.circleMarker([userLocation.lat, userLocation.lng], {
          color: '#03dac6',
          fillColor: '#03dac6',
          fillOpacity: 0.5,
          radius: 8
        }).addTo(map).bindTooltip('موقعیت شما');
      }

      // افزودن ماینرها به نقشه
      updateMapMarkers();

      // ایجاد لایه هیت‌مپ
      if (window.L.heatLayer) {
        const heatData = detections.map(miner => [
          miner.location.lat,
          miner.location.lng,
          miner.confidence / 100
        ]);

        const heat = window.L.heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'}
        });

        setHeatmapLayer(heat);
      }

      // افزودن دایره اسکن
      if (userLocation) {
        const circle = window.L.circle([userLocation.lat, userLocation.lng], {
          color: '#03dac6',
          fillColor: '#03dac6',
          fillOpacity: 0.1,
          weight: 1,
          radius: 0
        }).addTo(map);

        setScanCircle(circle);
      }

      // رویداد کلیک روی نقشه
      map.on('click', (e) => {
        // اگر در حال اسکن نیستیم، موقعیت دایره اسکن را تغییر دهیم
        if (!isScanning && scanCircle) {
          scanCircle.setLatLng(e.latlng);
          scanCircle.setRadius(scanRadius);
        }
      });
    }
  };

  // به‌روزرسانی نشانگرهای ماینر روی نقشه
  const updateMapMarkers = () => {
    if (!mapInstance) return;

    // پاک کردن نشانگرهای قبلی
    mapInstance.eachLayer(layer => {
      if (layer instanceof window.L.Marker) {
        mapInstance.removeLayer(layer);
      }
    });

    // افزودن نشانگرهای جدید
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
        .addTo(mapInstance)
        .on('click', () => {
          setSelectedMiner(miner);
        });

      // افزودن پاپ‌آپ اطلاعات اولیه
      marker.bindTooltip(`
        <div class="text-sm">
          <div class="font-bold">${miner.type} ماینر</div>
          <div>اطمینان: ${miner.confidence}%</div>
          <div>روش: ${miner.detectionMethod}</div>
        </div>
      `);
    });

    // افزودن نشانگر موقعیت کاربر
    if (userLocation) {
      window.L.circleMarker([userLocation.lat, userLocation.lng], {
        color: '#03dac6',
        fillColor: '#03dac6',
        fillOpacity: 0.5,
        radius: 8
      }).addTo(mapInstance).bindTooltip('موقعیت شما');
    }
  };

  // به‌روزرسانی لایه هیت‌مپ
  const updateHeatmap = () => {
    if (!mapInstance || !window.L.heatLayer) return;

    // حذف لایه قبلی
    if (heatmapLayer) {
      mapInstance.removeLayer(heatmapLayer);
    }

    // ایجاد لایه جدید
    const heatData = detections.map(miner => [
      miner.location.lat,
      miner.location.lng,
      miner.confidence / 100
    ]);

    const heat = window.L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'}
    });

    setHeatmapLayer(heat);
  };

  // شروع اسکن منطقه
  const handleStartScan = async () => {
    if (!scanCircle) {
      toast({
        title: "خطا در اسکن",
        description: "لطفاً ابتدا یک نقطه روی نقشه انتخاب کنید",
        variant: "destructive",
      });
      return;
    }

    const scanLocation = scanCircle.getLatLng();

    setIsScanning(true);
    setScanStatus(null);

    toast({
      title: "اسکن منطقه",
      description: "در حال آماده‌سازی اسکن منطقه...",
      duration: 2000,
    });

    try {
      // شروع اسکن جدید
      const result = await startNewScan({
        location: {
          lat: scanLocation.lat,
          lng: scanLocation.lng
        },
        radius: scanRadius,
        methods: ['acoustic', 'network', 'emi'],
        operator: 'کاربر فعلی'
      });

      setScanId(result.scanId);

      // تنظیم دایره اسکن
      scanCircle.setRadius(0);

    } catch (error) {
      console.error('Error starting scan:', error);
      setIsScanning(false);
      toast({
        title: "خطا در شروع اسکن",
        description: "مشکلی در شروع اسکن منطقه رخ داد",
        variant: "destructive",
      });
    }
  };

  // تغییر شعاع اسکن
  const handleRadiusChange = (value) => {
    setScanRadius(value);
    if (scanCircle && !isScanning) {
      scanCircle.setRadius(value);
    }
  };


  return (
    <div className="relative flex flex-col h-full">
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
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card className="h-full bg-mining/80 border-mining-border overflow-hidden">
            <CardHeader className="pb-2 border-b border-mining-border">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md text-mining-foreground">نقشه منطقه</CardTitle>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Badge variant="outline" className="bg-mining-accent/10 text-mining-accent border-mining-accent/30">
                    {isScanning ? `در حال اسکن: ${scanStatus?.progress || 0}%` : 'آماده اسکن'}
                  </Badge>

                  <div className="flex items-center space-x-1 space-x-reverse">
                    <span className="text-xs text-mining-muted">شعاع:</span>
                    <select
                      className="bg-mining border-mining-border text-xs rounded p-1"
                      value={scanRadius}
                      onChange={(e) => handleRadiusChange(Number(e.target.value))}
                      disabled={isScanning}
                    >
                      <option value="100">100 متر</option>
                      <option value="250">250 متر</option>
                      <option value="500">500 متر</option>
                      <option value="1000">1 کیلومتر</option>
                      <option value="2000">2 کیلومتر</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative h-[calc(100%-48px)]">
              <div id="map" className="h-full w-full z-10"></div>
              <div className="scan-line"></div>
              <div className="noise-pattern"></div>

              {isScanning && scanStatus && (
                <div className="absolute bottom-4 left-4 right-4 bg-mining/90 border border-mining-border rounded-md p-2 z-20">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">وضعیت اسکن</span>
                    <span className="text-xs text-mining-accent">{scanStatus.progress}% تکمیل شده</span>
                  </div>
                  <div className="h-1.5 w-full bg-mining-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-mining-accent transition-all duration-300 ease-out"
                      style={{ width: `${scanStatus.progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-mining-muted">
                    {scanStatus.currentMethod && `روش فعلی: ${scanStatus.currentMethod}`}
                    {scanStatus.estimatedTimeRemaining && ` - زمان باقیمانده: ${Math.ceil(scanStatus.estimatedTimeRemaining / 60)} دقیقه`}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full bg-mining/80 border-mining-border">
            <CardHeader className="pb-2 border-b border-mining-border">
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
                      onClick={async () => {
                        try {
                          // دریافت اطلاعات تکمیلی ماینر
                          const details = await getMinerDetails(selectedMiner.id);

                          toast({
                            title: "گزارش تشخیص",
                            description: "گزارش کامل دستگاه در حال آماده‌سازی است",
                          });

                          // در اینجا می‌توان اطلاعات تکمیلی را نمایش داد یا به صفحه گزارش منتقل شد
                        } catch (error) {
                          console.error('Error fetching miner details:', error);
                          toast({
                            title: "خطا در دریافت اطلاعات",
                            description: "مشکلی در دریافت جزئیات دستگاه رخ داد",
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      نمایش گزارش
                    </Button>
                    <Button
                      className="flex-1 bg-mining-danger/80 hover:bg-mining-danger text-white font-medium"
                      onClick={() => {
                        toast({
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