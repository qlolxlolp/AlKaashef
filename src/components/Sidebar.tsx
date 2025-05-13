
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

type SidebarItemProps = {
  label: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
};

const SidebarItem = ({ label, icon, isActive, onClick }: SidebarItemProps) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center space-x-2 space-x-reverse px-3 py-2 rounded-lg w-full text-right transition-all",
      isActive 
        ? "bg-mining-accent/20 text-mining-accent border-r-4 border-mining-accent" 
        : "text-mining-muted hover:bg-mining-accent/10 hover:text-mining-foreground"
    )}
  >
    <div className="ml-3">{icon}</div>
    <span className="text-sm">{label}</span>
  </button>
);

type SidebarProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const { stats } = useData();

  const handleScanClick = () => {
    toast({
      title: "شروع اسکن جدید",
      description: "لطفاً مختصات و پارامترهای اسکن را تعیین کنید",
    });
  };

  return (
    <aside className="w-60 border-l border-mining-border bg-mining/90 h-[calc(100vh-64px)] flex flex-col">
      <div className="p-4">
        <div className="cyber-border p-3 bg-mining-accent/5 rounded-md">
          <h3 className="text-sm font-bold text-mining-accent mb-1">آمار شناسایی</h3>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 bg-mining-accent/10 rounded">
              <div className="font-bold text-mining-foreground text-lg">{stats?.totalScans || 0}</div>
              <div className="text-mining-muted">اسکن تاکنون</div>
            </div>
            <div className="p-2 bg-mining-highlight/10 rounded">
              <div className="font-bold text-mining-highlight text-lg">{stats?.totalDetections || 0}</div>
              <div className="text-mining-muted">دستگاه مشکوک</div>
            </div>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-2 space-y-1">
        <SidebarItem 
          label="نقشه و موقعیت‌یابی" 
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>}
          isActive={activeTab === 'map'}
          onClick={() => onTabChange('map')}
        />
        <SidebarItem 
          label="تحلیل نویز صوتی" 
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>}
          isActive={activeTab === 'acoustic'}
          onClick={() => onTabChange('acoustic')}
        />
        <SidebarItem 
          label="اسکن شبکه" 
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>}
          isActive={activeTab === 'network'}
          onClick={() => onTabChange('network')}
        />
        <SidebarItem 
          label="سیگنال‌های EMI" 
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>}
          isActive={activeTab === 'emi'}
          onClick={() => onTabChange('emi')}
        />
        <SidebarItem 
          label="آرشیو گزارشات" 
          icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>}
          isActive={activeTab === 'reports'}
          onClick={() => onTabChange('reports')}
        />
        
        <div className="pt-4 mt-4 border-t border-mining-border">
          <Link to="/dashboard">
            <SidebarItem 
              label="داشبورد آماری" 
              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>}
            />
          </Link>
          
          <Link to="/history">
            <SidebarItem 
              label="تاریخچه اسکن‌ها" 
              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
            />
          </Link>
          
          <Link to="/settings">
            <SidebarItem 
              label="تنظیمات سیستم" 
              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>}
            />
          </Link>
        </div>
      </nav>
      
      <div className="p-4">
        <Button 
          className="w-full bg-mining-highlight hover:bg-mining-highlight/80 text-black font-medium"
          onClick={handleScanClick}
        >
          شروع اسکن جدید
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
