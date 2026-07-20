import { useEffect } from 'react';
import { autoTheme, useThemeStore } from '../stores/useThemeStore';

/**
 * Drives the theme engine: stamps the resolved theme onto <html data-theme>,
 * which the CSS token layer keys off of. In 'auto' mode the resolved theme is
 * time-based (dark 18:00–07:00), so we re-evaluate every minute to flip at the
 * boundary without a reload. Renders nothing.
 */
export default function ThemeController() {
  const mode = useThemeStore((s) => s.mode);

  useEffect(() => {
    const apply = () => {
      const resolved = mode === 'auto' ? autoTheme() : mode;
      document.documentElement.setAttribute('data-theme', resolved);
    };

    apply();

    // Only 'auto' needs a ticking re-check; light/dark are static.
    if (mode !== 'auto') return;
    const timer = window.setInterval(apply, 60_000);
    return () => window.clearInterval(timer);
  }, [mode]);

  return null;
}
