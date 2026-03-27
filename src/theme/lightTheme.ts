import { createTheme, ThemeOptions } from '@mui/material/styles';

const lightPalette = {
  primary: {
    main: '#1E90FF',
    light: '#6CB4FF',
    dark: '#0B4F99',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#6C63FF',
    light: '#9B8CFF',
    dark: '#4A2FC9',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
  },
  divider: 'rgba(0, 0, 0, 0.08)',
  info: {
    main: '#6C63FF',
    contrastText: '#FFFFFF',
  },
  action: {
    active: '#1E293B',
    hover: 'rgba(0, 0, 0, 0.04)',
    selected: 'rgba(108, 99, 255, 0.15)',
    disabledBackground: 'rgba(0, 0, 0, 0.04)',
    disabled: 'rgba(0, 0, 0, 0.26)',
  },
  success: {
    main: '#10B981',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F59E0B',
    contrastText: '#1E293B',
  },
  error: {
    main: '#EF4444',
    contrastText: '#FFFFFF',
  },
};

const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    ...lightPalette,
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
      color: lightPalette.text.secondary,
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
          backgroundColor: lightPalette.background.default,
          color: lightPalette.text.primary,
        },
        body: {
          margin: 0,
          minHeight: '100vh',
          backgroundImage: 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)',
          backgroundColor: lightPalette.background.default,
          color: lightPalette.text.primary,
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
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          borderRight: 'none',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          backdropFilter: 'blur(18px)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 95%)',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          borderRadius: 24,
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
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
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
          border: '1px solid transparent',
          '&:focus-visible': {
            boxShadow: '0 0 0 3px rgba(108, 99, 255, 0.3)',
          },
        },
        contained: {
          backgroundImage: 'linear-gradient(135deg, #1E90FF 0%, #6C63FF 75%)',
          color: '#FFFFFF',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 28px rgba(108, 99, 255, 0.25)',
          },
        },
        outlined: {
          borderColor: 'rgba(0, 0, 0, 0.2)',
          color: lightPalette.text.primary,
          '&:hover': {
            borderColor: lightPalette.secondary.main,
            backgroundColor: 'rgba(108, 99, 255, 0.08)',
          },
        },
        text: {
          color: lightPalette.text.primary,
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
            backgroundColor: 'rgba(108, 99, 255, 0.15)',
          },
          '&:focus-visible': {
            boxShadow: '0 0 0 3px rgba(30, 144, 255, 0.3)',
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: 16,
          padding: '12px 14px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.03)',
          },
          '&.Mui-focused': {
            boxShadow: '0 0 0 3px rgba(30, 144, 255, 0.25)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            color: lightPalette.text.primary,
          },
          '& .MuiFormHelperText-root': {
            color: lightPalette.text.secondary,
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: lightPalette.text.primary,
          borderRadius: 14,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
          '&:focus-visible': {
            boxShadow: '0 0 0 3px rgba(30, 144, 255, 0.25)',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1E293B',
          color: '#FFFFFF',
          fontWeight: 600,
          borderRadius: 12,
        },
        arrow: {
          color: '#1E293B',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        standardSuccess: {
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: lightPalette.text.primary,
        },
        standardError: {
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, rgba(0,0,0,0.04), rgba(0,0,0,0.1), rgba(0,0,0,0.04))',
          borderRadius: 16,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(248, 250, 252, 0.8)',
          backdropFilter: 'blur(8px)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          border: '1px solid rgba(0, 0, 0, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          color: lightPalette.text.primary,
        },
      },
    },
  },
};

const lightTheme = createTheme(lightThemeOptions);

export default lightTheme;
