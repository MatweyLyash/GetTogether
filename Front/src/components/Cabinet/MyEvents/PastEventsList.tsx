import { useState } from 'react';
import { VStack, Text, Select, Textarea, Button, useBreakpointValue } from '@chakra-ui/react';
import { EventRegistrationCard } from './EventRegistrationCard';
import { CabinetEventRegistration } from '../types';

interface Review {
  rating: number;
  comment: string;
}

interface PastEventsListProps {
  registrations: CabinetEventRegistration[];
  userId: string;
  onNavigate: (eventId: string) => void;
  onSubmitReview: (eventId: string, rating: number, comment: string) => Promise<void>;
  isLoading: boolean;
}

export function PastEventsList({
  registrations,
  userId,
  onNavigate,
  onSubmitReview,
  isLoading,
}: PastEventsListProps) {
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const [reviewEventId, setReviewEventId] = useState<string | null>(null);
  const [review, setReview] = useState<Review>({ rating: 5, comment: '' });

  const isValidDate = (dateString: string) => {
    const date = new Date(dateString);
    return !Number.isNaN(date.getTime());
  };

  const pastEvents = registrations.filter((reg) => {
    if (!reg.Event || reg.status_id !== 2) return false;
    const isScanned = !reg.qr_code;
    const isPastDate = isValidDate(reg.Event.date) && new Date(reg.Event.date) <= new Date();
    return isPastDate || isScanned;
  });

  const handleReviewSubmit = async (eventId: string) => {
    if (!review.comment || review.rating < 1 || review.rating > 5) return;
    await onSubmitReview(eventId, review.rating, review.comment);
    setReviewEventId(null);
    setReview({ rating: 5, comment: '' });
  };

  if (pastEvents.length === 0) {
    return <Text fontSize={buttonSize} color="rgba(66, 32, 6, 0.64)">Нет прошедших мероприятий</Text>;
  }

  return (
    <VStack spacing="4" align="stretch">
      {pastEvents.map((reg) => {
        const hasReview = reg.Event?.reviews?.some((r) => r.user_id === userId);
        const showReviewForm = reviewEventId === reg.event_id;

        return (
          <VStack key={reg.id} spacing="2" align="stretch">
            <EventRegistrationCard
              registration={reg}
              type="past"
              onNavigate={onNavigate}
              onSubmitReview={(eventId) => setReviewEventId(eventId)}
              hasReview={hasReview}
            />
            {showReviewForm && (
              <VStack spacing="2" p="4" bg="rgba(255,255,255,0.82)" borderRadius="2xl" border="1px solid rgba(234, 179, 8, 0.16)">
                <Select
                  value={review.rating}
                  onChange={(e) => setReview({ ...review, rating: Number(e.target.value) })}
                  size={buttonSize}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'звезда' : num < 5 ? 'звезды' : 'звёзд'}
                    </option>
                  ))}
                </Select>
                <Textarea
                  value={review.comment}
                  onChange={(e) => setReview({ ...review, comment: e.target.value })}
                  placeholder="Ваш отзыв"
                  size={buttonSize}
                />
                <Button
                  bg="#facc15"
                  color="#422006"
                  _hover={{ bg: '#eab308' }}
                  size={buttonSize}
                  onClick={() => handleReviewSubmit(reg.event_id)}
                  isLoading={isLoading}
                >
                  Отправить отзыв
                </Button>
                <Button
                  variant="ghost"
                  size={buttonSize}
                  onClick={() => setReviewEventId(null)}
                >
                  Отмена
                </Button>
              </VStack>
            )}
          </VStack>
        );
      })}
    </VStack>
  );
}
