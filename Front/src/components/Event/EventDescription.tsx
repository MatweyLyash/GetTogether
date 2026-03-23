import { Box, Heading, Text } from '@chakra-ui/react';

interface EventDescriptionProps {
  description: string;
}

/**
 * Event description section
 */
export function EventDescription({ description }: EventDescriptionProps) {
  return (
    <Box>
      <Heading size="md" mb={2}>
        Описание
      </Heading>
      <Text whiteSpace="pre-line">{description}</Text>
    </Box>
  );
}
