import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        bg: '#fffdf5',
        color: '#422006',
      },
      body: {
        fontFeatureSettings: '"liga" 1, "kern" 1',
      },
    },
  },
  fonts: {
    body: 'Inter, sans-serif',
    heading: 'Outfit, sans-serif',
  },
  colors: {
    primary: '#facc15',
    secondary: '#fef3c7',
    background: '#fffdf5',
    footer: '#422006',
    brand: {
      50: '#fffdf1',
      100: '#fef9c3',
      200: '#fef08a',
      300: '#fde047',
      400: '#facc15',
      500: '#eab308',
      600: '#ca8a04',
      700: '#a16207',
      800: '#854d0e',
      900: '#713f12',
    },
    ink: {
      900: '#422006',
      700: '#7c4a19',
      500: '#9a6b35',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 700,
        borderRadius: '999px',
      },
      variants: {
        solid: {
          bg: '#facc15',
          color: '#422006',
          boxShadow: '0 14px 30px rgba(140, 91, 14, 0.14)',
          _hover: {
            bg: '#eab308',
            transform: 'scale(1.03)',
          },
          _active: {
            bg: '#ca8a04',
            transform: 'scale(0.99)',
          },
        },
        outline: {
          borderColor: 'rgba(234, 179, 8, 0.25)',
          color: '#422006',
          bg: 'rgba(255,255,255,0.72)',
          _hover: {
            bg: '#fff7d6',
            borderColor: '#eab308',
          },
        },
        footer: {
          bg: '#422006',
          color: '#fffdf5',
          _hover: {
            bg: '#6b3e12',
          },
          _active: {
            bg: '#7c4a19',
          },
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderRadius: '1.2rem',
            bg: 'rgba(255,255,255,0.9)',
            borderColor: 'rgba(234, 179, 8, 0.18)',
            _hover: { borderColor: '#eab308' },
            _focusVisible: {
              borderColor: '#eab308',
              boxShadow: '0 0 0 3px rgba(250, 204, 21, 0.25)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Select: {
      variants: {
        outline: {
          field: {
            borderRadius: '1.2rem',
            bg: 'rgba(255,255,255,0.9)',
            borderColor: 'rgba(234, 179, 8, 0.18)',
            _hover: { borderColor: '#eab308' },
            _focusVisible: {
              borderColor: '#eab308',
              boxShadow: '0 0 0 3px rgba(250, 204, 21, 0.25)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Tabs: {
      variants: {
        'soft-rounded': {
          tab: {
            borderRadius: '999px',
            fontWeight: 600,
            color: '#7c4a19',
            bg: 'rgba(255,255,255,0.56)',
            _selected: {
              bg: '#facc15',
              color: '#422006',
            },
          },
        },
      },
    },
  },
});

export default theme;