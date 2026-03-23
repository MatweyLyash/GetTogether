import { VStack, Text, useBreakpointValue } from '@chakra-ui/react';
import { EventRegistrationCard } from './EventRegistrationCard';
import { CabinetEventRegistration } from '../types';

interface FutureEventsListProps {
  registrations: CabinetEventRegistration[];
  onNavigate: (eventId: string) => void;
}

export function FutureEventsList({ registrations, onNavigate }: FutureEventsListProps) {
  const fontSizeText = useBreakpointValue({ base: 'md', md: 'lg' });

  const isValidDate = (dateString: string) => {
    const date = new Date(dateString);
    return !Number.isNaN(date.getTime());
  };

  const futureEvents = registrations.filter((reg) => {
    if (!reg.Event) return false;
    const isScanned = reg.status_id === 2 && !reg.qr_code;
    const isFutureDate = isValidDate(reg.Event.date) && new Date(reg.Event.date) > new Date();
    return isFutureDate && !isScanned;
  });

  if (futureEvents.length === 0) {
    return <Text fontSize={fontSizeText} color="gray.600">Нет предстоящих мероприятий</Text>;
  }

  return (
    <VStack spacing="4" align="stretch">
      {futureEvents.map((reg) => (
        <EventRegistrationCard
          key={reg.id}
          registration={reg}
          type="future"
          onNavigate={onNavigate}
        />
      ))}
    </VStack>
  );
}
