import React, { useRef, useEffect } from 'react';

interface EMIVisualizerProps {
  data: number[];
  height: number;
  isScanning: boolean;
}

export const EMIVisualizer: React.FC<EMIVisualizerProps> = ({ data, height, isScanning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // تنظیم اندازه canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = height;
    
    // پاک کردن canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // اگر داده‌ای وجود ندارد، خروج
    if (!data || data.length === 0) return;
    
    // تنظیم استایل
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#03dac6';
    
    // محاسبه مقیاس
    const maxValue = Math.max(...data, 50);
    const scaleY = (canvas.height - 20) / maxValue;
    const scaleX = canvas.width / data.length;
    
    // رسم خط پایه
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.moveTo(0, canvas.height - 10);
    ctx.lineTo(canvas.width, canvas.height - 10);
    ctx.stroke();
    
    // رسم نمودار طیف فرکانسی
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 10);
    
    for (let i = 0; i < data.length; i++) {
      const x = i * scaleX;
      const y = canvas.height - 10 - (data[i] * scaleY);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.strokeStyle = '#03dac6';
    ctx.stroke();
    
    // پر کردن زیر نمودار
    ctx.lineTo(canvas.width, canvas.height - 10);
    ctx.lineTo(0, canvas.height - 10);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(3, 218, 198, 0.5)');
    gradient.addColorStop(1, 'rgba(3, 218, 198, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // افزودن افکت درخشش
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#03dac6';
    ctx.strokeStyle = '#03dac6';
    ctx.beginPath();
    
    for (let i = 0; i < data.length; i++) {
      const x = i * scaleX;
      const y = canvas.height - 10 - (data[i] * scaleY);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // اگر در حال اسکن است، افکت‌های اضافی اضافه کن
    if (isScanning) {
      // افزودن نویز و نقاط درخشان
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const radius = Math.random() * 2 + 1;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(3, 218, 198, ${Math.random() * 0.7 + 0.3})`;
        ctx.fill();
      }
      
      // افزودن خطوط اسکن
      const scanLinePos = (Date.now() % 2000) / 2000 * canvas.width;
      
      ctx.beginPath();
      ctx.moveTo(scanLinePos, 0);
      ctx.lineTo(scanLinePos, canvas.height);
      ctx.strokeStyle = 'rgba(3, 218, 198, 0.8)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // افزودن هاله اطراف خط اسکن
      const gradient2 = ctx.createRadialGradient(scanLinePos, canvas.height / 2, 0, scanLinePos, canvas.height / 2, 50);
      gradient2.addColorStop(0, 'rgba(3, 218, 198, 0.3)');
      gradient2.addColorStop(1, 'rgba(3, 218, 198, 0)');
      
      ctx.beginPath();
      ctx.fillStyle = gradient2;
      ctx.fillRect(scanLinePos - 50, 0, 100, canvas.height);
    }
    
  }, [data, height, isScanning]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
};