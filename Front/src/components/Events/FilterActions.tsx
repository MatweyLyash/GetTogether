import { Button, VStack } from '@chakra-ui/react';

interface FilterActionsProps {
  onApply: () => void;
  onReset: () => void;
  isLoading: boolean;
  hasFilters: boolean;
  buttonSize?: 'sm' | 'md' | 'lg';
}

/**
 * Apply and Reset filter buttons
 */
export function FilterActions({
  onApply,
  onReset,
  isLoading,
  hasFilters,
  buttonSize = 'md',
}: FilterActionsProps) {
  return (
    <VStack spacing={2} pt="1rem">
      <Button
        bg="#2E4FD7"
        color="white"
        _hover={{ bg: '#1e3fa9' }}
        size={buttonSize}
        width="100%"
        onClick={onApply}
        isDisabled={isLoading}
      >
        Применить фильтры
      </Button>
      <Button
        variant="outline"
        colorScheme="blue"
        size={buttonSize}
        width="100%"
        onClick={onReset}
        isDisabled={isLoading || !hasFilters}
      >
        Сбросить
      </Button>
    </VStack>
  );
}
