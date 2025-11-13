'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUploader from '@/components/ImageUploader';
import ColorAnalysis from '@/components/ColorAnalysis';
import ColorAdjuster from '@/components/ColorAdjuster';
import { analyzeImageColors } from '@/utils/colorUtils';

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [colorData, setColorData] = useState<{
    average: {
      hue: number;
      saturation: number;
      brightness: number;
    };
    min: {
      hue: number;
      saturation: number;
      brightness: number;
    };
    max: {
      hue: number;
      saturation: number;
      brightness: number;
    };
    histogram: {
      hue: number[];
      saturation: number[];
      brightness: number[];
    };
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setProcessedImageUrl(null);

    // 画像の読み込み後に分析
    const img = new Image();
    img.onload = () => {
      if (canvasRef.current) {
        const analysis = analyzeImageColors(img, canvasRef.current);
        setColorData(analysis);
      }
    };
    img.src = url;
  };

  const handleImageProcessed = useCallback((processedUrl: string) => {
    setProcessedImageUrl(processedUrl);
  }, []);

  const handleReset = () => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    if (processedImageUrl && processedImageUrl !== imageUrl) {
      // data URLの場合はrevokeObjectURLは不要
      if (processedImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(processedImageUrl);
      }
    }
    setImageUrl(null);
    setProcessedImageUrl(null);
    setColorData(null);
  };

  return (
    <div className='min-h-screen bg-background p-4 sm:p-8'>
      <div className='max-w-7xl mx-auto'>
        <h1 className='text-4xl font-bold text-foreground mb-2'>Iro</h1>
        <p className='text-muted-foreground mb-4'>画像の色の三要素を計測・調整するWebアプリ</p>

        {!imageUrl ? (
          <Card>
            <CardHeader>
              <CardTitle>画像をアップロード</CardTitle>
              <CardDescription>
                画像をアップロードして、色の三要素（色相・明度・彩度）を計測・調整します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader onImageUpload={handleImageUpload} />
            </CardContent>
          </Card>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8'>
            {/* 設定パネル */}
            <div className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>画像プレビュー</CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <button
                    onClick={handleReset}
                    className='w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition'
                  >
                    別の画像をアップロード
                  </button>

                  {/* 画像の比較表示 */}
                  <div className='space-y-4'>
                    <div>
                      <h3 className='text-sm font-medium mb-2'>元の画像</h3>
                      <img
                        src={imageUrl}
                        alt='元の画像'
                        className='w-full h-auto rounded-lg shadow-md border border-border'
                      />
                    </div>
                    {processedImageUrl && (
                      <div>
                        <h3 className='text-sm font-medium mb-2'>調整後の画像</h3>
                        <img
                          src={processedImageUrl}
                          alt='調整後の画像'
                          className='w-full h-auto rounded-lg shadow-md border border-border'
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {colorData && (
                <ColorAdjuster
                  imageUrl={imageUrl}
                  originalColorData={colorData.average}
                  onImageProcessed={handleImageProcessed}
                />
              )}
            </div>

            {/* 分析結果エリア */}
            <div>
              {colorData && (
                <Card>
                  <CardHeader>
                    <CardTitle>色の分析結果</CardTitle>
                    <CardDescription>
                      画像の色の三要素を詳細に分析した結果を表示します
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ColorAnalysis colorData={colorData} />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className='hidden' />
      </div>
    </div>
  );
}
