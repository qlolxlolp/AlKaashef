
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { useData } from '@/context/DataContext';
import { Spinner } from '@/components/Spinner';
import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell } from 'recharts';

const Dashboard = () => {
  const { stats, detections, scanHistory, isLoading } = useData();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-mining">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar activeTab="map" onTabChange={() => {}} />
          <main className="flex-1 p-6 overflow-auto">
            <div className="h-full flex flex-col items-center justify-center">
              <Spinner size="lg" />
              <p className="mt-4 text-mining-muted">در حال بارگذاری اطلاعات داشبورد...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  // تبدیل آمار به فرمت مناسب برای نمودار روش‌های تشخیص
  const detectionMethodsData = stats ? [
    { name: 'صوتی', value: stats.scansByMethod.acoustic, color: '#03dac6' },
    { name: 'شبکه', value: stats.scansByMethod.network, color: '#bb86fc' },
    { name: 'EMI', value: stats.scansByMethod.emi, color: '#ff9e00' },
    { name: 'ترکیبی', value: stats.scansByMethod.combined, color: '#cf6679' },
  ] : [];
  
  // تبدیل تاریخچه اسکن به فرمت مناسب برای نمودار
  const scanHistoryData = scanHistory.slice(0, 7).map(item => ({
    name: item.date,
    تعداد: item.detectedMiners
  })).reverse();
  
  return (
    <div className="min-h-screen flex flex-col bg-mining">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab="dashboard" onTabChange={() => {}} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-mining-foreground mb-2">داشبورد آماری</h1>
            <p className="text-mining-muted">مشاهده آمار و گزارش‌های کلی سیستم شناسایی ماینر</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="bg-mining/80 border-mining-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-mining-accent">تعداد اسکن‌ها</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalScans || 0}</div>
                <p className="text-xs text-mining-muted mt-1">تا امروز</p>
              </CardContent>
            </Card>
            
            <Card className="bg-mining/80 border-mining-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-mining-accent">دستگاه‌های شناسایی شده</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-mining-highlight">{stats?.totalDetections || 0}</div>
                <p className="text-xs text-mining-muted mt-1">مجموع</p>
              </CardContent>
            </Card>
            
            <Card className="bg-mining/80 border-mining-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-mining-accent">میانگین اطمینان</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-mining-accent">٪{stats?.averageConfidence || 0}</div>
                <p className="text-xs text-mining-muted mt-1">در تشخیص‌ها</p>
              </CardContent>
            </Card>
            
            <Card className="bg-mining/80 border-mining-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-mining-accent">آخرین اسکن</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{stats?.lastScanDate || 'بدون داده'}</div>
                <p className="text-xs text-mining-muted mt-1">تاریخ و زمان</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="bg-mining/80 border-mining-border">
              <CardHeader className="pb-2 border-b border-mining-border">
                <CardTitle className="text-md text-mining-foreground">روش‌های تشخیص</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={detectionMethodsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {detectionMethodsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value} مورد`, 'تعداد']}
                        itemStyle={{ direction: 'rtl', textAlign: 'right' }}
                        contentStyle={{ background: '#1a2b38', border: '1px solid #334155', direction: 'rtl' }}
                      />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-mining/80 border-mining-border">
              <CardHeader className="pb-2 border-b border-mining-border">
                <CardTitle className="text-md text-mining-foreground">تشخیص‌ها در اسکن‌های اخیر</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scanHistoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fill: '#64748b' }} 
                        axisLine={{ stroke: '#334155' }} 
                      />
                      <YAxis 
                        tick={{ fill: '#64748b' }} 
                        axisLine={{ stroke: '#334155' }} 
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} دستگاه`, 'تشخیص‌ها']}
                        itemStyle={{ direction: 'rtl', textAlign: 'right' }}
                        contentStyle={{ background: '#1a2b38', border: '1px solid #334155', direction: 'rtl' }}
                      />
                      <Bar dataKey="تعداد" fill="#03dac6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="bg-mining/80 border-mining-border mb-6">
            <CardHeader className="pb-2 border-b border-mining-border">
              <CardTitle className="text-md text-mining-foreground">آمار تشخیص بر اساس نوع دستگاه</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* نوع ASIC */}
                <div className="bg-mining-accent/10 p-4 rounded-md text-center">
                  <div className="text-2xl font-bold text-mining-accent mb-2">
                    {detections.filter(d => d.type === 'ASIC').length}
                  </div>
                  <h3 className="text-mining-foreground mb-1">ASIC ماینر</h3>
                  <p className="text-xs text-mining-muted">قدرت پردازش بالا، مصرف برق زیاد</p>
                </div>
                
                {/* نوع GPU */}
                <div className="bg-mining-highlight/10 p-4 rounded-md text-center">
                  <div className="text-2xl font-bold text-mining-highlight mb-2">
                    {detections.filter(d => d.type === 'GPU').length}
                  </div>
                  <h3 className="text-mining-foreground mb-1">GPU ماینر</h3>
                  <p className="text-xs text-mining-muted">انعطاف‌پذیر، مصرف برق متوسط</p>
                </div>
                
                {/* سایر انواع */}
                <div className="bg-mining-muted/10 p-4 rounded-md text-center">
                  <div className="text-2xl font-bold text-mining-muted mb-2">
                    {detections.filter(d => d.type !== 'ASIC' && d.type !== 'GPU').length}
                  </div>
                  <h3 className="text-mining-foreground mb-1">سایر انواع</h3>
                  <p className="text-xs text-mining-muted">CPU، FPGA و سایر دستگاه‌ها</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
