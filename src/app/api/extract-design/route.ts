import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';

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

interface ExtractedComponent {
  type: 'button' | 'card' | 'input' | 'badge' | 'link';
  count: number;
  styles: {
    backgroundColor?: string;
    color?: string;
    borderRadius?: string;
    padding?: string;
    fontSize?: string;
    fontWeight?: string;
    border?: string;
    boxShadow?: string;
  };
  variants: string[];
}

interface DesignSystemResult {
  sourceUrl: string;
  extractedAt: Date;
  colors: ExtractedColors;
  typography: ExtractedTypography;
  spacing: ExtractedSpacing;
  effects: ExtractedEffects;
  components?: ExtractedComponent[];
}

export async function POST(request: NextRequest) {
  let browser = null;

  try {
    const { url, options } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    console.log(`Extracting design from: ${url}`);

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // Navigate to the URL
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Extract design elements
    const extractedData = await page.evaluate(() => {
      const colors: Map<string, number> = new Map();
      const fontFamilies: Map<string, number> = new Map();
      const fontSizes: Map<string, number> = new Map();
      const bgColors: Map<string, number> = new Map();
      const textColors: Map<string, number> = new Map();
      const borderColors: Map<string, number> = new Map();
      const borderRadii: Map<string, number> = new Map();

      // Helper to convert rgb to hex
      const rgbToHex = (rgb: string): string => {
        const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (!match) return rgb;
        const r = parseInt(match[1]);
        const g = parseInt(match[2]);
        const b = parseInt(match[3]);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      };

      // Get all elements
      const allElements = document.querySelectorAll('*');

      allElements.forEach((el) => {
        const styles = window.getComputedStyle(el);

        // Extract background colors
        const bgColor = styles.backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          const hex = rgbToHex(bgColor);
          bgColors.set(hex, (bgColors.get(hex) || 0) + 1);
        }

        // Extract text colors
        const textColor = styles.color;
        if (textColor) {
          const hex = rgbToHex(textColor);
          textColors.set(hex, (textColors.get(hex) || 0) + 1);
        }

        // Extract border colors
        const borderColor = styles.borderColor;
        if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
          const hex = rgbToHex(borderColor);
          borderColors.set(hex, (borderColors.get(hex) || 0) + 1);
        }

        // Extract font families
        const fontFamily = styles.fontFamily.split(',')[0].trim().replace(/['"]/g, '');
        if (fontFamily) {
          fontFamilies.set(fontFamily, (fontFamilies.get(fontFamily) || 0) + 1);
        }

        // Extract font sizes
        const fontSize = styles.fontSize;
        if (fontSize) {
          fontSizes.set(fontSize, (fontSizes.get(fontSize) || 0) + 1);
        }

        // Extract border radius
        const borderRadius = styles.borderRadius;
        if (borderRadius && borderRadius !== '0px') {
          borderRadii.set(borderRadius, (borderRadii.get(borderRadius) || 0) + 1);
        }
      });

      // Sort by frequency and get top values
      const sortByFrequency = <T extends string | number>(map: Map<T, number>, limit = 10): T[] => {
        return [...map.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(([key]) => key);
      };

      const topBgColors = sortByFrequency(bgColors);
      const topTextColors = sortByFrequency(textColors);
      const topBorderColors = sortByFrequency(borderColors);
      const topFontFamilies = sortByFrequency(fontFamilies);
      const topFontSizes = sortByFrequency(fontSizes, 15);
      const topBorderRadii = sortByFrequency(borderRadii);

      // Get body and heading styles
      const bodyStyles = window.getComputedStyle(document.body);
      const h1 = document.querySelector('h1');
      const headingStyles = h1 ? window.getComputedStyle(h1) : bodyStyles;

      // Extract components
      const extractComponent = (el: Element, type: string) => {
        const styles = window.getComputedStyle(el);
        return {
          type,
          backgroundColor: rgbToHex(styles.backgroundColor),
          color: rgbToHex(styles.color),
          borderRadius: styles.borderRadius,
          padding: styles.padding,
          fontSize: styles.fontSize,
          fontWeight: styles.fontWeight,
          border: styles.border,
          boxShadow: styles.boxShadow,
        };
      };

      // Extract buttons
      const buttons = Array.from(document.querySelectorAll('button, [role="button"], a.btn, .button, input[type="submit"], input[type="button"]'));
      const buttonStyles = buttons.slice(0, 10).map(el => extractComponent(el, 'button'));

      // Extract cards
      const cards = Array.from(document.querySelectorAll('[class*="card"], .card, article, .panel, [class*="Card"]'));
      const cardStyles = cards.slice(0, 10).map(el => extractComponent(el, 'card'));

      // Extract inputs
      const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea, select'));
      const inputStyles = inputs.slice(0, 10).map(el => extractComponent(el, 'input'));

      // Extract badges/tags
      const badges = Array.from(document.querySelectorAll('[class*="badge"], [class*="tag"], .chip, .label, [class*="Badge"]'));
      const badgeStyles = badges.slice(0, 10).map(el => extractComponent(el, 'badge'));

      // Extract links
      const links = Array.from(document.querySelectorAll('a:not(.btn):not(.button)'));
      const linkStyles = links.slice(0, 10).map(el => extractComponent(el, 'link'));

      return {
        bgColors: topBgColors,
        textColors: topTextColors,
        borderColors: topBorderColors,
        fontFamilies: topFontFamilies,
        fontSizes: topFontSizes,
        borderRadii: topBorderRadii,
        bodyFontFamily: bodyStyles.fontFamily.split(',')[0].trim().replace(/['"]/g, ''),
        headingFontFamily: headingStyles.fontFamily.split(',')[0].trim().replace(/['"]/g, ''),
        bodyBgColor: rgbToHex(bodyStyles.backgroundColor),
        bodyTextColor: rgbToHex(bodyStyles.color),
        components: {
          buttons: { count: buttons.length, styles: buttonStyles },
          cards: { count: cards.length, styles: cardStyles },
          inputs: { count: inputs.length, styles: inputStyles },
          badges: { count: badges.length, styles: badgeStyles },
          links: { count: links.length, styles: linkStyles },
        },
      };
    });

    await browser.close();
    browser = null;

    // Build design system from extracted data
    const designSystem: DesignSystemResult = {
      sourceUrl: url,
      extractedAt: new Date(),
      colors: buildColorPalette(extractedData),
      typography: buildTypography(extractedData),
      spacing: buildSpacing(),
      effects: buildEffects(extractedData),
      components: options?.components ? buildComponents(extractedData.components) : undefined,
    };

    console.log('Design extraction completed successfully');

    return NextResponse.json({
      success: true,
      design: designSystem,
    });

  } catch (error) {
    console.error('Design extraction error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        success: false,
        error: `추출 실패: ${errorMessage}`,
        hint: '웹사이트 접근이 불가능하거나 로딩 시간이 초과되었습니다.',
      },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Helper functions to build design system
function buildColorPalette(data: {
  bgColors: string[];
  textColors: string[];
  borderColors: string[];
  bodyBgColor: string;
  bodyTextColor: string;
}): ExtractedColors {
  // Find primary color (most used non-white/black background color)
  const primaryCandidates = data.bgColors.filter(
    (c) => !isNeutral(c) && c !== '#ffffff' && c !== '#000000'
  );
  const primary = primaryCandidates[0] || '#3b82f6';

  // Find secondary color
  const secondary = primaryCandidates[1] || adjustHue(primary, 30);

  // Find accent color
  const accent = primaryCandidates[2] || adjustHue(primary, 180);

  // Background color
  const background = data.bodyBgColor || data.bgColors[0] || '#ffffff';

  // Surface color (slightly different from background)
  const surface = data.bgColors.find((c) => c !== background && isLight(c)) || '#f8f9fa';

  // Border color
  const border = data.borderColors[0] || '#e5e7eb';

  // Text colors
  const textPrimary = data.bodyTextColor || data.textColors[0] || '#1a1a1a';
  const textSecondary = data.textColors.find((c) => c !== textPrimary && isDark(c)) || '#4a4a4a';
  const textMuted = data.textColors.find(
    (c) => c !== textPrimary && c !== textSecondary
  ) || '#8a8a8a';

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

function buildTypography(data: {
  fontFamilies: string[];
  fontSizes: string[];
  bodyFontFamily: string;
  headingFontFamily: string;
}): ExtractedTypography {
  const heading = data.headingFontFamily || data.fontFamilies[0] || 'Inter';
  const body = data.bodyFontFamily || data.fontFamilies[0] || 'Inter';

  // Sort font sizes and create scale
  const sortedSizes = data.fontSizes
    .map((s) => parseFloat(s))
    .filter((s) => !isNaN(s))
    .sort((a, b) => a - b);

  const fontSizeMap: Record<string, string> = {};
  const sizeNames = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl'];

  sortedSizes.slice(0, 8).forEach((size, index) => {
    if (sizeNames[index]) {
      fontSizeMap[sizeNames[index]] = `${size}px`;
    }
  });

  // Fill in missing sizes with defaults
  const defaults: Record<string, string> = {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  };

  Object.keys(defaults).forEach((key) => {
    if (!fontSizeMap[key]) {
      fontSizeMap[key] = defaults[key];
    }
  });

  return {
    fontFamily: {
      heading: `${heading}, sans-serif`,
      body: `${body}, sans-serif`,
      mono: 'JetBrains Mono, Consolas, monospace',
    },
    fontSize: fontSizeMap,
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

function buildEffects(data: { borderRadii: string[] }): ExtractedEffects {
  const radii = data.borderRadii.length > 0
    ? data.borderRadii
    : ['0px', '2px', '4px', '8px', '12px'];

  return {
    borderRadius: {
      none: '0',
      sm: radii[0] || '2px',
      md: radii[1] || '4px',
      lg: radii[2] || '8px',
      xl: radii[3] || '12px',
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

// Color utility functions
function isNeutral(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const { r, g, b } = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min < 30; // Low saturation
}

function isLight(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return true;
  const { r, g, b } = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

function isDark(hex: string): boolean {
  return !isLight(hex);
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

function adjustHue(hex: string, degrees: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  // Convert to HSL
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

  // Adjust hue
  h = (h + degrees / 360) % 1;
  if (h < 0) h += 1;

  // Convert back to RGB
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

  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
}

interface ComponentStyleData {
  type: string;
  backgroundColor: string;
  color: string;
  borderRadius: string;
  padding: string;
  fontSize: string;
  fontWeight: string;
  border: string;
  boxShadow: string;
}

interface ComponentData {
  count: number;
  styles: ComponentStyleData[];
}

function buildComponents(data: {
  buttons: ComponentData;
  cards: ComponentData;
  inputs: ComponentData;
  badges: ComponentData;
  links: ComponentData;
}): ExtractedComponent[] {
  const components: ExtractedComponent[] = [];

  // Process buttons
  if (data.buttons.count > 0) {
    const primaryButton = data.buttons.styles[0];
    const variants = new Set<string>();
    data.buttons.styles.forEach(s => {
      if (s.backgroundColor && s.backgroundColor !== 'transparent' && s.backgroundColor !== '#00000000') {
        variants.add(s.backgroundColor);
      }
    });

    components.push({
      type: 'button',
      count: data.buttons.count,
      styles: primaryButton ? {
        backgroundColor: primaryButton.backgroundColor,
        color: primaryButton.color,
        borderRadius: primaryButton.borderRadius,
        padding: primaryButton.padding,
        fontSize: primaryButton.fontSize,
        fontWeight: primaryButton.fontWeight,
        border: primaryButton.border,
        boxShadow: primaryButton.boxShadow,
      } : {},
      variants: Array.from(variants).slice(0, 5),
    });
  }

  // Process cards
  if (data.cards.count > 0) {
    const primaryCard = data.cards.styles[0];
    components.push({
      type: 'card',
      count: data.cards.count,
      styles: primaryCard ? {
        backgroundColor: primaryCard.backgroundColor,
        borderRadius: primaryCard.borderRadius,
        padding: primaryCard.padding,
        border: primaryCard.border,
        boxShadow: primaryCard.boxShadow,
      } : {},
      variants: [],
    });
  }

  // Process inputs
  if (data.inputs.count > 0) {
    const primaryInput = data.inputs.styles[0];
    components.push({
      type: 'input',
      count: data.inputs.count,
      styles: primaryInput ? {
        backgroundColor: primaryInput.backgroundColor,
        color: primaryInput.color,
        borderRadius: primaryInput.borderRadius,
        padding: primaryInput.padding,
        fontSize: primaryInput.fontSize,
        border: primaryInput.border,
      } : {},
      variants: [],
    });
  }

  // Process badges
  if (data.badges.count > 0) {
    const primaryBadge = data.badges.styles[0];
    const variants = new Set<string>();
    data.badges.styles.forEach(s => {
      if (s.backgroundColor && s.backgroundColor !== 'transparent') {
        variants.add(s.backgroundColor);
      }
    });

    components.push({
      type: 'badge',
      count: data.badges.count,
      styles: primaryBadge ? {
        backgroundColor: primaryBadge.backgroundColor,
        color: primaryBadge.color,
        borderRadius: primaryBadge.borderRadius,
        padding: primaryBadge.padding,
        fontSize: primaryBadge.fontSize,
        fontWeight: primaryBadge.fontWeight,
      } : {},
      variants: Array.from(variants).slice(0, 5),
    });
  }

  // Process links
  if (data.links.count > 0) {
    const primaryLink = data.links.styles[0];
    components.push({
      type: 'link',
      count: data.links.count,
      styles: primaryLink ? {
        color: primaryLink.color,
        fontSize: primaryLink.fontSize,
        fontWeight: primaryLink.fontWeight,
      } : {},
      variants: [],
    });
  }

  return components;
}
