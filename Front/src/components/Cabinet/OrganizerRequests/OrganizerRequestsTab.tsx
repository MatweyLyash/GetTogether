import { TabPanel, VStack, Heading, Text, Button } from '@chakra-ui/react';
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
        return 'yellow';
      case 2:
        return 'green';
      case 3:
        return 'red';
      default:
        return 'gray';
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
      <Heading size="lg">Мои созданные мероприятия</Heading>

      {requests.length === 0 ? (
        <VStack spacing="4" w="100%" align="stretch">
          <Text color="gray.600">Вы не являетесь организатором</Text>
          <Button
            bg="#2E4FD7"
            color="white"
            _hover={{ bg: '#1e3fa9' }}
            onClick={onCreateRequest}
            isLoading={isLoading}
            isDisabled={hasPendingRequest || !isTelegramLinked}
          >
            Запросить статус организатора
          </Button>
          {!isTelegramLinked && (
            <Text color="orange.500" fontSize="sm">
              Для запроса статуса организатора необходимо привязать Telegram
            </Text>
          )}
        </VStack>
      ) : (
        <VStack spacing="3" align="stretch">
          <Text fontSize="lg">
            Статус запроса:{' '}
            <Text as="span" color={`${getStatusColor(requests[0].status_id)}.500`} fontWeight="bold">
              {getStatusLabel(requests[0].status_id)}
            </Text>
          </Text>
          <Text fontSize="sm" color="gray.600">
            Дата подачи: {formatDate(requests[0].created_at || requests[0].createdAt || '')}
          </Text>
        </VStack>
      )}
    </VStack>
  );

  return withPanel ? <TabPanel px={0}>{content}</TabPanel> : content;
}
