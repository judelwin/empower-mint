import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useUser } from './UserContext.js';

interface ThemeContextType {
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { userProfile } = useUser();

  const fontSize = userProfile?.accessibility.fontSize || 'medium';
  const highContrast = userProfile?.accessibility.highContrast || false;
  const colorblindMode = userProfile?.accessibility.colorblindMode || 'none';

  useEffect(() => {
    // Apply font size to root element
    const root = document.documentElement;
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.fontSize = fontSizeMap[fontSize];

    // Apply high contrast class
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }

    // Apply colorblind mode
    document.body.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (colorblindMode !== 'none') {
      document.body.classList.add(colorblindMode);
    }
  }, [fontSize, highContrast, colorblindMode]);

  return (
    <ThemeContext.Provider
      value={{
        fontSize,
        highContrast,
        colorblindMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

