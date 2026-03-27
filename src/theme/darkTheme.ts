import { createTheme, ThemeOptions } from '@mui/material/styles';

const darkPalette = {
  primary: {
    main: '#1E90FF',
    light: '#6CB4FF',
    dark: '#0B4F99',
    contrastText: '#E6F1FF',
  },
  secondary: {
    main: '#6C63FF',
    light: '#9B8CFF',
    dark: '#4A2FC9',
    contrastText: '#E6F1FF',
  },
  background: {
    default: '#0A192F',
    paper: '#112240',
  },
  text: {
    primary: '#E6F1FF',
    secondary: '#8892B0',
  },
  divider: 'rgba(255, 255, 255, 0.1)',
  info: {
    main: '#6C63FF',
    contrastText: '#E6F1FF',
  },
  action: {
    active: '#E6F1FF',
    hover: 'rgba(255, 255, 255, 0.08)',
    selected: 'rgba(108, 99, 255, 0.2)',
    disabledBackground: 'rgba(255, 255, 255, 0.06)',
    disabled: 'rgba(255, 255, 255, 0.3)',
  },
  success: {
    main: '#10B981',
    contrastText: '#E6F1FF',
  },
  warning: {
    main: '#F59E0B',
    contrastText: '#0A192F',
  },
  error: {
    main: '#EF4444',
    contrastText: '#E6F1FF',
  },
};

const glassOverlay = 'rgba(255, 255, 255, 0.05)';
const borderColor = 'rgba(255, 255, 255, 0.1)';
const softShadow = '0 8px 32px rgba(0, 0, 0, 0.25)';

const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    ...darkPalette,
  },
  shape: {
    borderRadius: 20,
  },
  typography: {
    fontFamily: '"Inter", "Poppins", system-ui, sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    body1: {
      lineHeight: 1.8,
    },
    body2: {
      lineHeight: 1.6,
      color: darkPalette.text.secondary,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          backgroundColor: darkPalette.background.default,
          color: darkPalette.text.primary,
        },
        body: {
          margin: 0,
          minHeight: '100vh',
          backgroundImage:
            'radial-gradient(circle at 10% 20%, rgba(30, 144, 255, 0.15), transparent 35%), radial-gradient(circle at 80% 0%, rgba(108, 99, 255, 0.15), transparent 40%), linear-gradient(180deg, #0A192F 0%, #06122A 70%)',
          backgroundColor: darkPalette.background.default,
          color: darkPalette.text.primary,
          fontFamily: '"Inter", "Poppins", system-ui, sans-serif',
          transition: 'background-color 0.3s ease, color 0.3s ease',
          overflowX: 'hidden',
        },
        '#root': {
          minHeight: '100vh',
        },
        '*': {
          transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 25, 47, 0.92)',
          borderBottom: `1px solid ${borderColor}`,
          boxShadow: softShadow,
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: `linear-gradient(180deg, rgba(10, 25, 47, 0.95), rgba(17, 34, 64, 0.95))`,
          borderRight: 'none',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: `linear-gradient(180deg, ${glassOverlay}, rgba(17, 34, 64, 0.8))`,
          border: `1px solid ${borderColor}`,
          boxShadow: softShadow,
          backdropFilter: 'blur(18px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: `linear-gradient(180deg, ${glassOverlay}, rgba(15, 25, 45, 0.85))`,
          border: `1px solid ${borderColor}`,
          borderRadius: 24,
          boxShadow: softShadow,
          backdropFilter: 'blur(18px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          padding: '12px 28px',
          letterSpacing: 0.5,
          boxShadow: softShadow,
          border: `1px solid transparent`,
          '&:focus-visible': {
            boxShadow: '0 0 0 3px rgba(108, 99, 255, 0.4)',
          },
        },
        contained: {
          backgroundImage: 'linear-gradient(135deg, #1E90FF 0%, #6C63FF 75%)',
          color: '#E6F1FF',
          textShadow: '0 0 12px rgba(255, 255, 255, 0.4)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 20px 40px rgba(108, 99, 255, 0.35)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.25)',
          color: '#E6F1FF',
          '&:hover': {
            borderColor: darkPalette.secondary.main,
            backgroundColor: 'rgba(108, 99, 255, 0.15)',
          },
        },
        text: {
          color: '#E6F1FF',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '12px 18px',
          marginBottom: 4,
          transition: 'all 0.3s ease',
          '&.Mui-selected': {
            backgroundColor: 'rgba(108, 99, 255, 0.25)',
          },
          '&:focus-visible': {
            boxShadow: '0 0 0 3px rgba(30, 144, 255, 0.4)',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 16,
          padding: '12px 14px',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(30, 144, 255, 0.35)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            color: darkPalette.text.primary,
          },
          '& .MuiFormHelperText-root': {
            color: darkPalette.text.secondary,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: '#E6F1FF',
          borderRadius: 14,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
          },
          '&:focus-visible': {
            boxShadow: '0 0 0 3px rgba(30, 144, 255, 0.35)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E90FF',
          color: '#0A192F',
          fontWeight: 600,
          borderRadius: 12,
        },
        arrow: {
          color: '#1E90FF',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: 'rgba(108, 99, 255, 0.15)',
          border: `1px solid rgba(108, 99, 255, 0.25)`,
          color: '#E6F1FF',
        },
        standardError: {
          backgroundColor: 'rgba(255, 99, 132, 0.08)',
          border: '1px solid rgba(255, 99, 132, 0.4)',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.15), rgba(255,255,255,0.03))',
          borderRadius: 16,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(5, 5, 12, 0.75)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          border: `1px solid ${borderColor}`,
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          color: '#E6F1FF',
        },
      },
    },
  },
};

const darkTheme = createTheme(darkThemeOptions);

export default darkTheme;
