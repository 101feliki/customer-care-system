// components/MainLayout.tsx
import React from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '../contexts/ThemeContext';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  title = 'Customer Care System',
  description 
}) => {
  const { theme } = useTheme();

  return (
    <div className="app-container">
      <Sidebar />
      
      <div className="main-content">
        <header className="main-header px-4 py-3 md:px-6 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-primary">{title}</h1>
              {description && (
                <p className="text-sm text-secondary">{description}</p>
              )}
            </div>
          </div>
        </header>
        
        <div className="scrollable-content">
          <div className="content-padding">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;