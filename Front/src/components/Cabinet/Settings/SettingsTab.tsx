import { useState } from 'react';
import {
  TabPanel,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  HStack,
  useBreakpointValue,
  Badge,
} from '@chakra-ui/react';
import { TelegramLinkGuideModal } from '../../TelegramLinkGuideModal/TelegramLinkGuideModal';

interface SettingsTabProps {
  userTelegram: string | null;
  isLoading: boolean;
  onLinkTelegram: (telegram: string) => Promise<void>;
}

export function SettingsTab({
  userTelegram,
  isLoading,
  onLinkTelegram,
}: SettingsTabProps) {
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const [telegram, setTelegram] = useState('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  const handleSubmit = async () => {
    if (!telegram.startsWith('@')) {
      alert('Telegram должен начинаться с @');
      return;
    }
    await onLinkTelegram(telegram);
    setTelegram('');
  };

  return (
    <TabPanel px={0}>
      <VStack spacing="6" align="stretch" w="100%">
        <Heading size="lg">Настройки</Heading>

        <FormControl>
          <FormLabel>Привязать Telegram</FormLabel>
          <HStack spacing={3}>
            <Input
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="@username"
              bg="white"
              size={buttonSize}
              flex={1}
            />
            <Button
              bg="#2E4FD7"
              color="white"
              _hover={{ bg: '#1e3fa9' }}
              size={buttonSize}
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              Привязать
            </Button>
          </HStack>
          <Text fontSize="sm" color="gray.600" mt={2}>
            Введите ваш Telegram username для получения уведомлений
          </Text>
        </FormControl>

        {userTelegram && (
          <VStack p="4" bg="green.50" borderRadius="md" align="stretch">
            <Text fontWeight="bold">Ваш Telegram привязан:</Text>
            <Badge colorScheme="green" fontSize="md" w="fit-content">
              {userTelegram}
            </Badge>
          </VStack>
        )}

        <Button
          variant="outline"
          colorScheme="blue"
          size={buttonSize}
          onClick={() => setIsGuideOpen(true)}
        >
          Как привязать Telegram?
        </Button>

        <TelegramLinkGuideModal
          isOpen={isGuideOpen}
          onClose={() => setIsGuideOpen(false)}
        />
      </VStack>
    </TabPanel>
  );
}
