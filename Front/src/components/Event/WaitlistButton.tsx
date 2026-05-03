import { useState } from 'react';
import { Button, Icon, useDisclosure, useToast } from '@chakra-ui/react';
import { FaBell, FaBellSlash } from 'react-icons/fa';
import { addEventToWaitlist, removeEventFromWaitlist } from '../../api/api';
import { requestNotificationPermission, subscribeToPush } from '../../utils/pushNotifications';
import { NotificationMethodModal } from '../NotificationMethodModal/NotificationMethodModal';

interface WaitlistButtonProps {
  eventId: string;
  eventTitle: string;
  waitlistItem: { id: number; notification_method: 'telegram' | 'browser' } | null;
  onChange: (waitlistItem: { id: number; notification_method: 'telegram' | 'browser' } | null) => void;
}

export function WaitlistButton({ eventId, eventTitle, waitlistItem, onChange }: WaitlistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleToggleWaitlist = async () => {
    if (!waitlistItem) {
      onOpen();
      return;
    }

    setIsLoading(true);
    try {
      await removeEventFromWaitlist(waitlistItem.id);
      onChange(null);
      toast({
        title: 'Список ожидания обновлен',
        description: `Мероприятие "${eventTitle}" удалено из списка ожидания`,
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось удалить мероприятие из списка ожидания',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectMethod = async (method: 'telegram' | 'browser') => {
    setIsLoading(true);
    try {
      let pushSubscriptionSuccess = false;

      if (method === 'browser') {
        try {
          const permission = await requestNotificationPermission();
          if (permission !== 'granted') {
            throw new Error('Для получения уведомлений в браузере необходимо разрешить их в настройках браузера');
          }

          const pushSubscription = await subscribeToPush();
          pushSubscriptionSuccess = !!pushSubscription;
        } catch (pushError: any) {
          if (
            pushError?.message?.includes('SSL') ||
            pushError?.message?.includes('SSL_CERTIFICATE_ERROR') ||
            pushError?.message?.includes('certificate') ||
            pushError?.message?.includes('Service Worker')
          ) {
            pushSubscriptionSuccess = false;
          } else if (pushError?.message?.includes('AUTHORIZATION_ERROR')) {
            throw new Error('Ошибка авторизации. Пожалуйста, перезайдите в систему.');
          } else {
            throw pushError;
          }
        }
      }

      const waitlist = await addEventToWaitlist(eventId, method);
      onChange({ id: waitlist.id, notification_method: waitlist.notification_method });

      toast({
        title: 'Мероприятие добавлено в список ожидания',
        description:
          method === 'telegram'
            ? 'Вы получите уведомление через Telegram, когда появится место'
            : pushSubscriptionSuccess
            ? 'Вы получите браузерное уведомление, когда появится место'
            : 'Запись создана, но браузерные push-уведомления могут быть недоступны в этой среде',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        bg={waitlistItem ? 'rgba(255,255,255,0.82)' : '#facc15'}
        color={waitlistItem ? '#7c2d12' : '#422006'}
        border={waitlistItem ? '1px solid rgba(180, 83, 9, 0.24)' : 'none'}
        _hover={waitlistItem ? { bg: '#fff7d6' } : { bg: '#eab308' }}
        size="lg"
        w="100%"
        leftIcon={<Icon as={waitlistItem ? FaBellSlash : FaBell} />}
        onClick={handleToggleWaitlist}
        isLoading={isLoading}
      >
        {waitlistItem ? 'Убрать мероприятие из списка ожидания' : 'Добавить мероприятие в список ожидания'}
      </Button>

      <NotificationMethodModal
        isOpen={isOpen}
        onClose={onClose}
        onSelectMethod={handleSelectMethod}
        subscriptionType="waitlist"
        targetName={eventTitle}
      />
    </>
  );
}
