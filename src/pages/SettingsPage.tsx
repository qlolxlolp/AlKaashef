
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { toast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const [serverSettings, setServerSettings] = useState({
    apiEndpoint: 'https://api.example.com/v1',
    authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    refreshInterval: '30',
    enableSSL: true,
    debugMode: false
  });
  
  const [scanSettings, setScanSettings] = useState({
    defaultLocation: 'ایلام، مرکز شهر',
    scanRadius: '1000',
    minConfidence: '70',
    enableAcoustic: true,
    enableNetwork: true,
    enableEMI: true,
    autosaveReports: true,
    notifyOnDetection: true
  });
  
  const [userSettings, setUserSettings] = useState({
    operatorName: 'محمد امیری',
    operatorId: 'OP-12345',
    department: 'واحد مرکزی شناسایی',
    notificationEmail: 'operator@example.com',
    darkMode: true,
    language: 'fa',
    autoRefresh: true
  });
  
  const handleServerSettingsChange = (field, value) => {
    setServerSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleScanSettingsChange = (field, value) => {
    setScanSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleUserSettingsChange = (field, value) => {
    setUserSettings(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveSettings = () => {
    toast({
      title: "ذخیره تنظیمات",
      description: "تنظیمات با موفقیت ذخیره شد",
      duration: 3000,
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-mining">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab="settings" onTabChange={() => {}} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-mining-foreground mb-2">تنظیمات سیستم</h1>
            <p className="text-mining-muted">مدیریت پیکربندی سامانه شناسایی ماینر</p>
          </div>
          
          <Tabs defaultValue="scan" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="scan">تنظیمات اسکن</TabsTrigger>
              <TabsTrigger value="server">تنظیمات سرور</TabsTrigger>
              <TabsTrigger value="user">تنظیمات کاربری</TabsTrigger>
            </TabsList>
            
            <TabsContent value="scan">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-mining/80 border-mining-border">
                  <CardHeader>
                    <CardTitle className="text-mining-foreground">تنظیمات پایه اسکن</CardTitle>
                    <CardDescription>تنظیمات اصلی برای انجام عملیات اسکن</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultLocation">مکان پیش‌فرض اسکن</Label>
                      <Input 
                        id="defaultLocation"
                        value={scanSettings.defaultLocation}
                        onChange={(e) => handleScanSettingsChange('defaultLocation', e.target.value)}
                        className="bg-mining text-mining-foreground border-mining-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="scanRadius">شعاع اسکن (متر)</Label>
                      <Input 
                        id="scanRadius"
                        type="number"
                        value={scanSettings.scanRadius}
                        onChange={(e) => handleScanSettingsChange('scanRadius', e.target.value)}
                        className="bg-mining text-mining-foreground border-mining-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="minConfidence">حداقل درصد اطمینان</Label>
                      <Input 
                        id="minConfidence"
                        type="number"
                        value={scanSettings.minConfidence}
                        onChange={(e) => handleScanSettingsChange('minConfidence', e.target.value)}
                        className="bg-mining text-mining-foreground border-mining-border"
                      />
                      <p className="text-xs text-mining-muted">مقادیر کمتر از این مقدار نادیده گرفته می‌شوند</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-mining/80 border-mining-border">
                  <CardHeader>
                    <CardTitle className="text-mining-foreground">روش‌های تشخیص</CardTitle>
                    <CardDescription>فعال یا غیرفعال کردن روش‌های تشخیص</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableAcoustic">تشخیص صوتی</Label>
                        <p className="text-xs text-mining-muted">آنالیز نویز صوتی فن‌ها</p>
                      </div>
                      <Switch 
                        id="enableAcoustic"
                        checked={scanSettings.enableAcoustic}
                        onCheckedChange={(value) => handleScanSettingsChange('enableAcoustic', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableNetwork">تشخیص شبکه</Label>
                        <p className="text-xs text-mining-muted">بررسی ترافیک و پورت‌های شبکه</p>
                      </div>
                      <Switch 
                        id="enableNetwork"
                        checked={scanSettings.enableNetwork}
                        onCheckedChange={(value) => handleScanSettingsChange('enableNetwork', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="enableEMI">تشخیص EMI</Label>
                        <p className="text-xs text-mining-muted">بررسی سیگنال‌های الکترومغناطیسی</p>
                      </div>
                      <Switch 
                        id="enableEMI"
                        checked={scanSettings.enableEMI}
                        onCheckedChange={(value) => handleScanSettingsChange('enableEMI', value)}
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-mining-border">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="autosaveReports">ذخیره خودکار گزارشات</Label>
                          <p className="text-xs text-mining-muted">ذخیره گزارشات اسکن به‌صورت خودکار</p>
                        </div>
                        <Switch 
                          id="autosaveReports"
                          checked={scanSettings.autosaveReports}
                          onCheckedChange={(value) => handleScanSettingsChange('autosaveReports', value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifyOnDetection">اعلان تشخیص</Label>
                        <p className="text-xs text-mining-muted">اعلان در هنگام تشخیص ماینر جدید</p>
                      </div>
                      <Switch 
                        id="notifyOnDetection"
                        checked={scanSettings.notifyOnDetection}
                        onCheckedChange={(value) => handleScanSettingsChange('notifyOnDetection', value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="server">
              <Card className="bg-mining/80 border-mining-border">
                <CardHeader>
                  <CardTitle className="text-mining-foreground">تنظیمات اتصال به سرور</CardTitle>
                  <CardDescription>پیکربندی اتصال به API سرور مرکزی</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="apiEndpoint">آدرس API سرور</Label>
                    <Input 
                      id="apiEndpoint"
                      value={serverSettings.apiEndpoint}
                      onChange={(e) => handleServerSettingsChange('apiEndpoint', e.target.value)}
                      className="bg-mining text-mining-foreground border-mining-border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="authToken">توکن احراز هویت</Label>
                    <Input 
                      id="authToken"
                      type="password"
                      value={serverSettings.authToken}
                      onChange={(e) => handleServerSettingsChange('authToken', e.target.value)}
                      className="bg-mining text-mining-foreground border-mining-border"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="refreshInterval">فاصله بروزرسانی (ثانیه)</Label>
                    <Input 
                      id="refreshInterval"
                      type="number"
                      value={serverSettings.refreshInterval}
                      onChange={(e) => handleServerSettingsChange('refreshInterval', e.target.value)}
                      className="bg-mining text-mining-foreground border-mining-border"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="enableSSL">فعال‌سازی SSL</Label>
                      <p className="text-xs text-mining-muted">استفاده از اتصال امن برای ارتباط با سرور</p>
                    </div>
                    <Switch 
                      id="enableSSL"
                      checked={serverSettings.enableSSL}
                      onCheckedChange={(value) => handleServerSettingsChange('enableSSL', value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="debugMode">حالت عیب‌یابی</Label>
                      <p className="text-xs text-mining-muted">ثبت جزئیات بیشتر برای عیب‌یابی</p>
                    </div>
                    <Switch 
                      id="debugMode"
                      checked={serverSettings.debugMode}
                      onCheckedChange={(value) => handleServerSettingsChange('debugMode', value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="user">
              <Card className="bg-mining/80 border-mining-border">
                <CardHeader>
                  <CardTitle className="text-mining-foreground">تنظیمات کاربر</CardTitle>
                  <CardDescription>اطلاعات اپراتور و تنظیمات رابط کاربری</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="operatorName">نام اپراتور</Label>
                      <Input 
                        id="operatorName"
                        value={userSettings.operatorName}
                        onChange={(e) => handleUserSettingsChange('operatorName', e.target.value)}
                        className="bg-mining text-mining-foreground border-mining-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="operatorId">شناسه اپراتور</Label>
                      <Input 
                        id="operatorId"
                        value={userSettings.operatorId}
                        onChange={(e) => handleUserSettingsChange('operatorId', e.target.value)}
                        className="bg-mining text-mining-foreground border-mining-border"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department">واحد سازمانی</Label>
                      <Input 
                        id="department"
                        value={userSettings.department}
                        onChange={(e) => handleUserSettingsChange('department', e.target.value)}
                        className="bg-mining text-mining-foreground border-mining-border"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="notificationEmail">ایمیل اعلان‌ها</Label>
                      <Input 
                        id="notificationEmail"
                        type="email"
                        value={userSettings.notificationEmail}
                        onChange={(e) => handleUserSettingsChange('notificationEmail', e.target.value)}
                        className="bg-mining text-mining-foreground border-mining-border"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-mining-border">
                    <h3 className="text-sm font-medium text-mining-accent mb-4">تنظیمات رابط کاربری</h3>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="darkMode">حالت تیره</Label>
                        <p className="text-xs text-mining-muted">استفاده از تم تیره برای رابط کاربری</p>
                      </div>
                      <Switch 
                        id="darkMode"
                        checked={userSettings.darkMode}
                        onCheckedChange={(value) => handleUserSettingsChange('darkMode', value)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="autoRefresh">بروزرسانی خودکار داده‌ها</Label>
                        <p className="text-xs text-mining-muted">بروزرسانی خودکار داده‌ها هر ۵ دقیقه</p>
                      </div>
                      <Switch 
                        id="autoRefresh"
                        checked={userSettings.autoRefresh}
                        onCheckedChange={(value) => handleUserSettingsChange('autoRefresh', value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-6 space-x-3 space-x-reverse">
            <Button 
              variant="outline" 
              className="border-mining-border text-mining-muted hover:bg-mining/60"
              onClick={() => window.location.reload()}
            >
              بازنشانی
            </Button>
            <Button 
              className="bg-mining-accent hover:bg-mining-accent/80 text-black font-medium"
              onClick={handleSaveSettings}
            >
              ذخیره تنظیمات
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;
