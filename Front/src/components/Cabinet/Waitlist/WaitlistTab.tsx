import {
  Badge,
  Box,
  HStack,
  IconButton,
  Image,
  Stack,
  Text,
  Tooltip,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaEye, FaTrash } from 'react-icons/fa';
import { EventWaitlistItem } from '../../../api/api';

interface WaitlistTabProps {
  waitlist: EventWaitlistItem[];
  isLoading: boolean;
  onNavigate: (eventId: string) => void;
  onRemove: (waitlistId: number) => void;
}

export function WaitlistTab({ waitlist, isLoading, onNavigate, onRemove }: WaitlistTabProps) {
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Дата не указана';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Некорректная дата';
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

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

  if (waitlist.length === 0) {
    return <Text color="rgba(66, 32, 6, 0.64)">В списке ожидания пока нет мероприятий</Text>;
  }

  return (
    <VStack spacing="4" align="stretch" w="100%">
      {waitlist.map((item) => {
        const event = item.event;
        if (!event) return null;
        const imageSrc = toImageSrc(event.image);

        return (
          <Box
            key={item.id}
            borderWidth="1px"
            borderRadius="2xl"
            p="5"
            bg="rgba(255,255,255,0.9)"
            boxShadow="0 18px 34px rgba(140, 91, 14, 0.08)"
            borderColor="rgba(234, 179, 8, 0.16)"
          >
            <Stack direction={{ base: 'column', md: 'row' }} spacing="4" align="stretch">
              {imageSrc && (
                <Box flexShrink={0} w={{ base: '100%', md: '220px' }} h={{ base: '180px', md: '160px' }} overflow="hidden" borderRadius="2xl" transform="rotate(-1.2deg)">
                  <Image src={imageSrc} alt={event.title} w="100%" h="100%" objectFit="cover" />
                </Box>
              )}
              <VStack align="stretch" spacing="3" flex="1">
                <Box>
                  <HStack spacing="2" flexWrap="wrap" mb="2">
                    <Text fontWeight="800" fontSize="xl" fontFamily="Outfit, sans-serif" color="#422006">{event.title}</Text>
                    <Badge bg="#fff7d6" color="#422006" borderRadius="full" px={3} py={1}>{event.category?.category_name || 'Категория'}</Badge>
                  </HStack>
                  <Text color="rgba(66, 32, 6, 0.74)">Дата: {formatDate(event.date)}</Text>
                  <Text color="rgba(66, 32, 6, 0.74)">Место: {event.location}</Text>
                  <Text color="rgba(66, 32, 6, 0.74)">Мест: {event.capacity}</Text>
                </Box>

                <Stack direction={{ base: 'column', md: 'row' }} spacing="2" flexWrap="wrap">
                  <Tooltip label="Подробнее">
                    <IconButton aria-label="Подробнее" icon={<FaEye />} size={buttonSize} bg="#facc15" color="#422006" _hover={{ bg: '#eab308' }} onClick={() => onNavigate(String(event.id))} isDisabled={isLoading} />
                  </Tooltip>
                  <Tooltip label="Удалить мероприятие из списка ожидания">
                    <IconButton aria-label="Удалить мероприятие из списка ожидания" icon={<FaTrash />} size={buttonSize} variant="outline" borderColor="rgba(180, 83, 9, 0.24)" color="#7c2d12" onClick={() => onRemove(item.id)} isDisabled={isLoading} />
                  </Tooltip>
                </Stack>
              </VStack>
            </Stack>
          </Box>
        );
      })}
    </VStack>
  );
}
