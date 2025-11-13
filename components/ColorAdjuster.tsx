'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { applyColorAdjustments } from '@/utils/colorUtils';

interface ColorAdjusterProps {
  imageUrl: string;
  originalColorData: {
    hue: number;
    saturation: number;
    brightness: number;
  };
  onImageProcessed: (processedImageUrl: string) => void;
}

export default function ColorAdjuster({
  imageUrl,
  originalColorData,
  onImageProcessed,
}: ColorAdjusterProps) {
  const [hueShift, setHueShift] = useState(0);
  const [saturationAdjust, setSaturationAdjust] = useState(0);
  const [brightnessAdjust, setBrightnessAdjust] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // リアルタイムプレビュー用の処理
  useEffect(() => {
    if (!imageRef.current || !canvasRef.current) return;

    // デバウンス処理（300ms待機）
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsProcessing(true);
    timeoutRef.current = setTimeout(() => {
      try {
        const processedUrl = applyColorAdjustments(
          imageRef.current!,
          canvasRef.current!,
          hueShift,
          saturationAdjust,
          brightnessAdjust
        );
        onImageProcessed(processedUrl);
      } catch (error) {
        console.error('画像処理エラー:', error);
      } finally {
        setIsProcessing(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hueShift, saturationAdjust, brightnessAdjust, imageUrl]);

  // 画像の読み込み
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      // 初期画像を表示
      if (canvasRef.current) {
        const processedUrl = applyColorAdjustments(img, canvasRef.current, 0, 0, 0);
        onImageProcessed(processedUrl);
      }
    };
    img.src = imageUrl;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl]);

  const handleReset = () => {
    setHueShift(0);
    setSaturationAdjust(0);
    setBrightnessAdjust(0);
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;

    const link = document.createElement('a');
    link.href = canvasRef.current.toDataURL('image/png');
    link.download = `iro-adjusted-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>色の調整</CardTitle>
        <CardDescription>スライダーまたは数値入力で色の三要素を調整できます</CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* 色相の調整 */}
        <div className='space-y-2'>
          <Label htmlFor='hue-shift'>
            色相（Hue）のシフト: {hueShift > 0 ? '+' : ''}
            {Math.round(hueShift)}°
          </Label>
          <Input
            id='hue-shift'
            type='range'
            min='-180'
            max='180'
            value={hueShift}
            onChange={(e) => setHueShift(Number(e.target.value))}
            className='w-full'
          />
          <div className='flex justify-between text-xs text-muted-foreground'>
            <span>-180°</span>
            <span>0°</span>
            <span>+180°</span>
          </div>
        </div>

        {/* 彩度の調整 */}
        <div className='space-y-2'>
          <Label htmlFor='saturation-adjust'>
            彩度（Saturation）の調整: {saturationAdjust > 0 ? '+' : ''}
            {Math.round(saturationAdjust)}%
          </Label>
          <Input
            id='saturation-adjust'
            type='range'
            min='-100'
            max='100'
            value={saturationAdjust}
            onChange={(e) => setSaturationAdjust(Number(e.target.value))}
            className='w-full'
          />
          <div className='flex justify-between text-xs text-muted-foreground'>
            <span>-100%</span>
            <span>0%</span>
            <span>+100%</span>
          </div>
        </div>

        {/* 明度の調整 */}
        <div className='space-y-2'>
          <Label htmlFor='brightness-adjust'>
            明度（Brightness）の調整: {brightnessAdjust > 0 ? '+' : ''}
            {Math.round(brightnessAdjust)}%
          </Label>
          <Input
            id='brightness-adjust'
            type='range'
            min='-100'
            max='100'
            value={brightnessAdjust}
            onChange={(e) => setBrightnessAdjust(Number(e.target.value))}
            className='w-full'
          />
          <div className='flex justify-between text-xs text-muted-foreground'>
            <span>-100%</span>
            <span>0%</span>
            <span>+100%</span>
          </div>
        </div>

        {/* 数値入力 */}
        <div className='grid grid-cols-3 gap-4 pt-4 border-t'>
          <div className='space-y-2'>
            <Label htmlFor='hue-input' className='text-xs'>
              色相（度）
            </Label>
            <Input
              id='hue-input'
              type='number'
              min='-180'
              max='180'
              value={Math.round(hueShift)}
              onChange={(e) => setHueShift(Number(e.target.value))}
              className='text-sm'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='saturation-input' className='text-xs'>
              彩度（%）
            </Label>
            <Input
              id='saturation-input'
              type='number'
              min='-100'
              max='100'
              value={Math.round(saturationAdjust)}
              onChange={(e) => setSaturationAdjust(Number(e.target.value))}
              className='text-sm'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='brightness-input' className='text-xs'>
              明度（%）
            </Label>
            <Input
              id='brightness-input'
              type='number'
              min='-100'
              max='100'
              value={Math.round(brightnessAdjust)}
              onChange={(e) => setBrightnessAdjust(Number(e.target.value))}
              className='text-sm'
            />
          </div>
        </div>

        {/* 現在の値のプレビュー */}
        <div className='pt-4 border-t bg-muted rounded-lg p-4'>
          <p className='text-sm font-medium mb-2'>適用される値:</p>
          <div className='grid grid-cols-3 gap-2 text-xs'>
            <div>
              <span className='text-muted-foreground'>色相: </span>
              <span className='font-mono font-semibold'>
                {Math.round((originalColorData.hue + hueShift + 360) % 360)}°
              </span>
            </div>
            <div>
              <span className='text-muted-foreground'>彩度: </span>
              <span className='font-mono font-semibold'>
                {Math.round(
                  Math.max(0, Math.min(100, originalColorData.saturation + saturationAdjust))
                )}
                %
              </span>
            </div>
            <div>
              <span className='text-muted-foreground'>明度: </span>
              <span className='font-mono font-semibold'>
                {Math.round(
                  Math.max(0, Math.min(100, originalColorData.brightness + brightnessAdjust))
                )}
                %
              </span>
            </div>
          </div>
        </div>

        {/* ボタン */}
        <div className='flex gap-4 pt-4'>
          <Button onClick={handleReset} variant='outline' className='flex-1'>
            リセット
          </Button>
          <Button onClick={handleDownload} disabled={isProcessing} className='flex-1'>
            <Download className='mr-2 h-4 w-4' />
            PNGでダウンロード
          </Button>
        </div>
      </CardContent>
      <canvas ref={canvasRef} className='hidden' />
    </Card>
  );
}
