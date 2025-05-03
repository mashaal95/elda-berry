// theme.ts
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#ff4511',        // your orange, used sparingly
    },
    secondary: {
      main: '#56565a',        // cool gray 11
    },
    text: {
      primary: '#000000',     // process black
      secondary: '#56565a',   // cool gray
    },
    grey: {
      100: '#f5f5f5',         // light background
      300: '#bcbba0',         // cool gray 4 approx
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: { fontWeight: 600 },
    subtitle2: { color: '#56565a' },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      defaultProps: { elevation: 3 },
      styleOverrides: { root: { overflow: 'visible' } }
    },
    MuiSlider: {
      styleOverrides: {
        thumb: {
          width: 16, height: 16,
          backgroundColor: '#ff4511',
        },
        track: {
          height: 6,
          backgroundColor: '#ff4511',
        },
      }
    },
    MuiButton: {
      variants: [{
        props: { variant: 'contained' },
        style: {
          backgroundColor: '#ff4511',
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 0',
        }
      }]
    }
  }
})
