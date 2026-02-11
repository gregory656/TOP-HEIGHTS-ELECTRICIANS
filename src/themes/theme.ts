// src/themes/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#64FFDA', // Electric teal accent
      light: '#A7FFEB',
      dark: '#00BFA5',
      contrastText: '#0A192F',
    },
    secondary: {
      main: '#64B5F6', // Electric blue
      light: '#BBDEFB',
      dark: '#1976D2',
    },
    background: {
      default: '#0A192F', // Deep dark blue
      paper: '#112240', // Slightly lighter for cards
    },
    text: {
      primary: '#E6F1FF',
      secondary: '#8892B0',
    },
    success: {
      main: '#64FFDA',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#6B6B6B #2B2B2B',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#64FFDA',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            backgroundColor: '#112240',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 25, 47, 0.8)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(100, 255, 218, 0.1)',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#112240',
          borderRight: '1px solid rgba(100, 255, 218, 0.1)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(17, 32, 64, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(100, 255, 218, 0.1)',
          borderRadius: 16,
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
          fontSize: '0.9rem',
        },
        contained: {
          background: 'linear-gradient(135deg, #64FFDA 0%, #00BFA5 100%)',
          color: '#0A192F',
          fontWeight: 700,
          '&:hover': {
            background: 'linear-gradient(135deg, #A7FFEB 0%, #64FFDA 100%)',
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 30px rgba(100, 255, 218, 0.3)',
          },
        },
        outlined: {
          borderColor: '#64FFDA',
          color: '#64FFDA',
          '&:hover': {
            backgroundColor: 'rgba(100, 255, 218, 0.1)',
            borderColor: '#64FFDA',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(100, 255, 218, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(100, 255, 218, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#64FFDA',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#112240',
          border: '1px solid rgba(100, 255, 218, 0.2)',
          borderRadius: 16,
        },
      },
    },
  },
});

export default theme;
