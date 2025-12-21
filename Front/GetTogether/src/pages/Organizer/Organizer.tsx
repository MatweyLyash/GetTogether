import { Box, Text } from '@chakra-ui/react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './Organizer.module.scss';

function Organizer() {
  return (
    <Box className={styles.container}>
      <Header />
      <Box p="2rem">
        <Text fontSize="2xl">Страница организатора</Text>
      </Box>
      <Footer />
    </Box>
  );
}

export default Organizer;