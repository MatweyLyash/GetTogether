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
    <Flex mb="1.5rem" justify="center" gap="1rem">
      <Button
        variant={activeTab === 'login' ? 'solid' : 'ghost'}
        bg={activeTab === 'login' ? '#2E4FD7' : 'transparent'}
        color={activeTab === 'login' ? 'white' : '#2E4FD7'}
        _hover={{ bg: activeTab === 'login' ? '#1e3fa9' : '#E7EBFC' }}
        onClick={() => onTabChange('login')}
      >
        Вход
      </Button>
      <Button
        variant={activeTab === 'register' ? 'solid' : 'ghost'}
        bg={activeTab === 'register' ? '#2E4FD7' : 'transparent'}
        color={activeTab === 'register' ? 'white' : '#2E4FD7'}
        _hover={{ bg: activeTab === 'register' ? '#1e3fa9' : '#E7EBFC' }}
        onClick={() => onTabChange('register')}
      >
        Регистрация
      </Button>
    </Flex>
  );
}
