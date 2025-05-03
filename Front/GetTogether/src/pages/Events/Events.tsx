import { Box, Text } from '@chakra-ui/react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './Events.module.scss';

function Events() {
  return (
    <Box className={styles.container}>
      <Header />
      <Box p="2rem">
        <Text fontSize="2xl">Список мероприятий</Text>
      </Box>
      <Footer />
    </Box>
  );
}

export default Events;