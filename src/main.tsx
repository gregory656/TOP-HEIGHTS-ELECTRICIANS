import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import App from './App';
import './App.css';
import { AppThemeProvider, initializeTheme, useResolvedTheme } from './context/ThemeContext';

// Ensure the correct theme is applied as early as possible
// (index.html script handles pre-React; this keeps it consistent in-app)
initializeTheme();

function Root() {
  const theme = useResolvedTheme();
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </MuiThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppThemeProvider>
      <Root />
    </AppThemeProvider>
  </React.StrictMode>
);
