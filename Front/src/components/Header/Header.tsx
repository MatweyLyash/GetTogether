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
  const isOrganizer = user?.role_id === 2;
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
        {(isOrganizer && isAuthenticated) && (
          <Link to="/scanner" className={styles.navItem}>
            Сканер QR
          </Link>
        )}
        {(isAdmin && isAuthenticated) && (
          <Link to="/admin" className={styles.navItem}>
            Админ. панель
          </Link>
        )}
      </Flex>
      <Box className={styles.mobileMenu}>
        <Button
          onClick={handleAuthAction}
          bg="#facc15"
          color="#422006"
          _hover={{ bg: '#eab308', transform: 'scale(1.04)' }}
          _active={{ bg: '#ca8a04' }}
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
        <DrawerContent bg="#fffdf5" color="#422006">
          <DrawerHeader borderBottomWidth="1px" borderColor="rgba(234, 179, 8, 0.18)">Меню</DrawerHeader>
          <DrawerBody>
            <Flex direction="column" gap="1rem" className={styles.drawerNav}>
              <Link to="/" onClick={onClose} className={styles.drawerLink}>
                Главная
              </Link>
              <Link to="/events" onClick={onClose} className={styles.drawerLink}>
                Мероприятия
              </Link>
              {isAuthenticated && (
                <Link to="/cabinet" onClick={onClose} className={styles.drawerLink}>
                  Личный кабинет
                </Link>
              )}
              {isOrganizer && isAuthenticated && (
                <Link to="/scanner" onClick={onClose} className={styles.drawerLink}>
                  Сканер QR
                </Link>
              )}
              {isAdmin && isAuthenticated && (
                <Link to="/admin" onClick={onClose} className={styles.drawerLink}>
                  Админ. панель
                </Link>
              )}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Modal isOpen={isLogoutModalOpen} onClose={onLogoutModalClose}>
        <ModalOverlay />
        <ModalContent bg="#fffdf5" color="#422006" border="1px solid rgba(234, 179, 8, 0.18)" borderRadius="2rem">
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
              onClick={handleLogout}
              bg="#facc15"
              color="#422006"
              _hover={{ bg: '#eab308' }}
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