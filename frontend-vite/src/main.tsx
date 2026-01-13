import React from 'react'
import { createRoot } from 'react-dom/client'  // Updated import
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

// Get the root element

const container = document.getElementById('root')!; 
const root = createRoot(container)

// Render the app
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)