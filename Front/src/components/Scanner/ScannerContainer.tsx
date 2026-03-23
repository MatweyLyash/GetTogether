import { ReactNode } from 'react';
import { Box, Container, Heading, Text, VStack } from '@chakra-ui/react';
import styles from './Scanner.module.scss';

interface ScannerContainerProps {
  children: ReactNode;
}

/**
 * Container component for QR Scanner page
 * Provides header, description, and layout
 */
export function ScannerContainer({ children }: ScannerContainerProps) {
  return (
    <Box className={styles.container}>
      <Container maxW="container.md" py={8} minH="70vh">
        <VStack spacing={6} align="stretch">
          <Heading textAlign="center">Сканер QR-кодов</Heading>
          <Text textAlign="center" color="gray.600">
            Наведите камеру на QR-код участника для проверки регистрации
          </Text>
          {children}
        </VStack>
      </Container>
    </Box>
  );
}
