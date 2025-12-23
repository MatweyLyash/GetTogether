import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  fonts: {
    body: 'Inter, sans-serif',
    heading: 'Inter, sans-serif',
  },
  colors: {
    primary: '#2E4FD7',
    secondary: '#E7EBFC',
    background: '#FEFEFE',
    footer: '#052825',
  },
  components: {
    Button: {
      variants: {
        footer: {
          bg: '#052825',
          color: 'white',
          _hover: {
            bg: '#08433f',
          },
          _active: {
            bg: '#0a504a',
          },
        },
      },
    },
  },
});

export default theme;