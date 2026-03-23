import { Box } from '@chakra-ui/react';

interface EventPriceBadgeProps {
  price: number | string;
}

/**
 * Price badge overlay on event image
 */
export function EventPriceBadge({ price }: EventPriceBadgeProps) {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  const displayPrice = typeof price === 'string' ? price : `${price} BYN`;

  return (
    <Box
      position="absolute"
      top={4}
      right={4}
      zIndex={2}
      bgGradient="linear(90deg, #ffe066 60%, #fffbe6 100%)"
      color="#422006"
      fontWeight={700}
      fontSize="1.1rem"
      px={5}
      py={2}
      borderRadius="1.2rem"
      boxShadow="0 12px 24px rgba(140, 91, 14, 0.14)"
      border="2px solid #fffbe6"
      whiteSpace="nowrap"
    >
      {numericPrice > 0 ? displayPrice : 'Бесплатно'}
    </Box>
  );
}
