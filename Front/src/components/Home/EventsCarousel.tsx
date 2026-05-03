import { useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Box, Heading, SimpleGrid, Skeleton, SkeletonText, Text } from '@chakra-ui/react';
import Slider, { Settings } from 'react-slick';
import { Event } from '../../types/event';
import EventCard from '../EventCard/EventCard';
import styles from './Home.module.scss';

interface EventsCarouselProps {
  events: Event[];
  isLoading: boolean;
}

const PROMO_ORDER: Record<string, number> = { premium: 4, repeat: 3, boost: 2, one_time: 1 };

export function EventsCarousel({ events, isLoading }: EventsCarouselProps) {
  const sliderRef = useRef<Slider>(null);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const pa = a.promotion ? PROMO_ORDER[a.promotion.type] ?? 0 : 0;
      const pb = b.promotion ? PROMO_ORDER[b.promotion.type] ?? 0 : 0;
      return pb - pa;
    });
  }, [events]);

  const slickSettings: Settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    dotsClass: 'slick-dots custom-dots',
    responsive: [
      {
        breakpoint: 1280,
        settings: { slidesToShow: 2, slidesToScroll: 1, arrows: true },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2, slidesToScroll: 1, arrows: true },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false, dots: true },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false, dots: true },
      },
    ],
  };

  const subHeadingSize = { base: 'md', md: 'lg' };

  return (
    <Box className={styles.carousel}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Heading as="h3" size={subHeadingSize} mb={4}>
          Ближайшие мероприятия
        </Heading>
        {isLoading ? (
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {[...Array(3)].map((_, i) => (
              <Box key={i} p={4} bg="white" borderRadius="lg" boxShadow="sm">
                <Skeleton height="200px" borderRadius="md" mb={4} />
                <SkeletonText noOfLines={3} spacing={2} />
              </Box>
            ))}
          </SimpleGrid>
        ) : events.length > 0 ? (
          <Slider ref={sliderRef} {...slickSettings}>
            {sortedEvents.map((event) => (
              <div key={event.id} className={styles.slide}>
                <motion.div whileHover={{ scale: 1.03, y: -5 }} transition={{ duration: 0.2 }} style={{ height: '100%' }}>
                  <EventCard event={event} />
                </motion.div>
              </div>
            ))}
          </Slider>
        ) : (
          <Box textAlign="center" py={10} bg="rgba(255,255,255,0.75)" borderRadius="2xl" border="1px solid rgba(234, 179, 8, 0.16)">
            <Text color="rgba(66, 32, 6, 0.64)">Нет предстоящих мероприятий</Text>
          </Box>
        )}
      </motion.div>
    </Box>
  );
}
