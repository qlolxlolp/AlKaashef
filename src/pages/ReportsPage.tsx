
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { Spinner } from '@/components/Spinner';

const ReportsPage = () => {
  const { detections, isLoading } = useData();
  const [selectedMiner, setSelectedMiner] = useState(null);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-mining">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar activeTab="reports" onTabChange={() => {}} />
          <main className="flex-1 p-6 overflow-auto">
            <div className="h-full flex flex-col items-center justify-center">
              <Spinner size="lg" />
              <p className="mt-4 text-mining-muted">در حال بارگذاری گزارشات...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }
  
  // دریافت رنگ مناسب برای نمایش میزان اطمینان
  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'text-mining-danger';
    if (confidence >= 60) return 'text-mining-highlight';
    return 'text-mining-accent';
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-mining">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab="reports" onTabChange={() => {}} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-mining-foreground mb-2">گزارشات تشخیص</h1>
            <p className="text-mining-muted">مشاهده گزارش دستگاه‌های مشکوک شناسایی شده</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="bg-mining/80 border-mining-border">
                <CardHeader className="pb-2 border-b border-mining-border">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-md text-mining-foreground">دستگاه‌های شناسایی شده</CardTitle>
                    <Badge variant="outline" className="bg-mining-accent/10 text-mining-accent border-mining-accent/30">
                      مجموع: {detections.length} دستگاه
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-auto max-h-[70vh]">
                    <Table>
                      <TableHeader className="bg-mining-accent/5 sticky top-0">
                        <TableRow>
                          <TableHead className="text-mining-accent w-16">شناسه</TableHead>
                          <TableHead className="text-mining-accent">زمان تشخیص</TableHead>
                          <TableHead className="text-mining-accent">موقعیت</TableHead>
                          <TableHead className="text-mining-accent">نوع دستگاه</TableHead>
                          <TableHead className="text-mining-accent">اطمینان</TableHead>
                          <TableHead className="text-mining-accent">روش تشخیص</TableHead>
                          <TableHead className="text-mining-accent"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {detections.map((miner) => (
                          <TableRow 
                            key={miner.id} 
                            className={`hover:bg-mining-accent/10 cursor-pointer ${selectedMiner && selectedMiner.id === miner.id ? 'bg-mining-accent/10' : ''}`}
                            onClick={() => setSelectedMiner(miner)}
                          >
                            <TableCell className="font-mono">{miner.id}</TableCell>
                            <TableCell>{miner.timestamp}</TableCell>
                            <TableCell className="max-w-[150px] truncate">{miner.location.address}</TableCell>
                            <TableCell>{miner.type}</TableCell>
                            <TableCell>
                              <span className={`font-bold ${getConfidenceColor(miner.confidence)}`}>
                                ٪{miner.confidence}
                              </span>
                            </TableCell>
                            <TableCell>{miner.detectionMethod}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-mining-accent/30 text-mining-accent hover:bg-mining-accent/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMiner(miner);
                                }}
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
            </div>
            
            <div>
              <Card className="bg-mining/80 border-mining-border h-full">
                <CardHeader className="pb-2 border-b border-mining-border">
                  <CardTitle className="text-md text-mining-foreground">جزئیات گزارش</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {selectedMiner ? (
                    <div className="space-y-4">
                      <div className={`py-3 px-4 rounded-md text-center ${selectedMiner.confidence > 80 ? 'bg-mining-danger/20 border border-mining-danger/30' : 'bg-mining-accent/20 border border-mining-accent/30'}`}>
                        <h3 className={`text-lg font-bold ${selectedMiner.confidence > 80 ? 'text-mining-danger' : 'text-mining-accent'}`}>
                          {selectedMiner.type} - اطمینان {selectedMiner.confidence}٪
                        </h3>
                        <p className="text-sm text-mining-muted">
                          شناسایی شده با روش {selectedMiner.detectionMethod}
                        </p>
                      </div>
                      
                      <div className="bg-mining-accent/10 p-3 rounded-md">
                        <div className="text-xs text-mining-muted mb-1">زمان شناسایی</div>
                        <div className="font-bold">{selectedMiner.timestamp}</div>
                      </div>
                      
                      <div className="bg-mining-accent/10 p-3 rounded-md">
                        <div className="text-xs text-mining-muted mb-1">آدرس محل</div>
                        <div className="font-bold">{selectedMiner.location.address}</div>
                      </div>
                      
                      <div className="bg-mining-accent/10 p-3 rounded-md">
                        <div className="text-xs text-mining-muted mb-1">موقعیت جغرافیایی</div>
                        <div className="font-mono text-sm">
                          {selectedMiner.location.lat}, {selectedMiner.location.lng}
                        </div>
                      </div>
                      
                      {selectedMiner.deviceInfo && (
                        <div className="bg-mining-accent/10 p-3 rounded-md">
                          <div className="text-xs text-mining-muted mb-1">اطلاعات دستگاه</div>
                          <div className="font-bold">{selectedMiner.deviceInfo}</div>
                        </div>
                      )}
                      
                      <div className="flex space-x-2 space-x-reverse">
                        <Button 
                          className="flex-1 bg-mining-accent hover:bg-mining-accent/80 text-black font-medium"
                          onClick={() => {
                            window.open(`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(selectedMiner, null, 2))}`, '_blank');
                          }}
                        >
                          دانلود گزارش
                        </Button>
                        <Button 
                          className="flex-1 bg-mining-danger/80 hover:bg-mining-danger text-white font-medium"
                        >
                          ارسال به مرکز
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-mining-muted py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                        className="w-12 h-12 opacity-30">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p>یک گزارش را از فهرست انتخاب کنید</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsPage;
