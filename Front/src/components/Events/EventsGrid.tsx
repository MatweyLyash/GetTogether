import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SimpleGrid, Spinner, Text, VStack, Flex } from '@chakra-ui/react';
import { Event } from '../../types/event';
import EventCard from '../EventCard/EventCard';

interface EventsGridProps {
  events: Event[];
  isLoading: boolean;
  columns?: {
    base: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

const INSERT_INTERVAL = 22;

function buildDisplayList(events: Event[]): Array<Event & { _insertKey?: string }> {
  const promoted = events.filter(
    (e) => e.promotion && (e.promotion.type === 'repeat' || e.promotion.type === 'premium')
  );
  if (promoted.length === 0) return events;

  const result: Array<Event & { _insertKey?: string }> = [];
  let insertCounter = 0;

  for (let i = 0; i < events.length; i++) {
    result.push(events[i]);
    if ((i + 1) % INSERT_INTERVAL === 0 && insertCounter < promoted.length) {
      const promo = promoted[insertCounter];
      result.push({ ...promo, _insertKey: `insert-${promo.id}-${insertCounter}` });
      insertCounter++;
    }
  }

  while (insertCounter < promoted.length) {
    result.push({ ...promoted[insertCounter], _insertKey: `insert-${promoted[insertCounter].id}-${insertCounter}` });
    insertCounter++;
  }

  return result;
}

export function EventsGrid({ events, isLoading, columns = { base: 1, md: 2 } }: EventsGridProps) {
  const displayList = useMemo(() => buildDisplayList(events), [events]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" py="4rem" minH="300px">
        <VStack spacing={4}>
          <Spinner size="xl" color="#eab308" thickness="4px" />
          <Text color="rgba(66, 32, 6, 0.64)">Загрузка мероприятий...</Text>
        </VStack>
      </Flex>
    );
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <SimpleGrid columns={columns} spacing="1.5rem">
      {displayList.map((event, index) => (
        <motion.div
          key={event._insertKey || event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          style={{ height: '100%', display: 'flex' }}
        >
          <EventCard event={event} />
        </motion.div>
      ))}
    </SimpleGrid>
  );
}
