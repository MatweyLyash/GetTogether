import { Box, HStack, VStack, Text } from '@chakra-ui/react';
import { FaTelegram } from 'react-icons/fa';

interface TelegramChatLinkProps {
  inviteLink: string;
}

/**
 * Telegram chat link section
 */
export function TelegramChatLink({ inviteLink }: TelegramChatLinkProps) {
  return (
    <Box bg="blue.50" p={4} borderRadius="md">
      <HStack>
        <FaTelegram size={24} color="#0088cc" />
        <VStack align="start" spacing={1}>
          <Text fontWeight="bold">Telegram-чат мероприятия</Text>
          <Text>
            <a
              href={inviteLink}
              target="_blank"
              rel="noreferrer"
              style={{ color: '#0088cc' }}
            >
              Присоединиться к чату
            </a>
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
}
