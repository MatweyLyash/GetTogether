import { Box, Text, Button, useBreakpointValue } from '@chakra-ui/react';
import { CabinetEventRegistration } from '../types';

interface EventRegistrationCardProps {
  registration: CabinetEventRegistration;
  type: 'future' | 'past';
  onNavigate: (eventId: string) => void;
  onSubmitReview?: (eventId: string) => void;
  hasReview?: boolean;
}

export function EventRegistrationCard({
  registration,
  type,
  onNavigate,
  onSubmitReview,
  hasReview,
}: EventRegistrationCardProps) {
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const event = registration.Event;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    if (!dateString || Number.isNaN(date.getTime())) {
      return 'Дата не указана';
    }

    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Box borderWidth="1px" borderRadius="md" p="4" className="card">
      <Text fontWeight="bold">{event.title}</Text>
      <Text>Дата: {formatDateTime(event.date)}</Text>
      <Text>Место: {event.location}</Text>
      {type === 'future' && (
        <Text>
          Статус:{' '}
          {registration.status_id === 1
            ? 'Ожидает'
            : registration.status_id === 2
              ? 'Подтверждено'
              : 'Отклонено'}
        </Text>
      )}
      <Button
        mt="2"
        size={buttonSize}
        colorScheme="teal"
        onClick={() => onNavigate(event.id)}
      >
        Перейти
      </Button>
      {type === 'past' && !registration.qr_code && (
        <Box mt="2">
          {hasReview ? (
            <Text color="green.500">Отзыв уже отправлен</Text>
          ) : (
            <Button
              mt="2"
              size={buttonSize}
              colorScheme="blue"
              onClick={() => onSubmitReview?.(registration.event_id)}
            >
              Оставить отзыв
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}
