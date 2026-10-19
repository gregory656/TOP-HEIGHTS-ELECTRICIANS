import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import { AppThemeProvider } from './context/ThemeContext';
import { initializeTheme } from './context/ThemeContextData';
import Root from './Root';
initializeTheme();
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><AppThemeProvider><Root /></AppThemeProvider></React.StrictMode>);
