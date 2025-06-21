// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'leaflet/dist/leaflet.css' // Leaflet CSS import
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)