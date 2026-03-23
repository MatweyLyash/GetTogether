import { motion } from 'framer-motion';
import { Flex, Text, Button } from '@chakra-ui/react';

interface EventsEmptyStateProps {
  onReset: () => void;
  buttonSize?: 'sm' | 'md' | 'lg';
}

/**
 * Empty state when no events match filters
 */
export function EventsEmptyState({ onReset, buttonSize = 'md' }: EventsEmptyStateProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Flex
        justify="center"
        align="center"
        py="4rem"
        minH="300px"
        direction="column"
        bg="rgba(255,255,255,0.82)"
        borderRadius="2xl"
        border="1px solid rgba(234, 179, 8, 0.16)"
        boxShadow="0 18px 34px rgba(140, 91, 14, 0.08)"
      >
        <Text fontSize={{ base: 'lg', md: 'xl' }} color="rgba(66, 32, 6, 0.74)" mb="2" fontWeight="700">
          Мероприятия не найдены
        </Text>
        <Text fontSize="sm" color="rgba(66, 32, 6, 0.56)">
          Попробуйте изменить параметры поиска
        </Text>
        <Button mt="4" variant="outline" size={buttonSize} onClick={onReset}>
          Сбросить фильтры
        </Button>
      </Flex>
    </motion.div>
  );
}
