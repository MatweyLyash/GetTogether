import { motion } from 'framer-motion';
import { Box, Heading, SimpleGrid, SkeletonText, Text, useBreakpointValue } from '@chakra-ui/react';
import { Event } from '../../types/event';
import styles from './Home.module.scss';

interface Review {
  id: string;
  event_id: string;
  rating: number;
  comment: string;
  user: {
    id: string;
    login: string;
  };
}

interface ReviewsSectionProps {
  reviews: Review[];
  events: Event[];
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Reviews section with user testimonials
 */
export function ReviewsSection({ reviews, events, isLoading }: ReviewsSectionProps) {
  const subHeadingSize = useBreakpointValue({ base: 'md', md: 'lg' });

  return (
    <Box className={styles.reviews}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Heading as="h3" size={subHeadingSize} mb={4}>
          Что говорят участники
        </Heading>
        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {[...Array(3)].map((_, i) => (
              <Box key={i} p={4} bg="white" borderRadius="lg" boxShadow="sm">
                <SkeletonText noOfLines={4} spacing={3} />
              </Box>
            ))}
          </SimpleGrid>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {reviews.map((review) => (
                <motion.div key={review.id} variants={itemVariants} whileHover={{ y: -5 }}>
                  <Box
                    bg="white"
                    p={5}
                    borderRadius="lg"
                    boxShadow="sm"
                    border="1px solid"
                    borderColor="gray.100"
                    _hover={{ boxShadow: 'md' }}
                    transition="all 0.2s"
                  >
                    <Text fontWeight="bold" color="#2E4FD7">
                      {review.user.login}
                    </Text>
                    <Text fontSize="sm" color="gray.500" mb={2}>
                      {events.find((e) => e.id === review.event_id)?.title}
                    </Text>
                    <Text color="gray.700" mb={2}>
                      {review.comment}
                    </Text>
                    <Text color="#FFB800" fontSize="lg">
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </Text>
                  </Box>
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>
        )}
      </motion.div>
    </Box>
  );
}
