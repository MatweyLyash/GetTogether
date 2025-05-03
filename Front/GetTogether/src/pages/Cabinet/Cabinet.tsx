import { Box, Text } from '@chakra-ui/react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './Cabinet.module.scss';

function Cabinet() {
  return (
    <Box className={styles.container}>
      <Header />
      <Box p="2rem">
        <Text fontSize="2xl">Личный кабинет</Text>
      </Box>
      <Footer />
    </Box>
  );
}

export default Cabinet;