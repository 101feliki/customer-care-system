import React, { useEffect } from 'react';
import AppRouter from './AppRouter';
import './index.css';

function App() {
  useEffect(() => {
    // Set the base font size for consistent scaling
    document.documentElement.style.fontSize = 'px';
    
    // Remove any existing viewport meta
    const existingMeta = document.querySelector('meta[name="viewport"]');
    if (existingMeta) {
      existingMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    }
  }, []);

  return (
    <div className="App layout-container">
      <AppRouter />
    </div>
  );
}

export default App;