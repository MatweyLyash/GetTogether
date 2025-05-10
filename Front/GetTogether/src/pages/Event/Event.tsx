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
  IconButton,
  Container,
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaCalendarAlt, FaRubleSign, FaUserFriends, FaTelegram, FaStar, FaMoneyBill } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { getEventById, registerForEvent } from '../../api/api';
import { Event as EventType, EventResponse } from '../../types/event';
import { useAuth } from '../../AuthContext/AuthContext';
import styles from './Event.module.scss';

function EventPage() {
  const { id } = useParams<{ id: string }>();
  const [eventData, setEventData] = useState<EventResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await getEventById(id);
        setEventData(data);
      } catch (error: any) {
        console.error('Ошибка при загрузке мероприятия:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [id, toast]);

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
          status: 1, 
          telegram_invite_link: result.telegram_invite_link 
        }
      } : null);
      
      toast({
        title: 'Регистрация успешна',
        description: result.telegram_invite_link 
          ? 'Вы успешно зарегистрированы. Используйте ссылку для присоединения к чату мероприятия.' 
          : 'Вы успешно зарегистрированы на мероприятие.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка регистрации',
        description: error.message || 'Не удалось зарегистрироваться на мероприятие',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRegistering(false);
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

  if (!eventData || !eventData.event) {
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

  const { event, registration } = eventData;
  const isOrganizer = user?.id === event.creator.id;
  const isRegistered = registration !== null;
  const registrationClosed = event.capacity <= 0;
  const eventDate = new Date(event.date);
  const isPastEvent = eventDate < new Date();

  // Форматирование даты
  const formattedDate = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(eventDate);

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
            {/* Изображение мероприятия */}
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
                {event.price > 0 ? `${event.price} ₽` : 'Бесплатно'}
              </Badge>
            </Box>

            {/* Контент мероприятия */}
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

              {isRegistered && registration.telegram_invite_link && (
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
                {!isOrganizer && !isRegistered && !isPastEvent && (
                  <Button
                    colorScheme="blue"
                    size="lg"
                    w="100%"
                    isLoading={isRegistering}
                    isDisabled={registrationClosed}
                    onClick={handleRegister}
                  >
                    {registrationClosed ? 'Места закончились' : 'Зарегистрироваться'}
                  </Button>
                )}

                {isRegistered && !isPastEvent && (
                  <Button
                    colorScheme="green"
                    size="lg"
                    w="100%"
                    h="20"
                    isDisabled
                  >
                    Заяка на регистрацию передана. <br/>Ожидайте подтверждения от организатора
                  </Button>
                )}

                {isPastEvent && (
                  <Button
                    colorScheme="gray"
                    size="lg"
                    w="100%"
                    isDisabled
                  >
                    Мероприятие завершено
                  </Button>
                )}

                {isOrganizer && (
                  <Button
                    colorScheme="teal"
                    size="lg"
                    w="100%"
                    onClick={() => navigate(`/organizer/events/${id}`)}
                  >
                    Управление мероприятием
                  </Button>
                )}
              </Box>
            </VStack>
          </Flex>
        </motion.div>

        {/* Секция отзывов */}
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
                    {new Date(review.created_at).toLocaleDateString('ru-RU')}
                  </Text>
                </Box>
              ))}
            </VStack>
      </Box>
        )}
      </Container>
      <Footer />
    </Box>
  );
}

export default EventPage;