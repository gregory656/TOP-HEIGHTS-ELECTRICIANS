import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useResolvedTheme } from './context/ThemeContextData';
import App from './App';
export default function Root() {
  const theme = useResolvedTheme();
  return <MuiThemeProvider theme={theme}><CssBaseline /><App /></MuiThemeProvider>;
}
