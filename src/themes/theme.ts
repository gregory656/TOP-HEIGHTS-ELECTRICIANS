import { createTheme, keyframes } from '@mui/material/styles';

const shimmerWave = keyframes`
  0% {
    background-position: -150% 0;
  }
  100% {
    background-position: 150% 0;
  }
`;

const neonPulse = keyframes`
  0% {
    box-shadow: 0 0 15px rgba(94, 240, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 30px rgba(94, 240, 255, 0.65);
  }
  100% {
    box-shadow: 0 0 15px rgba(94, 240, 255, 0.3);
  }
`;

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#5EF0FF', // Neon electric cyan
      light: '#B3FFFF',
      dark: '#28C6D5',
      contrastText: '#041123',
    },
    secondary: {
      main: '#C5D1FF', // Metallic silver tones
      light: '#F3F6FF',
      dark: '#8A9FFF',
      contrastText: '#050914',
    },
    background: {
      default: '#030811',
      paper: '#0B1226',
    },
    text: {
      primary: '#F8FAFF',
      secondary: '#9FB4D7',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
    info: {
      main: '#70D3FF',
    },
    success: {
      main: '#5CF7C7',
    },
  },
  typography: {
    fontFamily: '"Space Grotesk", "Inter", "Roboto", sans-serif',
    h1: {
      fontWeight: 700,
      lineHeight: 1.1,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 600,
    },
    body1: {
      lineHeight: 1.7,
    },
    body2: {
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#030811',
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(94, 240, 255, 0.22) 0%, transparent 35%), radial-gradient(circle at 80% 10%, rgba(125, 159, 255, 0.18) 0%, transparent 45%), radial-gradient(circle at 40% 80%, rgba(80, 120, 255, 0.15) 0%, transparent 50%)',
          minHeight: '100vh',
          color: '#F8FAFF',
          fontFamily: '"Space Grotesk", "Inter", sans-serif',
          overflowX: 'hidden',
          scrollbarColor: '#5EF0FF #0B1226',
          '&::-webkit-scrollbar': {
            width: 10,
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'linear-gradient(180deg, rgba(94, 240, 255, 0.8), rgba(94, 240, 255, 0.35))',
            borderRadius: 999,
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '24px',
          paddingRight: '24px',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background:
            'linear-gradient(180deg, rgba(5, 8, 17, 0.9), rgba(12, 23, 50, 0.75))',
          border: '1px solid rgba(94, 240, 255, 0.24)',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 20px 45px rgba(5, 11, 25, 0.8)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'rgba(7, 12, 26, 0.85)',
          border: '1px solid rgba(94, 240, 255, 0.12)',
          borderRadius: 20,
          transition: 'transform 0.35s ease, box-shadow 0.35s ease',
          '&:hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 30px 60px rgba(94, 240, 255, 0.35)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          letterSpacing: 0.5,
          padding: '12px 28px',
          fontWeight: 700,
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 60%)',
            opacity: 0,
            transition: 'opacity 0.4s ease',
          },
          '&:hover::after': {
            opacity: 1,
          },
        },
        contained: {
          backgroundImage: 'linear-gradient(135deg, #0F172A 0%, #5EF0FF 60%, #C5D1FF 100%)',
          color: '#030911',
          boxShadow: '0 0 25px rgba(94, 240, 255, 0.35)',
          animation: `${shimmerWave} 12s linear infinite`,
          '&:hover': {
            transform: 'translateY(-2px) scale(1.01)',
            boxShadow: '0 20px 50px rgba(94, 240, 255, 0.6)',
          },
        },
        outlined: {
          borderColor: 'rgba(94, 240, 255, 0.4)',
          color: '#F8FAFF',
          '&:hover': {
            backgroundColor: 'rgba(94, 240, 255, 0.08)',
            borderColor: 'rgba(94, 240, 255, 0.6)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: 999,
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          overflow: 'hidden',
        },
        bar: {
          borderRadius: 999,
          backgroundImage: 'linear-gradient(90deg, #3A7BFF 0%, #5EF0FF 60%, #ADFFEF 100%)',
          animation: `${neonPulse} 4s ease-in-out infinite`,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          border: '1px solid rgba(94, 240, 255, 0.4)',
          backgroundColor: 'rgba(94, 240, 255, 0.12)',
          color: '#F8FAFF',
          fontWeight: 600,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          background:
            'radial-gradient(circle at top, rgba(94, 240, 255, 0.6), rgba(5, 8, 17, 0.4))',
          color: '#030911',
        },
      },
    },
  },
});

export default theme;
