import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Text,
  Flex,
  Image,
  Heading,
  Divider,
  Badge,
  Button,
  VStack,
  HStack,
  Avatar,
  SimpleGrid,
  useToast,
  Spinner,
  Stat,
  StatLabel,
  StatNumber,
  Container,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaCalendarAlt, FaUserFriends, FaTelegram, FaStar, FaMoneyBill, FaQrcode } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { getEventById, getEventByIdWithReg, registerForEvent, cancelEventRegistration, getRegistrationQRCode } from '../../api/api';
import { Event as EventType, EventResponse } from '../../types/event';
import { useAuth } from '../../AuthContext/AuthContext';
import styles from './Event.module.scss';
import { SubscribeButton } from '../../components/SubscribeButton/SubscribeButton';

function EventPage() {
  const { id } = useParams<{ id: string }>();
  const [eventData, setEventData] = useState<EventResponse | EventType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // QR Code Modal state
  const { isOpen: isQRModalOpen, onOpen: onQRModalOpen, onClose: onQRModalClose } = useDisclosure();
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isQRLoading, setIsQRLoading] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        console.log("Auth state:", { isAuthenticated, authLoading, user });

        // Ждем завершения проверки аутентификации
        if (authLoading) {
          console.log("Ожидание завершения проверки аутентификации...");
          return;
        }

        if (isAuthenticated && user) {
          console.log("Загрузка данных с регистрацией для авторизованного пользователя");
          const data = await getEventByIdWithReg(id);
          setEventData(data);
        } else {
          console.log("Загрузка данных без регистрации для неавторизованного пользователя");
          const data = await getEventById(id);
          setEventData(data);
        }
      } catch (error: any) {
        console.error('Ошибка при загрузке мероприятия:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить мероприятие',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [id, isAuthenticated, authLoading, user, toast]);

  // Диагностика isOrganizer с подробным логированием
  useEffect(() => {
    if (eventData && user) {
      const event = (eventData as EventResponse).event || eventData;
      console.log('Диагностика isOrganizer:', {
        userId: user?.id,
        userIdType: typeof user?.id,
        creatorId: event?.creator?.id,
        creatorIdType: typeof event?.creator?.id,
        userIdString: String(user?.id),
        creatorIdString: String(event?.creator?.id),
        isOrganizer: String(user?.id) === String(event?.creator?.id),
        user: user,
        creator: event?.creator,
      });
    }
  }, [eventData, user]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Требуется авторизация',
        description: 'Пожалуйста, войдите в систему, чтобы зарегистрироваться на мероприятие',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login', { state: { from: `/event/${id}` } });
      return;
    }

    if (!id) return;
    setIsRegistering(true);
    try {
      const result = await registerForEvent(id);
      setEventData(prev => prev ? {
        ...prev,
        registration: {
          id: result.id,
          status: result.status,
          telegram_invite_link: result.telegram_invite_link
        }
      } : null);

      toast({
        title: 'Успех',
        description: result.telegram_invite_link
          ? 'Ваша заявка подтверждена. Используйте ссылку для присоединения к чату мероприятия.'
          : 'Ваша заявка отправлена.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка регистрации',
        description: error.message || 'Не удалось отправить заявку на участие',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleEditEvent = () => {
    if (!id) return;
    navigate('/cabinet', {
      state: {
        isEditing: true,
        eventId: id,
        eventData: {
          title: event.title,
          description: event.description,
          date: event.date.slice(0, 16),
          location: event.location,
          category_id: event.category.id,
          price: event.price,
          capacity: event.capacity,
          telegram_chat_link: event.telegram_chat_link,
          image: event.image
        }
      },
    });
  };

  const handleCancelRegistration = async () => {
    if (!id) return;
    setIsRegistering(true);
    try {
      await cancelEventRegistration(id);
      setEventData(prev => {
        if (!prev) return null;
        const currentReg = (prev as EventResponse).registration;
        return {
          ...prev,
          registration: currentReg ? {
            ...currentReg,
            status: 3,
            telegram_invite_link: null
          } : null
        };
      });

      toast({
        title: 'Успех',
        description: 'Заявка на участие отозвана',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось отозвать заявку',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleGetQRCode = async () => {
    console.log('registration', registration);
    if (!registration?.id) return;
    console.log("aboba");
    setIsQRLoading(true);
    onQRModalOpen();

    try {
      const response = await getRegistrationQRCode(registration.id);
      setQrCodeImage(response.qrCode);
    } catch (error: any) {
      toast({
        title: 'Ошибка получения QR-кода',
        description: error.message || 'Не удалось загрузить QR-код',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      onQRModalClose();
    } finally {
      setIsQRLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box className={styles.container}>
        <Header />
        <Flex justify="center" align="center" minH="70vh">
          <Spinner size="xl" />
        </Flex>
        <Footer />
      </Box>
    );
  }

  if (!eventData) {
    return (
      <Box className={styles.container}>
        <Header />
        <Flex direction="column" justify="center" align="center" minH="70vh">
          <Heading size="lg">Мероприятие не найдено</Heading>
          <Button mt="4" onClick={() => navigate('/events')}>
            Вернуться к списку мероприятий
          </Button>
        </Flex>
        <Footer />
      </Box>
    );
  }

  const event = (eventData as EventResponse).event || eventData;
  const registration = (eventData as EventResponse).registration || null;

  // Упрощенное и надежное определение isOrganizer
  const isOrganizer = String(user?.id) === String(event?.creator?.id);

  const isRegistered = registration !== null;
  console.log("reg", registration);
  const registrationClosed = event.capacity <= 0;
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();

  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(eventDate);


  console.log("deleted_at", event.deletedAt);
  return (
    <Box className={styles.container}>
      <Header />
      <Container maxW="container.xl" py={{ base: 4, md: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Flex
            direction={{ base: 'column', lg: 'row' }}
            gap={{ base: 6, lg: 10 }}
            bg="white"
            boxShadow="lg"
            borderRadius="lg"
            overflow="hidden"
          >
            <Box
              w={{ base: '100%', lg: '40%' }}
              h={{ base: '250px', md: '400px' }}
              position="relative"
              overflow="hidden"
            >
              <Image
                src={event.image || 'https://blog.eboost.com/wp-content/uploads/2016/11/background-of-people-smiling-4184.jpg'}
                alt={event.title}
                w="100%"
                h="100%"
                objectFit="cover"
                fallbackSrc="https://via.placeholder.com/800x600?text=Event+Image"
              />
              <Badge
                position="absolute"
                top="4"
                right="4"
                colorScheme={event.price > 0 ? "yellow" : "green"}
                fontSize="md"
                p="2"
                borderRadius="md"
              >
                {event.price > 0 ? `${event.price} BYN` : 'Бесплатно'}
              </Badge>
            </Box>

            <VStack align="stretch" flex="1" p={{ base: 4, md: 6 }} spacing={4}>
              <Box>
                <Badge colorScheme="blue" mb={2}>
                  {event.category.category_name}
                </Badge>
                <Heading size="xl" mb={2}>
                  {event.title}
                </Heading>
                <Flex align="center" mb={2}>
                  <Avatar size="sm" name={event.creator.login} mr={2} />
                  <Text fontWeight="medium">
                    {event.creator.login}
                  </Text>
                </Flex>
                {isAuthenticated && !isOrganizer && (
                  <Flex gap={2} mt={2} flexWrap="wrap" direction={{ base: 'column', sm: 'row' }}>
                    <SubscribeButton
                      subscriptionType="organizer"
                      targetId={Number(event.creator.id)}
                      targetName={event.creator.login}
                      size="sm"
                      variant="outline"
                    />
                    <SubscribeButton
                      subscriptionType="category"
                      targetId={Number(event.category.id)}
                      targetName={event.category.category_name}
                      size="sm"
                      variant="solid"
                    />
                  </Flex>
                )}
              </Box>

              <Divider />

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <Stat>
                  <HStack align="center">
                    <FaCalendarAlt color="#2E4FD7" />
                    <StatLabel>Дата и время</StatLabel>
                  </HStack>
                  <StatNumber fontSize="md">{formattedDate}</StatNumber>
                </Stat>

                <Stat>
                  <HStack align="center">
                    <FaMapMarkerAlt color="#2E4FD7" />
                    <StatLabel>Место проведения</StatLabel>
                  </HStack>
                  <StatNumber fontSize="md">{event.location}</StatNumber>
                </Stat>

                <Stat>
                  <HStack align="center">
                    <FaUserFriends color="#2E4FD7" />
                    <StatLabel>Свободных мест</StatLabel>
                  </HStack>
                  <StatNumber fontSize="md">{event.capacity} мест</StatNumber>
                </Stat>

                <Stat>
                  <HStack align="center">
                    <FaMoneyBill color="#2E4FD7" />
                    <StatLabel>Стоимость</StatLabel>
                  </HStack>
                  <StatNumber fontSize="md">
                    {event.price > 0 ? `${event.price} BYN` : 'Бесплатно'}
                  </StatNumber>
                </Stat>
              </SimpleGrid>

              <Divider />

              <Box>
                <Heading size="md" mb={2}>
                  Описание
                </Heading>
                <Text whiteSpace="pre-line">{event.description}</Text>
              </Box>

              {isRegistered && registration?.telegram_invite_link && (
                <Box bg="blue.50" p={4} borderRadius="md">
                  <HStack>
                    <FaTelegram size={24} color="#0088cc" />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="bold">Telegram-чат мероприятия</Text>
                      <Text>
                        <a href={registration.telegram_invite_link} target="_blank" rel="noreferrer" style={{ color: '#0088cc' }}>
                          Присоединиться к чату
                        </a>
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              )}

              <Box mt={4}>
                {isOrganizer ? (
                  <Button
                    colorScheme="teal"
                    size="lg"
                    w="100%"
                    onClick={handleEditEvent}
                  >
                    Редактировать
                  </Button>
                ) : isAuthenticated ? (
                  <>
                    {!isRegistered && !isPastEvent && !event.deletedAt && (
                      <Button
                        colorScheme="blue"
                        size="lg"
                        w="100%"
                        isLoading={isRegistering}
                        isDisabled={registrationClosed}
                        onClick={handleRegister}
                      >
                        {registrationClosed ? 'Места закончились' : 'Отправить заявку'}
                      </Button>
                    )}
                    {isRegistered && !isPastEvent && (
                      <VStack spacing={4} w="100%">
                        <Button
                          colorScheme="green"
                          size="lg"
                          w="100%"
                          isDisabled
                        >
                          {registration?.status === 1 ? 'Ожидайте ответа от организатора' :
                            registration?.status === 2 ? 'Ваша заявка подтверждена' :
                              'Заявка отклонена'}
                        </Button>

                        {registration?.status === 2 && (
                          <Button
                            leftIcon={<FaQrcode />}
                            colorScheme="purple"
                            size="lg"
                            w="100%"
                            onClick={handleGetQRCode}
                          >
                            Получить QR-код
                          </Button>
                        )}

                        {registration?.status === 1 && (
                          <Button
                            colorScheme="red"
                            size="lg"
                            w="100%"
                            isLoading={isRegistering}
                            onClick={handleCancelRegistration}
                          >
                            Отозвать заявку
                          </Button>
                        )}
                      </VStack>
                    )}
                    {(isPastEvent || event.deletedAt) && (
                      <Button
                        colorScheme="gray"
                        size="lg"
                        w="100%"
                        isDisabled
                      >
                        Мероприятие завершено
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    colorScheme="blue"
                    size="lg"
                    w="100%"
                    onClick={() => navigate('/login', { state: { from: `/event/${id}` } })}
                  >
                    Войти для регистрации
                  </Button>
                )}
              </Box>
            </VStack>
          </Flex>
        </motion.div>

        {event.reviews && event.reviews.length > 0 && (
          <Box mt={10}>
            <Heading size="lg" mb={4}>
              Отзывы ({event.reviews.length})
            </Heading>
            <VStack spacing={4} align="stretch">
              {event.reviews.map((review) => (
                <Box
                  key={review.id}
                  bg="white"
                  p={4}
                  borderRadius="md"
                  boxShadow="md"
                >
                  <Flex justify="space-between" align="center" mb={2}>
                    <HStack>
                      <Avatar size="sm" name={review.reviewUser.login} />
                      <Text fontWeight="bold">{review.reviewUser.login}</Text>
                    </HStack>
                    <HStack>
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} color={i < review.rating ? "#FFD700" : "#E2E8F0"} />
                      ))}
                    </HStack>
                  </Flex>
                  <Text>{review.comment}</Text>
                  <Text fontSize="sm" color="gray.500" mt={2}>
                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                  </Text>
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </Container>
      <Footer />

      {/* QR Code Modal */}
      <Modal isOpen={isQRModalOpen} onClose={onQRModalClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Ваш QR-код для входа</ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDirection="column" alignItems="center" pb={6}>
            {isQRLoading ? (
              <Spinner size="xl" my={10} />
            ) : qrCodeImage ? (
              <VStack spacing={4}>
                <Image src={qrCodeImage} alt="QR Code" boxSize="250px" />
                <Text textAlign="center" color="gray.600">
                  Покажите этот QR-код организатору при входе на мероприятие
                </Text>
              </VStack>
            ) : (
              <Text color="red.500">Не удалось загрузить QR-код</Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onQRModalClose}>
              Закрыть
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default EventPage;