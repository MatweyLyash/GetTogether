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
    Link,
} from '@chakra-ui/react';
import { FaTelegram, FaCopy, FaCheck } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { linkTelegram } from '../../api/api';
import { useAuth } from '../../AuthContext/AuthContext';

interface TelegramLinkGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export function TelegramLinkGuideModal({
    isOpen,
    onClose,
    onSuccess,
}: TelegramLinkGuideModalProps) {
    const [telegramUsername, setTelegramUsername] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const [linkCommand, setLinkCommand] = useState('');
    const [copied, setCopied] = useState(false);
    const toast = useToast();
    const { user, setUser } = useAuth();

    // Инициализируем команду при открытии модального окна
    useEffect(() => {
        if (isOpen && user?.login) {
            setLinkCommand(`/link ${user.login}`);
        }
    }, [isOpen, user?.login]);

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
                description: result.message || 'Теперь вы можете получать уведомления через Telegram',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            handleClose();
            if (onSuccess) {
                onSuccess();
            }
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
        setTelegramUsername('');
        setCopied(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered size={{ base: 'full', sm: 'md', lg: 'lg' }}>
            <ModalOverlay />
            <ModalContent maxW={{ base: '95vw', sm: '90vw', md: '600px' }} px={{ base: 2, sm: 4 }}>
                <ModalHeader fontSize={{ base: 'lg', sm: 'xl' }}>
                    Привязка Telegram аккаунта
                </ModalHeader>
                <ModalCloseButton />
                <ModalBody pb={2}>
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

                        <FormControl>
                            <FormLabel fontSize={{ base: 'sm', sm: 'md' }}>Ваш Telegram username (например: @username или username)</FormLabel>
                            <Input
                                placeholder="@username"
                                value={telegramUsername}
                                onChange={(e) => setTelegramUsername(e.target.value)}
                                isDisabled={isLinking}
                                size={{ base: 'sm', sm: 'md' }}
                            />
                        </FormControl>

                        <Button
                            colorScheme="blue"
                            onClick={handleLinkTelegram}
                            isLoading={isLinking}
                            leftIcon={<Icon as={FaTelegram} />}
                            size="lg"
                            width="100%"
                        >
                            {isLinking ? 'Привязываем...' : 'Привязать Telegram'}
                        </Button>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" onClick={handleClose} isDisabled={isLinking}>
                        Отмена
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}

