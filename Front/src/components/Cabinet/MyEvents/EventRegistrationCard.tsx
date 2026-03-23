import {
  Badge,
  Box,
  Button,
  HStack,
  Image,
  Stack,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
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

  const toImageSrc = (image: unknown): string | null => {
    if (!image) return null;
    if (typeof image === 'string') {
      if (image.startsWith('data:') || image.startsWith('http')) return image;
      return `data:image/png;base64,${image}`;
    }

    const bytes = (image as { data?: number[] }).data || image;
    if (Array.isArray(bytes)) {
      const binary = Uint8Array.from(bytes).reduce((acc, value) => acc + String.fromCharCode(value), '');
      return `data:image/png;base64,${btoa(binary)}`;
    }

    return null;
  };

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

  const statusLabel =
    registration.status_id === 1
      ? 'Ожидает'
      : registration.status_id === 2
        ? 'Подтверждено'
        : 'Отклонено';

  const statusStyles =
    registration.status_id === 2
      ? { bg: '#ecfccb', color: '#3f6212' }
      : registration.status_id === 3
        ? { bg: '#fee2e2', color: '#991b1b' }
        : { bg: '#fff7d6', color: '#422006' };

  const imageSrc = toImageSrc(event.image);

  return (
    <Box
      borderWidth="1px"
      borderRadius="2xl"
      p="5"
      bg="rgba(255,255,255,0.9)"
      boxShadow="0 18px 34px rgba(140, 91, 14, 0.08)"
      borderColor="rgba(234, 179, 8, 0.16)"
    >
      <Stack direction={{ base: 'column', md: 'row' }} spacing="4" align="stretch">
        {imageSrc && (
          <Box
            flexShrink={0}
            w={{ base: '100%', md: '220px' }}
            h={{ base: '180px', md: '160px' }}
            overflow="hidden"
            borderRadius="2xl"
            transform="rotate(-1.2deg)"
          >
            <Image src={imageSrc} alt={event.title} w="100%" h="100%" objectFit="cover" />
          </Box>
        )}

        <VStack align="stretch" spacing="3" flex="1">
          <Box>
            <HStack spacing="2" flexWrap="wrap" mb="2">
              <Text fontWeight="800" fontSize="xl" fontFamily="Outfit, sans-serif" color="#422006">
                {event.title}
              </Text>
              <Badge bg="#fff7d6" color="#422006" borderRadius="full" px={3} py={1}>
                {event.category?.category_name || 'Без категории'}
              </Badge>
              {type === 'future' && (
                <Badge borderRadius="full" px={3} py={1} {...statusStyles}>
                  {statusLabel}
                </Badge>
              )}
              {type === 'past' && (
                <Badge borderRadius="full" px={3} py={1} bg="#f3e8d2" color="#7c2d12">
                  Прошедшее
                </Badge>
              )}
            </HStack>
            <Text color="rgba(66, 32, 6, 0.74)">Дата: {formatDateTime(event.date)}</Text>
            <Text color="rgba(66, 32, 6, 0.74)">Место: {event.location}</Text>
            <Text color="rgba(66, 32, 6, 0.74)">Мест: {event.capacity}</Text>
          </Box>

          <Stack direction={{ base: 'column', md: 'row' }} spacing="2" flexWrap="wrap">
            <Button
              size={buttonSize}
              bg="#facc15"
              color="#422006"
              _hover={{ bg: '#eab308' }}
              onClick={() => onNavigate(event.id)}
            >
              Перейти
            </Button>

            {type === 'past' && !registration.qr_code && (
              hasReview ? (
                <Badge alignSelf="center" borderRadius="full" px={3} py={2} bg="#fff7d6" color="#a16207">
                  Отзыв уже отправлен
                </Badge>
              ) : (
                <Button
                  size={buttonSize}
                  variant="outline"
                  borderColor="rgba(180, 83, 9, 0.24)"
                  color="#7c2d12"
                  onClick={() => onSubmitReview?.(registration.event_id)}
                >
                  Оставить отзыв
                </Button>
              )
            )}
          </Stack>
        </VStack>
      </Stack>
    </Box>
  );
}
