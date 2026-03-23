import { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import styles from './Cabinet.module.scss';

interface CabinetLayoutProps {
  children: ReactNode;
}

/**
 * Main layout wrapper for Cabinet page
 */
export function CabinetLayout({ children }: CabinetLayoutProps) {
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
