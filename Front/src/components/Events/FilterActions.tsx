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
        bg="#facc15"
        color="#422006"
        _hover={{ bg: '#eab308', transform: 'scale(1.03)' }}
        size={buttonSize}
        width="100%"
        onClick={onApply}
        isDisabled={isLoading}
      >
        Применить фильтры
      </Button>
      <Button
        variant="outline"
        size={buttonSize}
        width="100%"
        onClick={onReset}
        isDisabled={isLoading || !hasFilters}
        borderColor="rgba(234, 179, 8, 0.22)"
      >
        Сбросить
      </Button>
    </VStack>
  );
}
