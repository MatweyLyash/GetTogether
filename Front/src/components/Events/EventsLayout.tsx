import { ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import styles from './Events.module.scss';

interface EventsLayoutProps {
  children: ReactNode;
}

/**
 * Main layout wrapper for Events page
 */
export function EventsLayout({ children }: EventsLayoutProps) {
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
