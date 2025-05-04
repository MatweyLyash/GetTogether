import { Box, Flex, Text, Button, useDisclosure } from '@chakra-ui/react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';
import { logout } from '../../api/api';
import styles from './Header.module.scss';

function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isAuthenticated, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      try {
        await logout();
        setIsAuthenticated(false);
        navigate('/');
      } catch (error: any) {
        console.error('Ошибка при выходе:', error.message);
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <Box as="header" className={styles.headerContainer}>
      <Text className={styles.logo}>GetTogether</Text>
      <Flex as="nav" className={styles.nav}>
        <Link to="/" className={styles.navItem}>
          Главная
        </Link>
        <Link to="/events" className={styles.navItem}>
          Мероприятия
        </Link>
        {isAuthenticated && (
          <Link to="/cabinet" className={styles.navItem}>
            Личный кабинет
          </Link>
        )}
      </Flex>
      <Box className={styles.mobileMenu}>
        <Button
          onClick={handleAuthAction}
          bg="#2E4FD7"
          color="white"
          _hover={{ bg: '#1e3fa9' }}
          _active={{ bg: '#15307a' }}
          size={{ base: 'md', md: 'lg' }}
          className={styles.authButton}
        >
          {isAuthenticated ? 'Выйти' : 'Войти'}
        </Button>
        <Box className={styles.wrapHamburger}>
          <Button className={styles.hamburger} onClick={onOpen}>
            ☰
          </Button>
        </Box>
      </Box>
      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Меню</DrawerHeader>
          <DrawerBody>
            <Flex direction="column" gap="1rem">
              <Link to="/" onClick={onClose}>
                Главная
              </Link>
              <Link to="/events" onClick={onClose}>
                Мероприятия
              </Link>
              {isAuthenticated && (
                <Link to="/cabinet" onClick={onClose}>
                  Личный кабинет
              </Link>
              )}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default Header;