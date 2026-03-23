import { SimpleGrid } from '@chakra-ui/react';
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserFriends,
  FaMoneyBill,
} from 'react-icons/fa';
import { EventStatItem } from './EventStatItem';

interface EventStatsData {
  date: string;
  location: string;
  capacity: number;
  price: number | string;
}

/**
 * Event statistics grid (date, location, capacity, price)
 */
export function EventStats({ date, location, capacity, price }: EventStatsData) {
  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  const displayPrice = typeof price === 'string' ? price : `${price} BYN`;

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
      <EventStatItem
        icon={<FaCalendarAlt color="#eab308" />}
        label="Дата и время"
        value={formattedDate}
      />
      <EventStatItem
        icon={<FaMapMarkerAlt color="#eab308" />}
        label="Место проведения"
        value={location}
      />
      <EventStatItem
        icon={<FaUserFriends color="#eab308" />}
        label="Свободных мест"
        value={`${capacity} мест`}
      />
      <EventStatItem
        icon={<FaMoneyBill color="#eab308" />}
        label="Стоимость"
        value={numericPrice > 0 ? displayPrice : 'Бесплатно'}
      />
    </SimpleGrid>
  );
}
