import { createTheme } from '@mui/material/styles';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0E7A3D', light: '#278249', dark: '#07572B', contrastText: '#FFFFFF' },
    secondary: { main: '#8B5B12', light: '#95681F', dark: '#68420A', contrastText: '#FFFFFF' },
    background: { default: '#F6F8F7', paper: '#FFFFFF' },
    text: { primary: '#102018', secondary: '#52675D' },
    divider: '#DDE5DF',
    success: { main: '#0E7A3D' },
    info: { main: '#245D83' },
    warning: { main: '#8B5B12' },
    error: { main: '#B42318' },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: { fontSize: 'clamp(2rem, 3.5vw, 3.25rem)', fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.035em' },
    h2: { fontSize: 'clamp(1.75rem, 2.8vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.025em' },
    h3: { fontSize: 'clamp(1.5rem, 2.3vw, 2rem)', fontWeight: 700, lineHeight: 1.25 },
    h4: { fontSize: '1.5rem', fontWeight: 700 },
    h5: { fontSize: '1.25rem', fontWeight: 700 },
    h6: { fontSize: '1.125rem', fontWeight: 600 },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: { styleOverrides: {
      body: { backgroundImage: 'none' },
      ':focus-visible': { outline: '3px solid #0E7A3D', outlineOffset: 3 },
    } },
    MuiAppBar: { styleOverrides: { root: { background: '#FFFFFF', color: '#102018', borderBottom: '1px solid #DDE5DF', boxShadow: 'none' } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: { styleOverrides: { root: {
      background: '#FFFFFF', border: '1px solid #DDE5DF', borderRadius: 12,
      boxShadow: '0 3px 12px rgba(16,32,24,0.035)',
    } } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { minHeight: 44, borderRadius: 8, padding: '10px 16px', lineHeight: 1.4, transition: 'background-color 160ms ease, border-color 160ms ease' },
        sizeSmall: { padding: '8px 12px' },
        outlined: { borderColor: '#B7C9BE' },
      },
    },
    MuiIconButton: { styleOverrides: { root: { minWidth: 44, minHeight: 44, borderRadius: 8 } } },
    MuiOutlinedInput: { styleOverrides: { root: { background: '#FFFFFF', borderRadius: 8 } } },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
    MuiDrawer: { styleOverrides: { paper: { background: '#FFFFFF', backgroundImage: 'none' } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: 16, background: '#FFFFFF' } } },
    MuiBackdrop: { styleOverrides: { root: { backgroundColor: 'rgba(16,32,24,0.35)' } } },
    MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: '#102018' } } },
  },
});

export default lightTheme;
