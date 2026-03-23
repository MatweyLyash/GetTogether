import { Avatar, Box, HStack, Text, Button, Image, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Event } from '../../types/event';
import styles from './EventCard.module.scss';

interface EventCardProps {
  event: Event;
}

function EventCard({ event }: EventCardProps) {
  const organizerName = event.creator?.login || 'Организатор';
  const organizerInitials = organizerName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <Box className={styles.card} h="100%">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, type: 'spring', stiffness: 120, damping: 18 }}
      >
        <Box className={styles.cardInner}>
          <HStack className={styles.organizerRow} spacing={3}>
            <Avatar name={organizerName} bg="#facc15" color="#422006" size="sm">
              {organizerInitials}
            </Avatar>
            <Box minW={0}>
              <Text className={styles.organizerLabel}>Организатор</Text>
              <Text className={styles.organizerName}>{organizerName}</Text>
            </Box>
          </HStack>
          <Text className={styles.cardTitle} noOfLines={2}>{event.title}</Text>
          <Box className={styles.cardContent}>
            <VStack className={styles.cardTextContainer} align="stretch" spacing={2}>
              <Text className={styles.cardText}>
                Дата: {new Intl.DateTimeFormat('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(new Date(event.date))}
              </Text>
              <Text className={styles.cardText}>Категория: {event.category.category_name}</Text>
              <Text className={styles.cardText}>Цена: {event.price === 0 ? 'Бесплатно' : `${event.price} BYN`}</Text>
              <Text className={styles.cardText}>Свободные места: {event.capacity}</Text>
              <Text className={styles.cardText}>Локация: {event.location}</Text>
            </VStack>
            <Box className={styles.cardImageContainer}>
              <Image
                src={event.image || 'https://blog.eboost.com/wp-content/uploads/2016/11/background-of-people-smiling-4184.jpg'}
                alt={event.title}
                className={styles.cardImage}
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
            bg="#facc15"
            color="#422006"
            _hover={{ bg: '#eab308', transform: 'scale(1.04)' }}
            _active={{ bg: '#ca8a04' }}
            width="100%"
          >
            Подробнее
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
}

export default EventCard;