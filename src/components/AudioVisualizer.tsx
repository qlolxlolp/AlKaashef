import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  audioData: Float32Array;
  height: number;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioData, height }) => {
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
    
    // تنظیم استایل
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#03dac6';
    
    // رسم موج صوتی
    const sliceWidth = canvas.width / audioData.length;
    let x = 0;
    
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    
    for (let i = 0; i < audioData.length; i++) {
      const y = (audioData[i] * canvas.height / 2) + (canvas.height / 2);
      ctx.lineTo(x, y);
      x += sliceWidth;
    }
    
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
    
    // اضافه کردن افکت درخشش
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#03dac6';
    ctx.stroke();
    
  }, [audioData, height]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full"
    />
  );
};