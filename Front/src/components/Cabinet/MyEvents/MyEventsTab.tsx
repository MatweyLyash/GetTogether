import { TabPanel, VStack, Heading, Divider, useBreakpointValue } from '@chakra-ui/react';
import { FutureEventsList } from './FutureEventsList';
import { PastEventsList } from './PastEventsList';
import { CabinetEventRegistration } from '../types';

interface MyEventsTabProps {
  registrations: CabinetEventRegistration[];
  userId: string;
  onNavigate: (eventId: string) => void;
  onSubmitReview: (eventId: string, rating: number, comment: string) => Promise<void>;
  isLoading: boolean;
}

export function MyEventsTab({
  registrations,
  userId,
  onNavigate,
  onSubmitReview,
  isLoading,
}: MyEventsTabProps) {
  const fontSizeHeading = useBreakpointValue({ base: 'lg', md: 'xl' });

  return (
    <TabPanel px={0}>
      <VStack spacing="6" align="stretch" w="100%">
        <Heading size={fontSizeHeading}>Предстоящие</Heading>
        <FutureEventsList registrations={registrations} onNavigate={onNavigate} />

        <Divider />

        <Heading size={fontSizeHeading}>Прошедшие</Heading>
        <PastEventsList
          registrations={registrations}
          userId={userId}
          onNavigate={onNavigate}
          onSubmitReview={onSubmitReview}
          isLoading={isLoading}
        />
      </VStack>
    </TabPanel>
  );
}
