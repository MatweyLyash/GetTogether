import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react';

interface ScanErrorProps {
  error: string;
}

/**
 * Displays scan error message
 */
export function ScanError({ error }: ScanErrorProps) {
  return (
    <Alert
      status="error"
      variant="subtle"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      height="200px"
      borderRadius="md"
    >
      <AlertIcon boxSize="40px" mr={0} />
      <AlertTitle mt={4} mb={1} fontSize="lg">
        Ошибка проверки
      </AlertTitle>
      <AlertDescription maxWidth="sm">{error}</AlertDescription>
    </Alert>
  );
}
