
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MinerMap from '@/components/MinerMap';
import AcousticAnalysis from '@/components/AcousticAnalysis';
import NetworkScan from '@/components/NetworkScan';
import EMIAnalysis from '@/components/EMIAnalysis';
import { useData } from '@/context/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/Spinner';

const Index = () => {
  const [activeTab, setActiveTab] = useState('map');
  const { isLoading, error } = useData();
  const navigate = useNavigate();
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <Spinner size="lg" />
          <p className="mt-4 text-mining-muted">در حال بارگذاری اطلاعات...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-mining-danger text-6xl mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
              className="w-16 h-16">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">خطا در بارگذاری داده‌ها</h3>
          <p className="text-mining-muted mb-6">{error.message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-mining-accent hover:bg-mining-accent/80 text-black font-medium py-2 px-4 rounded"
          >
            تلاش مجدد
          </button>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'map':
        return <MinerMap />;
      case 'acoustic':
        return <AcousticAnalysis />;
      case 'network':
        return <NetworkScan />;
      case 'emi':
        return <EMIAnalysis />;
      case 'reports':
        navigate('/reports');
        return <div className="p-4">در حال انتقال به صفحه گزارشات...</div>;
      default:
        return <MinerMap />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-mining">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="relative h-full">
            {renderContent()}
            <div className="noise-pattern"></div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
