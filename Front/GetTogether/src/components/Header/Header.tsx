import { useState } from 'react';
import { Box, Flex, Text, Button, useDisclosure } from '@chakra-ui/react';
import { Drawer, DrawerBody,  DrawerHeader, DrawerOverlay, DrawerContent } from "@chakra-ui/react";
import { Link } from 'react-router-dom';
import styles from './Header.module.scss';

function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Заглушка

  return (
    <Box as="header" className={styles.headerContainer}>
      <Text className={styles.logo}>GetTogether</Text>
      <Flex as="nav" className={styles.nav}>
        <Link to="/" className={styles.navItem}>Главная</Link>
        <Link to="/events" className={styles.navItem}>Мероприятия</Link>
        {isAuthenticated && <Link to="/cabinet" className={styles.navItem}>Личный кабинет</Link>}
      </Flex>
      <Box className={styles.mobileMenu}>
        <Button
                onClick={() => setIsAuthenticated(!isAuthenticated)}
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
            <Button className={styles.hamburger} onClick={onOpen}>☰</Button>
        </Box>
      </Box>
      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Меню</DrawerHeader>
          <DrawerBody>
            <Flex direction="column" gap="1rem">
              <Link to="/" onClick={onClose}>Главная</Link>
              <Link to="/events" onClick={onClose}>Мероприятия</Link>
              {isAuthenticated && <Link to="/cabinet" onClick={onClose}>Личный кабинет</Link>}
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}

export default Header;