// RGBからHSLに変換
export function rgbToHsl(
  r: number,
  g: number,
  b: number
): {
  h: number;
  s: number;
  l: number;
} {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

// HSLからRGBに変換
export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h = h % 360;
  s = s / 100;
  l = l / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}

// 色の統計情報
export interface ColorStatistics {
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
}

// 画像の色を分析
export function analyzeImageColors(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement
): ColorStatistics {
  // Canvasに画像を描画
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  ctx.drawImage(image, 0, 0);

  // ピクセルデータを取得
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 統計情報を収集
  let totalH = 0;
  let totalS = 0;
  let totalL = 0;
  let pixelCount = 0;

  let minH = Infinity,
    minS = Infinity,
    minL = Infinity;
  let maxH = -Infinity,
    maxS = -Infinity,
    maxL = -Infinity;

  // ヒストグラム用の配列（360 bins for hue, 100 bins for saturation/brightness）
  const hueHistogram = new Array(360).fill(0);
  const saturationHistogram = new Array(100).fill(0);
  const brightnessHistogram = new Array(100).fill(0);

  // パフォーマンスのために、サンプリング間隔を設定
  const sampleInterval = Math.max(1, Math.floor(data.length / (4 * 50000)));

  for (let i = 0; i < data.length; i += 4 * sampleInterval) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // 透明ピクセルはスキップ
    if (a < 128) continue;

    const hsl = rgbToHsl(r, g, b);
    const h = Math.round(hsl.h);
    const s = Math.round(hsl.s);
    const l = Math.round(hsl.l);

    totalH += hsl.h;
    totalS += hsl.s;
    totalL += hsl.l;
    pixelCount++;

    // 最小値・最大値を更新
    minH = Math.min(minH, hsl.h);
    minS = Math.min(minS, hsl.s);
    minL = Math.min(minL, hsl.l);
    maxH = Math.max(maxH, hsl.h);
    maxS = Math.max(maxS, hsl.s);
    maxL = Math.max(maxL, hsl.l);

    // ヒストグラムを更新
    const hueIndex = Math.min(359, Math.max(0, h));
    const satIndex = Math.min(99, Math.max(0, s));
    const brightIndex = Math.min(99, Math.max(0, l));

    hueHistogram[hueIndex]++;
    saturationHistogram[satIndex]++;
    brightnessHistogram[brightIndex]++;
  }

  return {
    average: {
      hue: totalH / pixelCount,
      saturation: totalS / pixelCount,
      brightness: totalL / pixelCount,
    },
    min: {
      hue: minH,
      saturation: minS,
      brightness: minL,
    },
    max: {
      hue: maxH,
      saturation: maxS,
      brightness: maxL,
    },
    histogram: {
      hue: hueHistogram,
      saturation: saturationHistogram,
      brightness: brightnessHistogram,
    },
  };
}

// 画像に色調整を適用
export function applyColorAdjustments(
  image: HTMLImageElement,
  canvas: HTMLCanvasElement,
  hueShift: number,
  saturationAdjust: number,
  brightnessAdjust: number
): string {
  // Canvasに画像を描画
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 各ピクセルを処理
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // 透明ピクセルはスキップ
    if (a < 128) continue;

    // RGBをHSLに変換
    const hsl = rgbToHsl(r, g, b);

    // 調整値を適用
    let newH = (hsl.h + hueShift + 360) % 360;
    let newS = Math.max(0, Math.min(100, hsl.s + saturationAdjust));
    let newL = Math.max(0, Math.min(100, hsl.l + brightnessAdjust));

    // HSLをRGBに戻す
    const [newR, newG, newB] = hslToRgb(newH, newS, newL);

    data[i] = newR;
    data[i + 1] = newG;
    data[i + 2] = newB;
  }

  // 調整後の画像データをCanvasに描画
  ctx.putImageData(imageData, 0, 0);

  // Canvasから画像URLを生成
  return canvas.toDataURL('image/png');
}
