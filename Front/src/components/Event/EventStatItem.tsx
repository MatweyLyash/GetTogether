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
    <Stat bg="rgba(255,255,255,0.72)" border="1px solid rgba(234, 179, 8, 0.16)" borderRadius="1.5rem" p="1rem">
      <HStack align="center">
        {icon}
        <StatLabel color="rgba(66, 32, 6, 0.62)">{label}</StatLabel>
      </HStack>
      <StatNumber fontSize="md" color="#422006">{value}</StatNumber>
    </Stat>
  );
}
