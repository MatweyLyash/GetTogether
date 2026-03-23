import { Alert, AlertIcon, AlertTitle, AlertDescription, Text } from '@chakra-ui/react';
import { VerificationResponse } from '../../api/api';

interface ScanResultProps {
  result: VerificationResponse;
}

/**
 * Displays successful scan result with participant and event details
 */
export function ScanResult({ result }: ScanResultProps) {
  return (
    <Alert
      status="success"
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
        Доступ разрешен!
      </AlertTitle>
      <AlertDescription maxWidth="sm">
        <Text fontWeight="bold">Участник: {result.user}</Text>
        <Text>Мероприятие: {result.event}</Text>
        <Text>Дата: {new Date(result.date).toLocaleDateString()}</Text>
        <Text color="green.600" fontWeight="bold" mt={2}>
          {result.status}
        </Text>
      </AlertDescription>
    </Alert>
  );
}
