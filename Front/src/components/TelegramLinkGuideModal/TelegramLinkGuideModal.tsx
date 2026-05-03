import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    Text,
    Icon,
    useToast,
    Box,
    FormControl,
    FormLabel,
    Input,
    Link,
} from '@chakra-ui/react';
import { FaTelegram, FaCopy, FaCheck } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { linkTelegram } from '../../api/api';
import { useAuth } from '../../AuthContext/AuthContext';

const GT = {
    primary: '#facc15',
    primaryStrong: '#eab308',
    primaryDark: '#ca8a04',
    ink: '#422006',
    inkSoft: 'rgba(66, 32, 6, 0.72)',
    border: 'rgba(234, 179, 8, 0.18)',
    bg: '#fffdf5',
};

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

    useEffect(() => {
        if (isOpen && user?.login) {
            setLinkCommand(`/link ${user.login}`);
        }
    }, [isOpen, user?.login]);

    const handleCopyCommand = () => {
        if (linkCommand) {
            navigator.clipboard.writeText(linkCommand);
            setCopied(true);
            toast({ title: 'Команда скопирована', status: 'success', duration: 2000, isClosable: true });
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLinkTelegram = async () => {
        if (!telegramUsername.trim()) {
            toast({ title: 'Ошибка', description: 'Введите ваш Telegram username', status: 'error', duration: 3000, isClosable: true });
            return;
        }

        let telegramTag = telegramUsername.trim();
        if (!telegramTag.startsWith('@')) {
            telegramTag = `@${telegramTag}`;
        }

        setIsLinking(true);
        try {
            const result = await linkTelegram(telegramTag);
            if (setUser && user) {
                setUser({ ...user, telegram: result.telegram });
            }
            toast({ title: 'Telegram успешно привязан!', description: result.message || 'Теперь вы можете получать уведомления через Telegram', status: 'success', duration: 3000, isClosable: true });
            handleClose();
            if (onSuccess) onSuccess();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Не удалось привязать Telegram аккаунт';
            toast({ title: 'Ошибка привязки', description: msg, status: 'error', duration: 5000, isClosable: true });
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
            <ModalOverlay bg="rgba(66, 32, 6, 0.25)" />
            <ModalContent
                maxW={{ base: '95vw', sm: '90vw', md: '520px' }}
                bg={GT.bg}
                border={`1px solid ${GT.border}`}
                borderRadius="1.5rem"
                boxShadow="0 24px 48px rgba(140, 91, 14, 0.16)"
                overflow="hidden"
            >
                <Box
                    bg={`linear-gradient(135deg, ${GT.primary} 0%, ${GT.primaryStrong} 100%)`}
                    px={{ base: 4, sm: 6 }}
                    py={3}
                    display="flex"
                    alignItems="center"
                    gap="0.75rem"
                >
                    <Box bg="rgba(255,255,255,0.25)" borderRadius="0.75rem" p="0.4rem" color={GT.ink} fontSize="1.15rem">
                        <FaTelegram />
                    </Box>
                    <Text fontFamily="'Outfit', sans-serif" fontWeight="800" fontSize="1.1rem" color={GT.ink} letterSpacing="-0.03em">
                        Привязка Telegram
                    </Text>
                </Box>
                <ModalCloseButton color={GT.ink} top="0.5rem" right="0.75rem" _hover={{ bg: 'rgba(255,255,255,0.3)' }} />

                <ModalBody px={{ base: 4, sm: 6 }} py={5}>
                    <VStack spacing={5} align="stretch">
                        <Box
                            p="1.25rem"
                            borderRadius="1.5rem"
                            bg="rgba(250, 204, 21, 0.08)"
                            border={`1px solid ${GT.border}`}
                        >
                            <Text fontWeight="800" mb={3} fontSize={{ base: 'sm', sm: 'md' }} color={GT.ink} fontFamily="Outfit, sans-serif">
                                Как привязать Telegram:
                            </Text>

                            <VStack spacing={3} align="stretch">
                                <Box display="flex" alignItems="flex-start" gap="0.75rem">
                                    <Box flexShrink={0} w="28px" h="28px" borderRadius="0.625rem" bg={GT.primary} color={GT.ink} display="flex" alignItems="center" justifyContent="center" fontWeight="800" fontSize="0.82rem" fontFamily="Outfit, sans-serif">1</Box>
                                    <Text fontSize={{ base: 'sm', sm: 'md' }} color={GT.inkSoft} lineHeight="1.5">
                                        Откройте Telegram и найдите бота{' '}
                                        <Link href="https://t.me/GetTogetherPSKPbot" isExternal color={GT.primaryDark} fontWeight="700" _hover={{ color: GT.ink, textDecoration: 'underline' }}>
                                            @GetTogetherPSKPbot
                                        </Link>
                                    </Text>
                                </Box>

                                <Box display="flex" alignItems="flex-start" gap="0.75rem">
                                    <Box flexShrink={0} w="28px" h="28px" borderRadius="0.625rem" bg={GT.primary} color={GT.ink} display="flex" alignItems="center" justifyContent="center" fontWeight="800" fontSize="0.82rem" fontFamily="Outfit, sans-serif">2</Box>
                                    <Box flex={1}>
                                        <Text fontSize={{ base: 'sm', sm: 'md' }} color={GT.inkSoft} lineHeight="1.5" mb={2}>
                                            Отправьте боту команду:
                                        </Text>
                                        <Box
                                            p="0.65rem 0.85rem"
                                            bg="rgba(255, 255, 255, 0.92)"
                                            borderRadius="1rem"
                                            border="1px solid rgba(234, 179, 8, 0.22)"
                                            display="flex"
                                            alignItems="center"
                                            gap={2}
                                        >
                                            <Text fontFamily="mono" fontSize="sm" flex={1} color={GT.ink} fontWeight="600">
                                                {linkCommand || `/link ${user?.login || 'ваш_логин'}`}
                                            </Text>
                                            <Button
                                                size="sm"
                                                leftIcon={<Icon as={copied ? FaCheck : FaCopy} />}
                                                onClick={handleCopyCommand}
                                                bg={copied ? '#22c55e' : GT.primary}
                                                color={copied ? '#fff' : GT.ink}
                                                _hover={copied ? { bg: '#16a34a' } : { bg: GT.primaryStrong }}
                                                borderRadius="0.75rem"
                                                minW="110px"
                                                fontWeight="700"
                                                fontSize="0.78rem"
                                            >
                                                {copied ? 'Скопировано' : 'Копировать'}
                                            </Button>
                                        </Box>
                                    </Box>
                                </Box>

                                <Box display="flex" alignItems="flex-start" gap="0.75rem">
                                    <Box flexShrink={0} w="28px" h="28px" borderRadius="0.625rem" bg={GT.primary} color={GT.ink} display="flex" alignItems="center" justifyContent="center" fontWeight="800" fontSize="0.82rem" fontFamily="Outfit, sans-serif">3</Box>
                                    <Text fontSize={{ base: 'sm', sm: 'md' }} color={GT.inkSoft} lineHeight="1.5">
                                        Бот подтвердит привязку. Введите ваш Telegram username ниже
                                    </Text>
                                </Box>
                            </VStack>
                        </Box>

                        <FormControl>
                            <FormLabel fontSize={{ base: 'sm', sm: 'md' }} color={GT.ink} fontWeight="700">
                                Ваш Telegram username
                            </FormLabel>
                            <Input
                                placeholder="@username"
                                value={telegramUsername}
                                onChange={(e) => setTelegramUsername(e.target.value)}
                                isDisabled={isLinking}
                                size={{ base: 'sm', sm: 'md' }}
                                bg="rgba(255, 255, 255, 0.92)"
                                border="1px solid rgba(234, 179, 8, 0.22)"
                                borderRadius="1rem"
                                _focus={{ borderColor: GT.primaryStrong, boxShadow: '0 0 0 2px rgba(234, 179, 8, 0.3)' }}
                                _placeholder={{ color: 'rgba(66, 32, 6, 0.36)' }}
                                color={GT.ink}
                            />
                        </FormControl>

                        <Button
                            bg={GT.primary}
                            color={GT.ink}
                            _hover={{ bg: GT.primaryStrong, transform: 'scale(1.03)' }}
                            _active={{ bg: GT.primaryDark }}
                            onClick={handleLinkTelegram}
                            isLoading={isLinking}
                            leftIcon={<Icon as={FaTelegram} />}
                            size="lg"
                            width="100%"
                            borderRadius="999px"
                            fontWeight="800"
                            fontFamily="Outfit, sans-serif"
                            letterSpacing="-0.02em"
                        >
                            {isLinking ? 'Привязываем...' : 'Привязать Telegram'}
                        </Button>
                    </VStack>
                </ModalBody>

                <Box px={{ base: 4, sm: 6 }} pb={4} pt={1}>
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        isDisabled={isLinking}
                        color="rgba(66, 32, 6, 0.56)"
                        _hover={{ color: GT.ink, bg: 'rgba(234, 179, 8, 0.08)' }}
                        borderRadius="999px"
                        fontWeight="600"
                        width="100%"
                    >
                        Отмена
                    </Button>
                </Box>
            </ModalContent>
        </Modal>
    );
}
