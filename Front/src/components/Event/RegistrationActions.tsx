import { Button, VStack } from '@chakra-ui/react';
import { FaQrcode } from 'react-icons/fa';

interface RegistrationActionsProps {
  isOrganizer: boolean;
  isRegistered: boolean;
  isArchived: boolean;
  registrationClosed: boolean;
  registrationStatus: number | null;
  onEdit: () => void;
  onRegister: () => void;
  onCancel: () => void;
  onGetQR: () => void;
}

/**
 * Registration action buttons based on user state
 */
export function RegistrationActions({
  isOrganizer,
  isRegistered,
  isArchived,
  registrationClosed,
  registrationStatus,
  onEdit,
  onRegister,
  onCancel,
  onGetQR,
}: RegistrationActionsProps) {
  if (isOrganizer) {
    return (
      <Button
        colorScheme="teal"
        size="lg"
        w="100%"
        onClick={onEdit}
        isDisabled={isArchived}
      >
        {isArchived ? 'Редактирование недоступно для архива' : 'Редактировать'}
      </Button>
    );
  }

  if (!isRegistered && !isArchived) {
    return (
      <Button
        colorScheme="blue"
        size="lg"
        w="100%"
        isDisabled={registrationClosed}
        onClick={onRegister}
      >
        {registrationClosed ? 'Места закончились' : 'Отправить заявку'}
      </Button>
    );
  }

  if (isRegistered && !isArchived) {
    return (
      <VStack spacing={4} w="100%">
        <Button colorScheme="green" size="lg" w="100%" isDisabled>
          {registrationStatus === 2
            ? 'Ваша заявка подтверждена'
            : registrationStatus === 3
            ? 'Заявка отклонена'
            : registrationStatus === 4
            ? 'Заявка отозвана'
            : 'Ожидайте ответа от организатора'}
        </Button>

        {registrationStatus === 2 && (
          <Button
            leftIcon={<FaQrcode />}
            colorScheme="purple"
            size="lg"
            w="100%"
            onClick={onGetQR}
          >
            Получить QR-код
          </Button>
        )}

        {(registrationStatus === 1 || registrationStatus === null) && (
          <Button colorScheme="red" size="lg" w="100%" onClick={onCancel}>
            Отозвать заявку
          </Button>
        )}
      </VStack>
    );
  }

  return (
    <Button colorScheme="gray" size="lg" w="100%" isDisabled>
      Мероприятие завершено
    </Button>
  );
}
