import { Box, Text, Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Event } from '../../types/event';
import styles from './EventCard.module.scss';

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  return (
    <Box className={styles.card}>
    <motion.div
     
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Text className={styles.cardTitle}>{event.title}</Text>
      <Box className={styles.cardContent}>
        <Box className={styles.cardTextContainer}>
          <Text className={styles.cardText}>
            Дата: {new Date(event.date).toLocaleDateString()}
          </Text>
          <Text className={styles.cardText}>Категория: {event.category.category_name}</Text>
          <Text className={styles.cardText}>Цена: {event.price} ₽</Text>
          <Text className={styles.cardText}>Свободные места: {event.free_slots}</Text>
          <Text className={styles.cardText}>Адрес: {event.address}</Text>
        </Box>
        <Box className={styles.cardImageContainer}>
          <img
            src={'https://blog.eboost.com/wp-content/uploads/2016/11/background-of-people-smiling-4184.jpg'}
            alt={event.title}
            className={styles.cardImage}
          />
        </Box>
      </Box>
      <Button
        as={Link}
        to={`/events/${event.id}`}
        className={styles.cardButton}
        bg="#2E4FD7"
        color="white"
        _hover={{ bg: '#1e3fa9' }}
        _active={{ bg: '#15307a' }}
      >
        Подробнее
      </Button>
    </motion.div>
    </Box>
  );
}

export default EventCard;