import { Box, Heading, VStack, Text, HStack, Avatar } from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  reviewUser: {
    id: string;
    login: string;
  };
}

interface ReviewsSectionProps {
  reviews: Review[];
}

/**
 * Reviews section with list of reviews
 */
export function ReviewsSection({ reviews }: ReviewsSectionProps) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <Box mt={10}>
      <Heading size="lg" mb={4}>
        Отзывы ({reviews.length})
      </Heading>
      <VStack spacing={4} align="stretch">
        {reviews.map((review) => (
          <Box key={review.id} bg="white" p={4} borderRadius="md" boxShadow="md">
            <HStack justify="space-between" align="center" mb={2}>
              <HStack>
                <Avatar size="sm" name={review.reviewUser.login} />
                <Text fontWeight="bold">{review.reviewUser.login}</Text>
              </HStack>
              <HStack>
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} color={i < review.rating ? '#FFD700' : '#E2E8F0'} />
                ))}
              </HStack>
            </HStack>
            <Text>{review.comment}</Text>
            <Text fontSize="sm" color="gray.500" mt={2}>
              {new Date(review.createdAt).toLocaleDateString('ru-RU')}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
