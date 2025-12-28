import { Box, Text, Button, Image, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Event } from '../../types/event';
import styles from './EventCard.module.scss';

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  return (
    <Box className={styles.card} h="100%">
    <motion.div
     
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Text className={styles.cardTitle} noOfLines={2}>{event.title}</Text>
      <Box className={styles.cardContent}>
        <VStack className={styles.cardTextContainer} align="stretch" spacing={2}>
          <Text className={styles.cardText} noOfLines={1}>
            Дата: {new Intl.DateTimeFormat('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }).format(new Date(event.date))}
          </Text>
          <Text className={styles.cardText} noOfLines={1}>Категория: {event.category.category_name}</Text>
          <Text className={styles.cardText} noOfLines={1}>Цена: {event.price === 0 ? 'Бесплатно' : `${event.price} BYN`}</Text>
          <Text className={styles.cardText} noOfLines={1}>Свободные места: {event.capacity}</Text>
          <Text className={styles.cardText} noOfLines={1}>Локация: {event.location}</Text>
        </VStack>
        <Box className={styles.cardImageContainer}>
          <Image
            src={event.image || 'https://blog.eboost.com/wp-content/uploads/2016/11/background-of-people-smiling-4184.jpg'}
            alt={event.title}
            borderRadius="8px"
            width="100%"
            height="180px"
            objectFit="cover"
            loading="lazy"
          />
        </Box>
      </Box>
      <Button
        as={Link}
        to={`/event/${event.id}`}
        className={styles.cardButton}
        bg="#2E4FD7"
        color="white"
        _hover={{ bg: '#1e3fa9' }}
        _active={{ bg: '#15307a' }}
        width="100%"
      >
        Подробнее
      </Button>
    </motion.div>
    </Box>
  );
}

export default EventCard;