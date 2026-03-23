import { Stat, StatLabel, StatNumber, HStack } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface EventStatItemProps {
  icon: ReactNode;
  label: string;
  value: string | number;
}

/**
 * Single stat item (date, location, capacity, price)
 */
export function EventStatItem({ icon, label, value }: EventStatItemProps) {
  return (
    <Stat>
      <HStack align="center">
        {icon}
        <StatLabel>{label}</StatLabel>
      </HStack>
      <StatNumber fontSize="md">{value}</StatNumber>
    </Stat>
  );
}
