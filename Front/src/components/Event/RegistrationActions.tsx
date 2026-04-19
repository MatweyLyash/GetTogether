import { Button, VStack } from '@chakra-ui/react';
import { FaQrcode } from 'react-icons/fa';

interface RegistrationActionsProps {
  isOrganizer: boolean;
  isRegistered: boolean;
  isArchived: boolean;
  registrationClosed: boolean;
  registrationStatus: number | null;
  qrCodeUsed: boolean;
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
  qrCodeUsed,
  onEdit,
  onRegister,
  onCancel,
  onGetQR,
}: RegistrationActionsProps) {
  if (isOrganizer) {
    return (
      <Button
        bg="#facc15"
        color="#422006"
        _hover={{ bg: '#eab308' }}
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
        bg="#facc15"
        color="#422006"
        _hover={{ bg: '#eab308' }}
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
        <Button bg="rgba(255,255,255,0.82)" color="#7c4a19" border="1px solid rgba(234, 179, 8, 0.16)" size="lg" w="100%" isDisabled>
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
            bg="#facc15"
            color="#422006"
            _hover={{ bg: '#eab308' }}
            size="lg"
            w="100%"
            onClick={onGetQR}
            isDisabled={qrCodeUsed}
          >
            {qrCodeUsed ? 'QR-код уже использован' : 'Получить QR-код'}
          </Button>
        )}

        {(registrationStatus === 1 || registrationStatus === null) && (
          <Button variant="outline" borderColor="rgba(180, 83, 9, 0.24)" color="#7c2d12" size="lg" w="100%" onClick={onCancel}>
            Отозвать заявку
          </Button>
        )}
      </VStack>
    );
  }

  return (
    <Button bg="rgba(255,255,255,0.82)" color="rgba(66, 32, 6, 0.56)" size="lg" w="100%" isDisabled>
      Мероприятие завершено
    </Button>
  );
}
