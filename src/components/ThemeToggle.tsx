import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const getThemeIcon = (currentTheme: string) => {
    switch (currentTheme) {
      case 'white':
        return '☀️';
      case 'black':
        return '🌙';
      case 'saffron':
        return '🟠';
      default:
        return '☀️';
    }
  };

  const getThemeLabel = (currentTheme: string) => {
    switch (currentTheme) {
      case 'white':
        return 'White';
      case 'black':
        return 'Black';
      case 'saffron':
        return 'Saffron';
      default:
        return 'White';
    }
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to next theme. Current theme: ${getThemeLabel(theme)}`}
      title={`Current theme: ${getThemeLabel(theme)}. Click to switch theme.`}
    >
      <span className="theme-icon">{getThemeIcon(theme)}</span>
      <span>{getThemeLabel(theme)}</span>
    </button>
  );
};
