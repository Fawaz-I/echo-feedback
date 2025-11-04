/**
 * EchoFeedback utility functions
 */

/**
 * Format seconds into MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Variant styles configuration
 */
export const variantStyles = {
  card: {
    padding: '2rem',
    gap: '1rem',
    titleSize: '1.5rem',
    subtitleSize: '0.875rem',
    buttonSize: 80,
    iconSize: 32,
    timerSize: '2rem',
    statusSize: '0.875rem',
  },
  compact: {
    padding: '1rem',
    gap: '0.5rem',
    titleSize: '1rem',
    subtitleSize: '0.875rem',
    buttonSize: 60,
    iconSize: 24,
    timerSize: '1.5rem',
    statusSize: '0.875rem',
  },
  small: {
    padding: '0.75rem',
    gap: '0.5rem',
    titleSize: '0.875rem',
    subtitleSize: '0.75rem',
    buttonSize: 48,
    iconSize: 20,
    timerSize: '1.25rem',
    statusSize: '0.75rem',
  },
} as const;

export type Variant = keyof typeof variantStyles;
