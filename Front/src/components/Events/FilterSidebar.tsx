import { ReactNode } from 'react';
import {
  Box,
  Heading,
  Collapse,
  HStack,
  IconButton,
  VStack,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import styles from './Events.module.scss';

interface FilterSidebarProps {
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  title?: string;
}

export function FilterSidebar({
  children,
  isOpen,
  onToggle,
  title = 'Фильтры',
}: FilterSidebarProps) {
  return (
    <Box className={styles.filterSidebar}>
      <HStack
        justify="space-between"
        mb={isOpen ? '1rem' : 0}
        cursor="pointer"
        onClick={onToggle}
      >
        <Heading size="md">{title}</Heading>
        <IconButton
          aria-label="Toggle filters"
          icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          variant="ghost"
          size="sm"
        />
      </HStack>

      <Collapse in={isOpen} animateOpacity>
        <VStack spacing="1rem" align="stretch">
          {children}
        </VStack>
      </Collapse>
    </Box>
  );
}
