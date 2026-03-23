import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  Badge,
  Text,
  Box,
} from '@chakra-ui/react';
import { CabinetEventRequest } from '../types';

interface EventRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
  requests: CabinetEventRequest[];
  onResponse: (eventId: string, userId: string, statusId: number) => void;
  isLoading: boolean;
}

export function EventRequestsModal({
  isOpen,
  onClose,
  eventId,
  requests,
  onResponse,
  isLoading,
}: EventRequestsModalProps) {
  const handleResponse = (userId: string, statusId: number) => {
    if (eventId) {
      onResponse(eventId, userId, statusId);
    }
  };

  const getStatusBadge = (statusId: number) => {
    const statusMap: Record<number, { label: string; color: string }> = {
      1: { label: 'Ожидает', color: 'yellow' },
      2: { label: 'Подтверждено', color: 'green' },
      3: { label: 'Отклонено', color: 'red' },
    };
    const status = statusMap[statusId] || { label: 'Неизвестно', color: 'gray' };
    return (
      <Badge colorScheme={status.color}>{status.label}</Badge>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxW="95vw">
        <ModalHeader>Заявки на мероприятие</ModalHeader>
        <ModalCloseButton />
        <ModalBody maxH="70vh" overflowY="auto">
          {requests.length === 0 ? (
            <Text color="gray.600" textAlign="center" py={8}>
              Пока нет заявок
            </Text>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" minWidth="760px">
                <Thead>
                  <Tr>
                    <Th>Пользователь</Th>
                    <Th>Telegram</Th>
                    <Th>Статус</Th>
                    <Th>Действия</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {requests.map((request) => (
                    <Tr key={request.id}>
                      <Td>{request.user.login}</Td>
                      <Td>{request.user.telegram || 'Не указан'}</Td>
                      <Td>{getStatusBadge(request.status_id)}</Td>
                      <Td>
                        {request.status_id === 1 && (
                          <HStack spacing={2} align="stretch">
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() => handleResponse(request.user_id, 2)}
                              isLoading={isLoading}
                            >
                              Одобрить
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleResponse(request.user_id, 3)}
                              isLoading={isLoading}
                            >
                              Отклонить
                            </Button>
                          </HStack>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Закрыть</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
