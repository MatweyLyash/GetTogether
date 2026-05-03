import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ModalCloseButton,
    Button,
    VStack,
    Text,
    Icon,
    useToast,
    Box,
    OrderedList,
    ListItem,
    FormControl,
    FormLabel,
    Input,
    Alert,
    AlertIcon,
    Divider,
    Link,
} from '@chakra-ui/react';
import { FaTelegram, FaChrome, FaCopy, FaCheck } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { linkTelegram } from '../../api/api';
import { useAuth } from '../../AuthContext/AuthContext';

interface NotificationMethodModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectMethod: (method: 'telegram' | 'browser') => Promise<void>;
    subscriptionType: 'organizer' | 'category' | 'waitlist';
    targetName: string;
}

export function NotificationMethodModal({
    isOpen,
    onClose,
    onSelectMethod,
    subscriptionType,
    targetName,
}: NotificationMethodModalProps) {
    const [isLoading, setIsLoading] = useState<'telegram' | 'browser' | null>(null);
    const [showTelegramGuide, setShowTelegramGuide] = useState(false);
    const [telegramUsername, setTelegramUsername] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const [linkCommand, setLinkCommand] = useState('');
    const [copied, setCopied] = useState(false);
    const toast = useToast();
    const { user, setUser } = useAuth();
    const hasTelegram = !!user?.telegram;

    // Инициализируем команду при открытии модального окна
    useEffect(() => {
        if (isOpen && user?.login) {
            setLinkCommand(`/link ${user.login}`);
        }
    }, [isOpen, user?.login]);

    const handleSelect = async (method: 'telegram' | 'browser') => {
        if (method === 'telegram' && !hasTelegram) {
            // Показываем гайд по привязке
            setShowTelegramGuide(true);
            if (user?.login) {
                setLinkCommand(`/link ${user.login}`);
            }
            return;
        }

        setIsLoading(method);
        try {
            await onSelectMethod(method);
            handleClose();
        } catch (error: any) {
            toast({
                title: 'Ошибка',
                description: error.message || 'Не удалось оформить подписку',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(null);
        }
    };

    const handleCopyCommand = () => {
        if (linkCommand) {
            navigator.clipboard.writeText(linkCommand);
            setCopied(true);
            toast({
                title: 'Команда скопирована',
                status: 'success',
                duration: 2000,
                isClosable: true,
            });
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLinkTelegram = async () => {
        if (!telegramUsername.trim()) {
            toast({
                title: 'Ошибка',
                description: 'Введите ваш Telegram username',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        let telegramTag = telegramUsername.trim();
        if (!telegramTag.startsWith('@')) {
            telegramTag = `@${telegramTag}`;
        }

        setIsLinking(true);
        try {
            const result = await linkTelegram(telegramTag);
            
            // Обновляем пользователя в контексте
            if (setUser && user) {
                setUser({ ...user, telegram: result.telegram });
            }

            toast({
                title: 'Telegram успешно привязан!',
                description: 'Теперь вы можете подписаться на уведомления через Telegram',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            // Автоматически подписываем через Telegram
            setIsLoading('telegram');
            await onSelectMethod('telegram');
            handleClose();
        } catch (error: any) {
            toast({
                title: 'Ошибка привязки',
                description: error.message || 'Не удалось привязать Telegram аккаунт',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLinking(false);
        }
    };

    const handleClose = () => {
        setShowTelegramGuide(false);
        setTelegramUsername('');
        setCopied(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered size={{ base: 'full', sm: 'md', lg: 'lg' }}>
            <ModalOverlay />
            <ModalContent maxW={{ base: '95vw', sm: '90vw', md: '600px' }} px={{ base: 2, sm: 4 }}>
                <ModalHeader fontSize={{ base: 'lg', sm: 'xl' }}>
                    {showTelegramGuide ? 'Привязка Telegram аккаунта' : 'Выберите способ получения уведомлений'}
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={2}>
                    {showTelegramGuide ? (
                        <VStack spacing={{ base: 3, sm: 4 }} align="stretch">
                            <Alert status="info" borderRadius="md">
                                <AlertIcon />
                                <Box>
                                    <Text fontWeight="bold" mb={2} fontSize={{ base: 'sm', sm: 'md' }}>Как привязать Telegram аккаунт:</Text>
                                    <OrderedList spacing={2} fontSize={{ base: 'sm', sm: 'md' }}>
                                        <ListItem>
                                            Откройте Telegram и найдите бота{' '}
                                            <Link href="https://t.me/GetTogetherPSKPbot" isExternal color="blue.500">
                                                @GetTogetherPSKPbot
                                            </Link>
                                        </ListItem>
                                        <ListItem>
                                            Начните диалог с ботом и отправьте команду:
                                            <Box mt={2} p={3} bg="gray.100" borderRadius="md" display="flex" alignItems="center" gap={2}>
                                                <Text fontFamily="mono" fontSize="sm" flex={1}>{linkCommand || `/link ${user?.login || 'ваш_логин'}`}</Text>
                                                <Button
                                                    size="sm"
                                                    leftIcon={<Icon as={copied ? FaCheck : FaCopy} />}
                                                    onClick={handleCopyCommand}
                                                    colorScheme={copied ? 'green' : 'gray'}
                                                    minW="110px"
                                                >
                                                    {copied ? 'Скопировано' : 'Копировать'}
                                                </Button>
                                            </Box>
                                        </ListItem>
                                        <ListItem>
                                            Бот отправит подтверждение. Вернитесь сюда и введите ваш Telegram username ниже
                                        </ListItem>
                                    </OrderedList>
                                </Box>
                            </Alert>

                            <Divider />

                            <FormControl>
                                <FormLabel fontSize={{ base: 'sm', sm: 'md' }}>Ваш Telegram username (например: @username или username)</FormLabel>
                                <Input
                                    placeholder="@username"
                                    value={telegramUsername}
                                    onChange={(e) => setTelegramUsername(e.target.value)}
                                    isDisabled={isLinking || isLoading !== null}
                                    size={{ base: 'sm', sm: 'md' }}
                                />
                            </FormControl>

                            <Button
                                colorScheme="blue"
                                onClick={handleLinkTelegram}
                                isLoading={isLinking || isLoading === 'telegram'}
                                isDisabled={isLoading !== null && isLoading !== 'telegram'}
                                leftIcon={<Icon as={FaTelegram} />}
                                size="lg"
                                width="100%"
                            >
                                {isLinking ? 'Привязываем...' : 'Привязать и подписаться'}
                            </Button>

                            <Button
                                variant="ghost"
                                onClick={() => {
                                    setShowTelegramGuide(false);
                                    setTelegramUsername('');
                                }}
                                isDisabled={isLoading !== null}
                            >
                                ← Назад к выбору способа
                            </Button>
                        </VStack>
                    ) : (
                        <>
                            <Text mb={4} fontSize={{ base: 'sm', sm: 'md' }}>
                                {subscriptionType === 'waitlist'
                                    ? `Как вы хотите получить уведомление о свободном месте на мероприятии "${targetName}"?`
                                    : `Как вы хотите получать уведомления о новых мероприятиях ${subscriptionType === 'organizer' ? 'от организатора' : 'в категории'} "${targetName}"?`}
                            </Text>
                            <VStack spacing={3} align="stretch">
                                <Button
                                    leftIcon={<Icon as={FaTelegram} />}
                                    colorScheme="blue"
                                    variant={hasTelegram ? 'solid' : 'outline'}
                                    onClick={() => handleSelect('telegram')}
                                    isLoading={isLoading === 'telegram'}
                                    isDisabled={isLoading !== null}
                                    size="lg"
                                    width="100%"
                                >
                                    Через Telegram бота
                                    {!hasTelegram && (
                                        <Text fontSize="xs" ml={2} opacity={0.7}>
                                            (Требуется привязка аккаунта)
                                        </Text>
                                    )}
                                </Button>
                                <Button
                                    leftIcon={<Icon as={FaChrome} />}
                                    colorScheme="green"
                                    variant="solid"
                                    onClick={() => handleSelect('browser')}
                                    isLoading={isLoading === 'browser'}
                                    isDisabled={isLoading !== null}
                                    size="lg"
                                    width="100%"
                                >
                                    Через браузер (Push уведомления)
                                </Button>
                            </VStack>
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    {!showTelegramGuide && (
                        <Button variant="ghost" onClick={handleClose} isDisabled={isLoading !== null}>
                            Отмена
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
