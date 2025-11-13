'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ColorStatistics } from '@/utils/colorUtils';

interface ColorAnalysisProps {
  colorData: ColorStatistics;
}

export default function ColorAnalysis({ colorData }: ColorAnalysisProps) {
  const { average, min, max, histogram } = colorData;

  // HSL値を表示用の色に変換
  const hslColor = `hsl(${Math.round(average.hue)}, ${Math.round(average.saturation)}%, ${Math.round(average.brightness)}%)`;

  // ヒストグラムの最大値を取得（正規化用）
  const maxHueCount = Math.max(...histogram.hue);
  const maxSatCount = Math.max(...histogram.saturation);
  const maxBrightCount = Math.max(...histogram.brightness);

  return (
    <div className='space-y-6'>
      <h2 className='text-2xl font-bold'>色の三要素</h2>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {/* 色相 */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>色相（Hue）</CardTitle>
            <CardDescription>赤・青・黄など「色み」</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='text-3xl font-bold'>{Math.round(average.hue)}°</div>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>最小値:</span>
                <span className='font-mono'>{Math.round(min.hue)}°</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>最大値:</span>
                <span className='font-mono'>{Math.round(max.hue)}°</span>
              </div>
            </div>
            <div className='h-4 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 rounded-full relative'>
              <div
                className='absolute top-0 h-full w-0.5 bg-black'
                style={{
                  left: `${(average.hue / 360) * 100}%`,
                }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* 明度 */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>明度（Brightness）</CardTitle>
            <CardDescription>明るい・暗い</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='text-3xl font-bold'>{Math.round(average.brightness)}%</div>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>最小値:</span>
                <span className='font-mono'>{Math.round(min.brightness)}%</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>最大値:</span>
                <span className='font-mono'>{Math.round(max.brightness)}%</span>
              </div>
            </div>
            <div className='h-4 bg-gradient-to-r from-black to-white rounded-full relative'>
              <div
                className='absolute top-0 h-full w-0.5 bg-red-500'
                style={{
                  left: `${average.brightness}%`,
                }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* 彩度 */}
        <Card>
          <CardHeader>
            <CardTitle className='text-lg'>彩度（Saturation）</CardTitle>
            <CardDescription>鮮やかさ・くすみ</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='text-3xl font-bold'>{Math.round(average.saturation)}%</div>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>最小値:</span>
                <span className='font-mono'>{Math.round(min.saturation)}%</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>最大値:</span>
                <span className='font-mono'>{Math.round(max.saturation)}%</span>
              </div>
            </div>
            <div
              className='h-4 rounded-full relative'
              style={{
                background: `linear-gradient(to right, 
                  hsl(${Math.round(average.hue)}, 0%, 50%), 
                  hsl(${Math.round(average.hue)}, 100%, 50%))`,
              }}
            >
              <div
                className='absolute top-0 h-full w-0.5 bg-black'
                style={{
                  left: `${average.saturation}%`,
                }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 平均色表示 */}
      <Card>
        <CardHeader>
          <CardTitle>平均色</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex items-center gap-4'>
            <div
              className='w-24 h-24 rounded-lg shadow-lg border-2 border-border'
              style={{ backgroundColor: hslColor }}
            ></div>
            <div>
              <p className='text-sm text-muted-foreground mb-1'>HSL値</p>
              <p className='font-mono text-lg'>
                hsl({Math.round(average.hue)}, {Math.round(average.saturation)}
                %, {Math.round(average.brightness)}%)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ヒストグラム */}
      <Card>
        <CardHeader>
          <CardTitle>ヒストグラム</CardTitle>
          <CardDescription>色の分布を可視化</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* 色相のヒストグラム */}
          <div>
            <h3 className='text-sm font-medium mb-2'>色相の分布</h3>
            <div className='h-32 flex items-end gap-px'>
              {histogram.hue.map((count, index) => (
                <div
                  key={index}
                  className='flex-1 bg-primary'
                  style={{
                    height: `${(count / maxHueCount) * 100}%`,
                    backgroundColor: `hsl(${index}, 100%, 50%)`,
                  }}
                  title={`${index}°: ${count}ピクセル`}
                ></div>
              ))}
            </div>
          </div>

          {/* 彩度のヒストグラム */}
          <div>
            <h3 className='text-sm font-medium mb-2'>彩度の分布</h3>
            <div className='h-32 flex items-end gap-px'>
              {histogram.saturation.map((count, index) => (
                <div
                  key={index}
                  className='flex-1 bg-primary'
                  style={{
                    height: `${maxSatCount > 0 ? (count / maxSatCount) * 100 : 0}%`,
                    backgroundColor: `hsl(${Math.round(average.hue)}, ${index}%, 50%)`,
                  }}
                  title={`${index}%: ${count}ピクセル`}
                ></div>
              ))}
            </div>
          </div>

          {/* 明度のヒストグラム */}
          <div>
            <h3 className='text-sm font-medium mb-2'>明度の分布</h3>
            <div className='h-32 flex items-end gap-px'>
              {histogram.brightness.map((count, index) => {
                const brightness = (index / 100) * 255;
                return (
                  <div
                    key={index}
                    className='flex-1'
                    style={{
                      height: `${maxBrightCount > 0 ? (count / maxBrightCount) * 100 : 0}%`,
                      backgroundColor: `rgb(${brightness}, ${brightness}, ${brightness})`,
                    }}
                    title={`${index}%: ${count}ピクセル`}
                  ></div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
