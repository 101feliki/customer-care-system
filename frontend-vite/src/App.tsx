import React, { useEffect } from 'react';
import AppRouter from './AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext'; // Ensure ThemeProvider is also here
import './index.css';
import { Toaster } from 'react-hot-toast';

function App() {
  useEffect(() => {
    // Set the base font size for consistent scaling
    document.documentElement.style.fontSize = '16px'; // Added 16 here to fix the empty px
    
    const existingMeta = document.querySelector('meta[name="viewport"]');
    if (existingMeta) {
      existingMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, []);

  return (
    <div className="App layout-container">
      {/* FIX: Wrap the Router inside the Provider */}
      <AuthProvider>
        <ThemeProvider> 
          <AppRouter />
        </ThemeProvider>
      </AuthProvider>
      <Toaster position="top-right" reverseOrder={false} />
    </div>
  );
}

export default App;