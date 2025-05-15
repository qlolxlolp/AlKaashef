import React, { useRef, useEffect } from 'react';

interface FrequencySpectrumProps {
  frequencyData: Uint8Array;
  height: number;
}

export const FrequencySpectrum: React.FC<FrequencySpectrumProps> = ({ frequencyData, height }) => {
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
    
    // تعداد ستون‌های نمایش طیف فرکانسی
    const barCount = 64;
    const barWidth = canvas.width / barCount;
    const barGap = 2;
    
    // نمایش فقط بخشی از داده‌ها برای خوانایی بهتر
    const step = Math.floor(frequencyData.length / barCount);
    
    // رسم ستون‌های طیف فرکانسی
    for (let i = 0; i < barCount; i++) {
      const index = i * step;
      const value = frequencyData[index];
      const percent = value / 255;
      const barHeight = percent * canvas.height;
      
      // رنگ‌بندی بر اساس فرکانس
      const hue = (i / barCount) * 180 + 180; // از آبی تا سبز
      ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.7)`;
      
      // رسم ستون
      ctx.fillRect(
        i * barWidth + barGap / 2, 
        canvas.height - barHeight, 
        barWidth - barGap, 
        barHeight
      );
      
      // افزودن افکت درخشش برای فرکانس‌های قوی
      if (percent > 0.5) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = `hsla(${hue}, 100%, 50%, 0.8)`;
        ctx.fillRect(
          i * barWidth + barGap / 2, 
          canvas.height - barHeight, 
          barWidth - barGap, 
          barHeight
        );
        ctx.shadowBlur = 0;
      }
    }
    
    // افزودن خط مرجع
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.75);
    ctx.lineTo(canvas.width, canvas.height * 0.75);
    ctx.stroke();
    
  }, [frequencyData, height]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
};