import { Badge } from '@chakra-ui/react';

interface RegistrationStatusBadgeProps {
  statusId: number | null;
}

/**
 * Registration status badge
 */
export function RegistrationStatusBadge({ statusId }: RegistrationStatusBadgeProps) {
  const statusLabels: Record<number, string> = {
    1: 'Ожидает подтверждения',
    2: 'Подтверждено',
    3: 'Отклонено',
    4: 'Отозвано',
  };

  const colorSchemes: Record<number, string> = {
    1: 'yellow',
    2: 'green',
    3: 'red',
    4: 'gray',
  };

  const status = statusId || 1;

  return (
    <Badge colorScheme={colorSchemes[status] || 'gray'} fontSize="md" p={2}>
      {statusLabels[status] || 'Неизвестный статус'}
    </Badge>
  );
}
