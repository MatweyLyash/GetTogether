import { Box, Flex, Text, Button, useDisclosure } from '@chakra-ui/react';
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext/AuthContext';
import { logout } from '../../api/api';
import styles from './Header.module.scss';

function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isLogoutModalOpen, 
    onOpen: onLogoutModalOpen, 
    onClose: onLogoutModalClose 
  } = useDisclosure();
  const { user, isAuthenticated, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    if (isAuthenticated) {
      onLogoutModalOpen();
    } else {
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsAuthenticated(false);
      onLogoutModalClose();
      navigate('/');
    } catch (error: any) {
      console.error('Ошибка при выходе:', error.message);
    }
  };

  const isAdmin = user?.role_id === 3;
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
        {(isAdmin && isAuthenticated) && (
          <Link to="/admin" className={styles.navItem}>
            Админка
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
              {isAdmin && isAuthenticated && (
                <Link to="/admin" onClick={onClose}>
                  Админка
                </Link>
              )}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Modal isOpen={isLogoutModalOpen} onClose={onLogoutModalClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Подтверждение выхода</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Вы уверены, что хотите выйти из аккаунта?
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onLogoutModalClose}>
              Отмена
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleLogout}
              bg="#2E4FD7"
              _hover={{ bg: '#1e3fa9' }}
            >
              Выйти
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default Header;