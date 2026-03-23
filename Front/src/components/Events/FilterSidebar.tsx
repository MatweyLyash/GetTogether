import { ReactNode } from 'react';
import {
  Box,
  Heading,
  VStack,
  Collapse,
  HStack,
  IconButton,
  useBreakpointValue,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import styles from './Events.module.scss';

interface FilterSidebarProps {
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  title?: string;
}

/**
 * Filter sidebar with collapsible mobile support
 */
export function FilterSidebar({
  children,
  isOpen,
  onToggle,
  title = 'Фильтры',
}: FilterSidebarProps) {
  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box className={styles.filterSidebar}>
      {isMobile && (
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
      )}

      {!isMobile && (
        <Heading size="md" mb="1rem">
          {title}
        </Heading>
      )}

      <Collapse in={isMobile ? isOpen : true} animateOpacity>
        <VStack spacing="1rem" align="stretch">
          {children}
        </VStack>
      </Collapse>
    </Box>
  );
}
