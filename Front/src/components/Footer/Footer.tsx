import { Box, Text } from '@chakra-ui/react';
import styles from './Footer.module.scss';

function Footer() {
  return (
    <Box as="footer" className={styles.footer}>
      <Text className={styles.title}>GetTogether</Text>
      <Text className={styles.meta}>© 2025 GetTogether · Связь: matwey.lyashonok@gmail.com</Text>
    </Box>
  );
}

export default Footer;