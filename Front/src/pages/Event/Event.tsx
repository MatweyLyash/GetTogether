import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Flex,
  VStack,
  Heading,
  Button,
  Divider,
  useToast,
  Spinner,
  useDisclosure,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  getEventById,
  getEventByIdWithReg,
  registerForEvent,
  cancelEventRegistration,
  getRegistrationQRCode,
} from '../../api/api';
import { Event as EventType, EventResponse } from '../../types/event';
import { useAuth } from '../../AuthContext/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { EventImage } from '../../components/Event/EventImage';
import { EventPriceBadge } from '../../components/Event/EventPriceBadge';
import { EventTags } from '../../components/Event/EventTags';
import { EventOrganizerInfo } from '../../components/Event/EventOrganizerInfo';
import { EventStats } from '../../components/Event/EventStats';
import { EventDescription } from '../../components/Event/EventDescription';
import { TelegramChatLink } from '../../components/Event/TelegramChatLink';
import { RegistrationActions } from '../../components/Event/RegistrationActions';
import { ReviewsSection } from '../../components/Event/ReviewsSection';
import { QRCodeModal } from '../../components/Event/QRCodeModal';
import { RegistrationModal } from '../../components/Event/RegistrationModal';
import { CancellationModal } from '../../components/Event/CancellationModal';
import styles from './Event.module.scss';

function EventPage() {
  const { id } = useParams<{ id: string }>();
  const [eventData, setEventData] = useState<EventResponse | EventType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const {
    isOpen: isQRModalOpen,
    onOpen: onQRModalOpen,
    onClose: onQRModalClose,
  } = useDisclosure();
  const {
    isOpen: isRegModalOpen,
    onOpen: onRegModalOpen,
    onClose: onRegModalClose,
  } = useDisclosure();
  const {
    isOpen: isCancelModalOpen,
    onOpen: onCancelModalOpen,
    onClose: onCancelModalClose,
  } = useDisclosure();

  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isQRLoading, setIsQRLoading] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        if (authLoading) return;

        const data =
          isAuthenticated && user
            ? await getEventByIdWithReg(id)
            : await getEventById(id);
        setEventData(data);
      } catch (error: any) {
        toast({
          title: 'Ошибка',
          description: error.message || 'Не удалось загрузить мероприятие',
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

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Требуется авторизация',
        description: 'Пожалуйста, войдите в систему',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login', { state: { from: `/event/${id}` } });
      return;
    }

    if (!id) return;
    setIsRegistering(true);
    onRegModalClose();
    try {
      const result = await registerForEvent(id);
      setEventData((prev) =>
        prev
          ? {
            ...prev,
            registration: {
              id: result.id,
              status: result.status,
              telegram_invite_link: result.telegram_invite_link,
            },
          }
          : null
      );
      toast({
        title: 'Успех',
        description: result.telegram_invite_link
          ? 'Заявка подтверждена. Используйте ссылку для присоединения к чату.'
          : 'Заявка отправлена.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка регистрации',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleEditEvent = () => {
    if (!id || !event) return;
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
          image: event.image,
        },
      },
    });
  };

  const handleCancelRegistration = async () => {
    if (!id) return;
    setIsRegistering(true);
    onCancelModalClose();
    try {
      await cancelEventRegistration(id);
      setEventData((prev) => {
        if (!prev) return null;
        const currentReg = (prev as EventResponse).registration;
        return {
          ...prev,
          registration: currentReg
            ? { ...currentReg, status: 4, telegram_invite_link: null }
            : null,
        };
      });
      toast({
        title: 'Успех',
        description: 'Заявка отозвана',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleGetQRCode = async () => {
    if (!registration?.id) return;
    setIsQRLoading(true);
    onQRModalOpen();
    try {
      const response = await getRegistrationQRCode(registration.id);
      setQrCodeImage(response.qrCode);
    } catch (error: any) {
      toast({
        title: 'Ошибка получения QR-кода',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      onQRModalClose();
    } finally {
      setIsQRLoading(false);
    }
  };

  if (isLoading || authLoading) {
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

  const isOrganizer = String(user?.id) === String(event?.creator?.id);
  const isRegistered = registration !== null;
  const registrationClosed = event.capacity <= 0;
  const isPastEvent = new Date(event.date) < new Date();
  const isArchived = isPastEvent || !!event.deletedAt;
  const registrationStatus =
    (registration as any)?.status ?? (registration as any)?.status_id ?? null;

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
            <Box w={{ base: '100%', lg: '40%' }} position="relative">
              <EventImage imageSrc={event.image} isLoading={isLoading} />
              <Box position="absolute" top={4} right={4}>
                <EventPriceBadge price={event.price} />
              </Box>
            </Box>

            <VStack align="stretch" flex="1" p={{ base: 4, md: 6 }} spacing={4}>
              <EventTags category={event.category} tags={event.tags} />

              <EventOrganizerInfo
                title={event.title}
                organizer={event.creator}
                isAuthenticated={isAuthenticated}
                isOrganizer={isOrganizer}
              />

              <Divider />

              <EventStats
                date={event.date}
                location={event.location}
                capacity={event.capacity}
                price={event.price}
              />

              <Divider />

              <EventDescription description={event.description} />

              {isRegistered && registration?.telegram_invite_link && (
                <TelegramChatLink inviteLink={registration.telegram_invite_link} />
              )}

              <Box mt={4}>
                <RegistrationActions
                  isOrganizer={isOrganizer}
                  isRegistered={isRegistered}
                  isArchived={isArchived}
                  registrationClosed={registrationClosed}
                  registrationStatus={registrationStatus}
                  onEdit={handleEditEvent}
                  onRegister={onRegModalOpen}
                  onCancel={onCancelModalOpen}
                  onGetQR={handleGetQRCode}
                />
              </Box>
            </VStack>
          </Flex>
        </motion.div>

        {event.reviews && event.reviews.length > 0 && (
          <ReviewsSection reviews={event.reviews} />
        )}
      </Container>
      <Footer />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={onQRModalClose}
        qrCode={qrCodeImage}
        isLoading={isQRLoading}
      />

      <RegistrationModal
        isOpen={isRegModalOpen}
        onClose={onRegModalClose}
        onConfirm={handleRegister}
        isLoading={isRegistering}
      />

      <CancellationModal
        isOpen={isCancelModalOpen}
        onClose={onCancelModalClose}
        onConfirm={handleCancelRegistration}
        isLoading={isRegistering}
      />
    </Box>
  );
}

export default EventPage;
