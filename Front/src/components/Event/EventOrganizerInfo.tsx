import { Box, Heading, Avatar, Flex, Text } from '@chakra-ui/react';
import { SubscribeButton } from '../SubscribeButton/SubscribeButton';

interface Organizer {
  id: string;
  login: string;
  telegram?: string | null;
}

interface EventOrganizerInfoProps {
  title: string;
  organizer: Organizer;
  isAuthenticated: boolean;
  isOrganizer: boolean;
}

/**
 * Event title and organizer info with subscribe buttons
 */
export function EventOrganizerInfo({
  title,
  organizer,
  isAuthenticated,
  isOrganizer,
}: EventOrganizerInfoProps) {
  return (
    <Box>
      <Heading size="xl" mb={2}>
        {title}
      </Heading>
      <Flex align="center" mb={2}>
        <Avatar size="sm" name={organizer.login} mr={2} />
        <Text fontWeight="medium">{organizer.login}</Text>
      </Flex>
      {isAuthenticated && !isOrganizer && (
        <Flex gap={2} mt={2} flexWrap="wrap" direction={{ base: 'column', sm: 'row' }}>
          <SubscribeButton
            subscriptionType="organizer"
            targetId={Number(organizer.id)}
            targetName={organizer.login}
            size="sm"
            variant="outline"
          />
          <SubscribeButton
            subscriptionType="category"
            targetId={0}
            targetName="Category"
            size="sm"
            variant="solid"
          />
        </Flex>
      )}
    </Box>
  );
}
