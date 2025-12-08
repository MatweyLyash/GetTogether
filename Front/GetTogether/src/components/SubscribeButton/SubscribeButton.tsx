import { useState, useEffect } from 'react';
import { Button, useToast, Icon, useDisclosure } from '@chakra-ui/react';
import { FaBell, FaBellSlash } from 'react-icons/fa';
import { createSubscription, deleteSubscription, getSubscriptions, EventSubscription } from '../../api/api';
import { requestNotificationPermission, subscribeToPush, unsubscribeFromPush } from '../../utils/pushNotifications';
import { NotificationMethodModal } from '../NotificationMethodModal/NotificationMethodModal';
import { useAuth } from '../../AuthContext/AuthContext';

interface SubscribeButtonProps {
    subscriptionType: 'organizer' | 'category';
    targetId: number;
    targetName: string;
    size?: string;
    variant?: string;
    isCompact?: boolean;
}

export function SubscribeButton({
    subscriptionType,
    targetId,
    targetName,
    size = 'md',
    variant = 'outline',
    isCompact = false
}: SubscribeButtonProps) {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user } = useAuth();
    const hasTelegram = !!user?.telegram;

    // Проверяем существующую подписку
    useEffect(() => {
        const checkSubscription = async () => {
            try {
                const subscriptions = await getSubscriptions();
                const existing = subscriptions.find(
                    (sub: EventSubscription) => sub.subscription_type === subscriptionType && sub.target_id === targetId
                );
                if (existing) {
                    setIsSubscribed(true);
                    setSubscriptionId(existing.id);
                }
            } catch (error) {
                console.error('Error checking subscription:', error);
            } finally {
                setIsChecking(false);
            }
        };
        checkSubscription();
    }, [subscriptionType, targetId]);

    const handleToggleSubscription = async () => {
        if (isSubscribed && subscriptionId) {
            // Отписаться
            setIsLoading(true);
            try {
                await deleteSubscription(subscriptionId);
                setIsSubscribed(false);
                setSubscriptionId(null);
                toast({
                    title: 'Подписка отменена',
                    description: `Вы отписались от ${subscriptionType === 'organizer' ? 'организатора' : 'категории'} "${targetName}"`,
                    status: 'info',
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error: any) {
                toast({
                    title: 'Ошибка',
                    description: error.message || 'Не удалось отменить подписку',
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                });
            } finally {
                setIsLoading(false);
            }
        } else {
            // Подписаться - показываем модальное окно выбора способа
            onOpen();
        }
    };

    const handleSelectMethod = async (method: 'telegram' | 'browser') => {
        setIsLoading(true);
        try {
            let pushSubscriptionSuccess = false;
            
            if (method === 'browser') {
                // Для browser уведомлений нужно запросить разрешение и зарегистрировать push
                try {
                    const permission = await requestNotificationPermission();
                    
                    if (permission !== 'granted') {
                        throw new Error('Для получения уведомлений в браузере необходимо разрешить их в настройках браузера');
                    }

                    // Регистрируем push подписку в браузере
                    // Не бросаем ошибку, если не удалось из-за SSL - все равно создадим подписку
                    const pushSubscription = await subscribeToPush();
                    pushSubscriptionSuccess = !!pushSubscription;
                    
                    if (!pushSubscription) {
                        console.warn('Не удалось зарегистрировать push уведомления (возможно, из-за SSL сертификата в разработке). Подписка будет создана, но push уведомления могут быть недоступны.');
                    }
                } catch (pushError: any) {
                    // Если ошибка связана с SSL или Service Worker, продолжаем создание подписки
                    if (pushError?.message?.includes('SSL') || pushError?.message?.includes('SSL_CERTIFICATE_ERROR') || pushError?.message?.includes('certificate') || pushError?.message?.includes('Service Worker')) {
                        console.warn('Push уведомления недоступны из-за SSL сертификата. Подписка будет создана, но без push уведомлений.');
                        pushSubscriptionSuccess = false;
                    } else if (pushError?.message?.includes('AUTHORIZATION_ERROR')) {
                        // Ошибка авторизации при получении VAPID ключа - это серьезная проблема
                        throw new Error('Ошибка авторизации. Пожалуйста, перезайдите в систему.');
                    } else {
                        // Для других ошибок (например, разрешение отклонено) - выбрасываем ошибку
                        throw pushError;
                    }
                }
            }

            // Создаём подписку в БД (всегда, даже если push не удался)
            try {
                const subscription = await createSubscription(subscriptionType, targetId, method);
                setIsSubscribed(true);
                setSubscriptionId(subscription.id);
                
                let description = `Вы подписались на ${subscriptionType === 'organizer' ? 'организатора' : 'категорию'} "${targetName}"`;
                if (method === 'telegram') {
                    description += ' через Telegram';
                } else if (method === 'browser') {
                    if (pushSubscriptionSuccess) {
                        description += ' через браузер';
                    } else {
                        description += ' (браузерные push уведомления недоступны из-за проблем с SSL сертификатом в разработке)';
                    }
                }
                
                toast({
                    title: 'Подписка оформлена',
                    description,
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                });
            } catch (createError: any) {
                // Если ошибка создания подписки связана с авторизацией
                if (createError?.message?.includes('401') || createError?.message?.includes('Unauthorized')) {
                    throw new Error('Ошибка авторизации. Пожалуйста, перезайдите в систему.');
                }
                throw createError;
            }
        } catch (error: any) {
            throw error; // Пробрасываем ошибку для обработки в модальном окне
        } finally {
            setIsLoading(false);
        }
    };

    if (isChecking) {
        return null;
    }

    // Определяем текст кнопки в зависимости от типа подписки
    const getButtonText = () => {
        if (isCompact) return '';
        if (isSubscribed) {
            return subscriptionType === 'organizer' ? 'Отписаться от организатора' : 'Отписаться от категории';
        }
        return subscriptionType === 'organizer' ? `Подписаться на организатора` : `Подписаться на категорию`;
    };

    return (
        <>
            <Button
                size={size}
                variant={variant}
                colorScheme={isSubscribed ? 'red' : 'blue'}
                leftIcon={<Icon as={isSubscribed ? FaBellSlash : FaBell} />}
                onClick={handleToggleSubscription}
                isLoading={isLoading}
                title={subscriptionType === 'organizer' ? `Подписка на уведомления о новых мероприятиях организатора "${targetName}"` : `Подписка на уведомления о новых мероприятиях в категории "${targetName}"`}
            >
                {getButtonText()}
            </Button>
            <NotificationMethodModal
                isOpen={isOpen}
                onClose={onClose}
                onSelectMethod={handleSelectMethod}
                subscriptionType={subscriptionType}
                targetName={targetName}
            />
        </>
    );
}
