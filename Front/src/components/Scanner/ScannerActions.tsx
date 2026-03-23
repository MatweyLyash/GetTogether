import { Button, Spinner, Box } from '@chakra-ui/react';

interface ScannerActionsProps {
  onReset: () => void;
  isLoading: boolean;
  showReset: boolean;
}

/**
 * Scanner action buttons (reset/scan next)
 */
export function ScannerActions({ onReset, isLoading, showReset }: ScannerActionsProps) {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  if (showReset) {
    return (
      <Button colorScheme="blue" size="lg" onClick={onReset}>
        Сканировать следующий
      </Button>
    );
  }

  return null;
}
