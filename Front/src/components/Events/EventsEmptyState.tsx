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
        bg="#F7F9FC"
        borderRadius="md"
      >
        <Text fontSize={{ base: 'lg', md: 'xl' }} color="gray.600" mb="2">
          Мероприятия не найдены
        </Text>
        <Text fontSize="sm" color="gray.500">
          Попробуйте изменить параметры поиска
        </Text>
        <Button mt="4" variant="outline" colorScheme="blue" size={buttonSize} onClick={onReset}>
          Сбросить фильтры
        </Button>
      </Flex>
    </motion.div>
  );
}
