import { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import styles from './Auth.module.scss';

interface AuthContainerProps {
  children: ReactNode;
}

/**
 * Container component for authentication pages (Login, Register, etc.)
 * Provides consistent layout and styling
 */
export function AuthContainer({ children }: AuthContainerProps) {
  return (
    <Box className={styles.container}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
        `}
      </style>
      {children}
    </Box>
  );
}
