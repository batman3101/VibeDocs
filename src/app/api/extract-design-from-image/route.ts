import { NextRequest, NextResponse } from 'next/server';
import { Jimp } from 'jimp';

interface ExtractedColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
  };
  border: string;
  error: string;
  success: string;
  warning: string;
}

interface ExtractedTypography {
  fontFamily: {
    heading: string;
    body: string;
    mono: string;
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, string>;
}

interface ExtractedSpacing {
  base: number;
  scale: number[];
  container: Record<string, string>;
}

interface ExtractedEffects {
  borderRadius: Record<string, string>;
  shadow: Record<string, string>;
  transition: Record<string, string>;
}

interface DesignSystemResult {
  sourceUrl: string;
  extractedAt: Date;
  colors: ExtractedColors;
  typography: ExtractedTypography;
  spacing: ExtractedSpacing;
  effects: ExtractedEffects;
}

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: '이미지 데이터가 필요합니다' },
        { status: 400 }
      );
    }

    console.log('Extracting design from uploaded image...');

    // Extract base64 data from data URL
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Load image with Jimp
    const jimpImage = await Jimp.read(imageBuffer);
    const width = jimpImage.width;
    const height = jimpImage.height;

    // Extract colors from image
    const colorMap = new Map<string, number>();
    const samplingStep = Math.max(1, Math.floor(Math.min(width, height) / 100)); // Sample every Nth pixel

    for (let y = 0; y < height; y += samplingStep) {
      for (let x = 0; x < width; x += samplingStep) {
        const pixelColor = jimpImage.getPixelColor(x, y);

        // Extract RGBA from pixel color (Jimp stores as RGBA integer)
        const r = (pixelColor >> 24) & 0xff;
        const g = (pixelColor >> 16) & 0xff;
        const b = (pixelColor >> 8) & 0xff;
        const a = pixelColor & 0xff;

        // Skip transparent pixels
        if (a < 128) continue;

        // Quantize colors to reduce palette (group similar colors)
        const quantizedR = Math.round(r / 16) * 16;
        const quantizedG = Math.round(g / 16) * 16;
        const quantizedB = Math.round(b / 16) * 16;

        const hex = rgbToHex(quantizedR, quantizedG, quantizedB);
        colorMap.set(hex, (colorMap.get(hex) || 0) + 1);
      }
    }

    // Sort colors by frequency
    const sortedColors = [...colorMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([color]) => color);

    // Categorize colors
    const lightColors: string[] = [];
    const darkColors: string[] = [];
    const vibrantColors: string[] = [];

    sortedColors.forEach((color) => {
      if (isNeutral(color)) {
        if (isLight(color)) {
          lightColors.push(color);
        } else {
          darkColors.push(color);
        }
      } else {
        vibrantColors.push(color);
      }
    });

    // Build design system from extracted colors
    const designSystem: DesignSystemResult = {
      sourceUrl: 'screenshot-upload',
      extractedAt: new Date(),
      colors: buildColorPalette(lightColors, darkColors, vibrantColors),
      typography: buildTypography(),
      spacing: buildSpacing(),
      effects: buildEffects(),
    };

    console.log('Image design extraction completed successfully');

    return NextResponse.json({
      success: true,
      design: designSystem,
    });

  } catch (error) {
    console.error('Image design extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        success: false,
        error: `스크린샷 분석 실패: ${errorMessage}`,
        hint: '이미지 파일이 손상되었거나 지원되지 않는 형식일 수 있습니다.',
      },
      { status: 500 }
    );
  }
}

// Helper functions
function rgbToHex(r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function isNeutral(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min < 40; // Low saturation
}

function isLight(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  const { r, g, b } = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

function getSaturation(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;
  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2 / 255;
  if (max === min) return 0;
  return max - min / (1 - Math.abs(2 * l - 1)) / 255;
}

function buildColorPalette(
  lightColors: string[],
  darkColors: string[],
  vibrantColors: string[]
): ExtractedColors {
  // Primary: most common vibrant color
  const primary = vibrantColors[0] || '#3b82f6';

  // Secondary: second most common vibrant color or hue-shifted primary
  const secondary = vibrantColors[1] || adjustHue(primary, 30);

  // Accent: third vibrant color or complementary to primary
  const accent = vibrantColors[2] || adjustHue(primary, 180);

  // Background: lightest neutral color
  const background = lightColors[0] || '#ffffff';

  // Surface: second lightest neutral
  const surface = lightColors[1] || '#f8f9fa';

  // Text: darkest colors
  const textPrimary = darkColors[0] || '#1a1a1a';
  const textSecondary = darkColors[1] || '#4a4a4a';
  const textMuted = darkColors[2] || lightColors[lightColors.length - 1] || '#8a8a8a';

  // Border: mid-tone neutral
  const border = lightColors[lightColors.length - 1] || '#e5e7eb';

  return {
    primary,
    secondary,
    accent,
    background,
    surface,
    text: {
      primary: textPrimary,
      secondary: textSecondary,
      muted: textMuted,
    },
    border,
    error: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
  };
}

function adjustHue(hex: string, degrees: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const s = max === min ? 0 : l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / (max - min) + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / (max - min) + 2) / 6;
        break;
      case b:
        h = ((r - g) / (max - min) + 4) / 6;
        break;
    }
  }

  h = (h + degrees / 360) % 1;
  if (h < 0) h += 1;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const newR = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const newG = Math.round(hue2rgb(p, q, h) * 255);
  const newB = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  return rgbToHex(newR, newG, newB);
}

function buildTypography(): ExtractedTypography {
  return {
    fontFamily: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      mono: 'JetBrains Mono, Consolas, monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  };
}

function buildSpacing(): ExtractedSpacing {
  return {
    base: 4,
    scale: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  };
}

function buildEffects(): ExtractedEffects {
  return {
    borderRadius: {
      none: '0',
      sm: '2px',
      md: '4px',
      lg: '8px',
      xl: '12px',
      full: '9999px',
    },
    shadow: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    },
    transition: {
      fast: '150ms ease',
      normal: '300ms ease',
      slow: '500ms ease',
    },
  };
}
