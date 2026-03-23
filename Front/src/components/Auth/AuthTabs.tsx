import { Button, Flex } from '@chakra-ui/react';

type AuthTab = 'login' | 'register';

interface AuthTabsProps {
  activeTab: AuthTab;
  onTabChange: (tab: AuthTab) => void;
}

/**
 * Tab switcher for Login/Register forms
 */
export function AuthTabs({ activeTab, onTabChange }: AuthTabsProps) {
  return (
    <Flex mb="1.5rem" justify="center" gap="0.5rem" p="0.35rem" bg="rgba(255,255,255,0.72)" border="1px solid rgba(234, 179, 8, 0.16)" borderRadius="full">
      <Button
        variant={activeTab === 'login' ? 'solid' : 'ghost'}
        bg={activeTab === 'login' ? '#facc15' : 'transparent'}
        color="#422006"
        _hover={{ bg: activeTab === 'login' ? '#eab308' : '#fff7d6' }}
        borderRadius="full"
        onClick={() => onTabChange('login')}
      >
        Вход
      </Button>
      <Button
        variant={activeTab === 'register' ? 'solid' : 'ghost'}
        bg={activeTab === 'register' ? '#facc15' : 'transparent'}
        color="#422006"
        _hover={{ bg: activeTab === 'register' ? '#eab308' : '#fff7d6' }}
        borderRadius="full"
        onClick={() => onTabChange('register')}
      >
        Регистрация
      </Button>
    </Flex>
  );
}
