
import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useData } from '@/context/DataContext';

const Header = () => {
  const { toast } = useToast();
  const { stats, refreshData, isLoading } = useData();
  
  const handleNotification = () => {
    toast({
      title: "وضعیت دستگاه",
      description: "سیستم فعال و در حال اسکن منطقه است",
      duration: 3000,
    });
  };

  return (
    <header className="relative z-10 bg-mining/95 border-b border-mining-accent/30 shadow-lg px-4 py-2">
      <div className="container flex items-center justify-between">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="relative h-10 w-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-mining-accent/20 animate-pulse-slow"></div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
              className="h-6 w-6 text-mining-accent">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold text-mining-foreground">شکارچی برق</h1>
            <p className="text-xs text-mining-muted">سامانه هوشمند شناسایی ماینرهای شهری</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="hidden md:flex items-center">
            {stats && (
              <div className="mr-4 px-3 py-1 rounded-full bg-mining-accent/20 border border-mining-accent/30 text-xs">
                <span className="inline-block h-2 w-2 rounded-full bg-green-400 mr-1 animate-pulse"></span>
                سیستم فعال | آخرین اسکن: {stats.lastScanDate}
              </div>
            )}
          </div>
          
          <Button 
            variant="outline"
            className="border-mining-accent/30 text-mining-accent hover:bg-mining-accent/10"
            onClick={() => refreshData()}
            disabled={isLoading}
          >
            {isLoading ? "در حال بروزرسانی..." : "بروزرسانی داده‌ها"}
          </Button>
          
          <Button 
            className="bg-mining-accent hover:bg-mining-accent/80 text-black font-medium"
            onClick={handleNotification}
          >
            وضعیت سیستم
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
