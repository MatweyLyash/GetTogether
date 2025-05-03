import { Box, Text } from '@chakra-ui/react';
import styles from './Footer.module.scss';

function Footer() {
  return (
    <Box as="footer" className={styles.footer}>
      <Text>© 2025 GetTogether</Text>
    </Box>
  );
}

export default Footer;