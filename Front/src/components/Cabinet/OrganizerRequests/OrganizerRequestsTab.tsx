import { Badge, Box, Button, TabPanel, VStack, Heading, Text } from '@chakra-ui/react';
import { CabinetOrganizerRequest } from '../types';

interface OrganizerRequestsTabProps {
  requests: CabinetOrganizerRequest[];
  onCreateRequest: () => Promise<void>;
  isLoading: boolean;
  hasPendingRequest: boolean;
  isTelegramLinked?: boolean;
  withPanel?: boolean;
}

export function OrganizerRequestsTab({
  requests,
  onCreateRequest,
  isLoading,
  hasPendingRequest,
  isTelegramLinked = true,
  withPanel = true,
}: OrganizerRequestsTabProps) {
  const getStatusLabel = (statusId: number) => {
    switch (statusId) {
      case 1:
        return 'На рассмотрении';
      case 2:
        return 'Одобрено';
      case 3:
        return 'Отклонено';
      default:
        return 'Неизвестно';
    }
  };

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1:
        return { bg: '#fff7d6', color: '#422006' };
      case 2:
        return { bg: '#ecfccb', color: '#3f6212' };
      case 3:
        return { bg: '#fee2e2', color: '#991b1b' };
      default:
        return { bg: 'rgba(255,255,255,0.78)', color: 'rgba(66, 32, 6, 0.68)' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (!dateString || Number.isNaN(date.getTime())) {
      return 'Дата не указана';
    }

    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const content = (
    <VStack spacing="6" align="stretch" w="100%">
      <Heading size="lg" color="#422006" letterSpacing="-0.04em">Мои созданные мероприятия</Heading>

      {requests.length === 0 ? (
        <VStack spacing="4" w="100%" align="stretch">
          <Box bg="rgba(255,255,255,0.82)" p="1.5rem" borderRadius="2rem" border="1px solid rgba(234, 179, 8, 0.16)" boxShadow="0 18px 34px rgba(140, 91, 14, 0.08)">
            <Text color="rgba(66, 32, 6, 0.7)" mb="1rem">Вы пока не являетесь организатором</Text>
          <Button
            bg="#facc15"
            color="#422006"
            _hover={{ bg: '#eab308' }}
            _active={{ bg: '#ca8a04' }}
            onClick={onCreateRequest}
            isLoading={isLoading}
            isDisabled={hasPendingRequest || !isTelegramLinked}
          >
            Запросить статус организатора
          </Button>
          {!isTelegramLinked && (
            <Text color="#b45309" fontSize="sm" mt="0.85rem">
              Для запроса статуса организатора необходимо привязать Telegram
            </Text>
          )}
          </Box>
        </VStack>
      ) : (
        <VStack spacing="3" align="stretch" bg="rgba(255,255,255,0.82)" p="1.5rem" borderRadius="2rem" border="1px solid rgba(234, 179, 8, 0.16)" boxShadow="0 18px 34px rgba(140, 91, 14, 0.08)">
          <Text fontSize="lg">
            Статус запроса:{' '}
            <Badge as="span" borderRadius="full" px={3} py={1} fontSize="0.9em" verticalAlign="middle" {...getStatusColor(requests[0].status_id)}>
              {getStatusLabel(requests[0].status_id)}
            </Badge>
          </Text>
          <Text fontSize="sm" color="rgba(66, 32, 6, 0.64)">
            Дата подачи: {formatDate(requests[0].created_at || requests[0].createdAt || '')}
          </Text>
        </VStack>
      )}
    </VStack>
  );

  return withPanel ? <TabPanel px={0}>{content}</TabPanel> : content;
}
