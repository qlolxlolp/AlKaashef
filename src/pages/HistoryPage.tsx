
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { Spinner } from '@/components/Spinner';

const HistoryPage = () => {
  const { scanHistory, isLoading } = useData();
  
  // نمایش وضعیت اسکن
  const getScanStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <Badge className="bg-green-600/20 text-green-500 border-green-500/30">کامل شده</Badge>;
      case 'failed':
        return <Badge className="bg-red-600/20 text-red-500 border-red-500/30">ناموفق</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-600/20 text-yellow-500 border-yellow-500/30">ناقص</Badge>;
      default:
        return <Badge>نامشخص</Badge>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-mining">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar activeTab="history" onTabChange={() => {}} />
          <main className="flex-1 p-6 overflow-auto">
            <div className="h-full flex flex-col items-center justify-center">
              <Spinner size="lg" />
              <p className="mt-4 text-mining-muted">در حال بارگذاری تاریخچه اسکن‌ها...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-mining">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab="history" onTabChange={() => {}} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-mining-foreground mb-2">تاریخچه اسکن‌ها</h1>
            <p className="text-mining-muted">مرور اطلاعات اسکن‌های انجام شده در گذشته</p>
          </div>
          
          <Card className="bg-mining/80 border-mining-border">
            <CardHeader className="pb-2 border-b border-mining-border">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md text-mining-foreground">فهرست اسکن‌های انجام شده</CardTitle>
                <Badge variant="outline" className="bg-mining-accent/10 text-mining-accent border-mining-accent/30">
                  مجموع: {scanHistory.length} اسکن
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-auto">
                <Table>
                  <TableHeader className="bg-mining-accent/5 sticky top-0">
                    <TableRow>
                      <TableHead className="text-mining-accent w-16">شناسه</TableHead>
                      <TableHead className="text-mining-accent">تاریخ</TableHead>
                      <TableHead className="text-mining-accent">موقعیت</TableHead>
                      <TableHead className="text-mining-accent">مدت (دقیقه)</TableHead>
                      <TableHead className="text-mining-accent">تشخیص</TableHead>
                      <TableHead className="text-mining-accent">اپراتور</TableHead>
                      <TableHead className="text-mining-accent">وضعیت</TableHead>
                      <TableHead className="text-mining-accent"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scanHistory.map((scan) => (
                      <TableRow key={scan.id} className="hover:bg-mining-accent/10">
                        <TableCell className="font-mono">{scan.id}</TableCell>
                        <TableCell>{scan.date}</TableCell>
                        <TableCell>{scan.location}</TableCell>
                        <TableCell>{scan.duration}</TableCell>
                        <TableCell>
                          <Badge className={scan.detectedMiners > 0 
                            ? "bg-mining-danger/20 text-mining-danger border-mining-danger/30" 
                            : "bg-mining-accent/20 text-mining-accent border-mining-accent/30"
                          }>
                            {scan.detectedMiners} دستگاه
                          </Badge>
                        </TableCell>
                        <TableCell>{scan.operator}</TableCell>
                        <TableCell>{getScanStatusBadge(scan.status)}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-mining-accent/30 text-mining-accent hover:bg-mining-accent/10"
                          >
                            جزئیات
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default HistoryPage;
