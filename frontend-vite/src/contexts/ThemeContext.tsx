import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check system preference first
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    return savedTheme || 'light'; // Changed default to light
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('app-theme', theme);
    
    // Apply theme to body
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(`${theme}-theme`);
    
    // Apply theme to html element
    const html = document.documentElement;
    html.classList.remove('light-theme', 'dark-theme');
    html.classList.add(`${theme}-theme`);
    html.setAttribute('data-theme', theme);
    
    // Also apply to root element
    const root = document.getElementById('root');
    if (root) {
      root.classList.remove('light-theme', 'dark-theme');
      root.classList.add(`${theme}-theme`);
    }
    
    // Update CSS variables for immediate effect
    document.documentElement.style.setProperty('color-scheme', theme);
    
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};