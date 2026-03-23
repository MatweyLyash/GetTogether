import { TabPanel, VStack, Heading, Table, Thead, Tbody, Tr, Th, Td, HStack, Button, Badge, useBreakpointValue } from '@chakra-ui/react';

interface OrganizerRequest {
  id: string;
  user_id: string;
  status_id: number;
  user?: {
    id: string;
    login: string;
    telegram: string | null;
  };
}

interface OrganizerRequestsTabProps {
  requests: OrganizerRequest[];
  isLoading: boolean;
  onResponse: (requestId: string, approve: boolean) => Promise<void>;
}

export function OrganizerRequestsTab({ requests, isLoading, onResponse }: OrganizerRequestsTabProps) {
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });

  const getStatusBadge = (statusId: number) => {
    const statusMap: Record<number, { label: string; color: string }> = {
      1: { label: 'На рассмотрении', color: 'yellow' },
      2: { label: 'Одобрено', color: 'green' },
      3: { label: 'Отклонено', color: 'red' },
    };
    const status = statusMap[statusId] || { label: 'Неизвестно', color: 'gray' };
    return <Badge colorScheme={status.color}>{status.label}</Badge>;
  };

  const handleResponse = async (requestId: string, approve: boolean) => {
    await onResponse(requestId, approve);
  };

  return (
    <TabPanel className="tabPanel">
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Запросы на статус организатора</Heading>

        {requests.length === 0 ? (
          <Heading size="md" color="gray.600" textAlign="center" py={8}>
            Нет запросов
          </Heading>
        ) : (
          <div className="tableContainer">
            <Table variant="simple" size={buttonSize}>
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Пользователь</Th>
                  <Th>Telegram</Th>
                  <Th>Статус</Th>
                  <Th>Действия</Th>
                </Tr>
              </Thead>
              <Tbody>
                {requests.map((request) => (
                  <Tr key={request.id}>
                    <Td>{request.id}</Td>
                    <Td fontWeight="medium">{request.user?.login || 'N/A'}</Td>
                    <Td>{request.user?.telegram || '—'}</Td>
                    <Td>{getStatusBadge(request.status_id)}</Td>
                    <Td>
                      {request.status_id === 1 && (
                        <HStack spacing={2}>
                          <Button
                            size={buttonSize}
                            colorScheme="green"
                            onClick={() => handleResponse(request.id, true)}
                            isLoading={isLoading}
                          >
                            Одобрить
                          </Button>
                          <Button
                            size={buttonSize}
                            colorScheme="red"
                            onClick={() => handleResponse(request.id, false)}
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
          </div>
        )}
      </VStack>
    </TabPanel>
  );
}
