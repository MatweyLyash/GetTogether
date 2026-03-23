import { motion } from 'framer-motion';
import { SimpleGrid, Spinner, Text, VStack, Flex } from '@chakra-ui/react';
import { Event } from '../../types/event';
import EventCard from '../EventCard/EventCard';

interface EventsGridProps {
  events: Event[];
  isLoading: boolean;
  columns?: {
    base: number;
    lg?: number;
  };
}

/**
 * Grid of event cards with loading state
 */
export function EventsGrid({ events, isLoading, columns = { base: 1, lg: 2 } }: EventsGridProps) {
  if (isLoading) {
    return (
      <Flex justify="center" align="center" py="4rem" minH="300px">
        <VStack spacing={4}>
          <Spinner size="xl" color="#2E4FD7" thickness="4px" />
          <Text color="gray.600">Загрузка мероприятий...</Text>
        </VStack>
      </Flex>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <SimpleGrid columns={columns} spacing="1.5rem">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <EventCard event={event} />
        </motion.div>
      ))}
    </SimpleGrid>
  );
}
