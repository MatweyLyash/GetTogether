import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/api';
import {  useAuth } from '../../AuthContext/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './Login.module.scss';

function Login() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  // Эффект для перенаправления после успешной авторизации
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role_id) {
        case 1: // Обычный пользователь
          navigate('/');
          break;
        case 2: // Организатор
          navigate('/cabinet');
          break;
        case 3: // Администратор
          navigate('/admin');
          break;
        default:
          navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Обработчик авторизации
  const handleLogin = async () => {
    if (!loginInput || !password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await loginUser({ login: loginInput, password });
      toast({
        title: 'Успех',
        description: 'Вход выполнен',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик регистрации
  const handleRegister = async () => {
    if (!loginInput || !password) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await register({ login: loginInput, password });
      toast({
        title: 'Успех',
        description: response.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setLoginInput('');
      setPassword('');
      setTab('login');
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className={styles.container}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
          body { font-family: 'Inter', sans-serif; }
        `}
      </style>
      <Header />
      <Box className={styles.content}>
        <Box className={styles.formContainer}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Heading as="h1" size={{ base: 'lg', md: 'xl' }} mb="1rem" color="#2E4FD7">
              GetTogether
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} mb="2rem" color="#333">
              Войдите или зарегистрируйтесь, чтобы присоединиться к событиям
            </Text>
            <Box bg="#FEFEFE" p={{ base: '1.5rem', md: '2rem' }} borderRadius="md" boxShadow="sm" maxW="400px" w="100%">
              <Flex mb="1.5rem" justify="center" gap="1rem">
                <Button
                  variant={tab === 'login' ? 'solid' : 'ghost'}
                  bg={tab === 'login' ? '#2E4FD7' : 'transparent'}
                  color={tab === 'login' ? 'white' : '#2E4FD7'}
                  _hover={{ bg: tab === 'login' ? '#1e3fa9' : '#E7EBFC' }}
                  onClick={() => setTab('login')}
                  className={styles.tabButton}
                >
                  Вход
                </Button>
                <Button
                  variant={tab === 'register' ? 'solid' : 'ghost'}
                  bg={tab === 'register' ? '#2E4FD7' : 'transparent'}
                  color={tab === 'register' ? 'white' : '#2E4FD7'}
                  _hover={{ bg: tab === 'register' ? '#1e3fa9' : '#E7EBFC' }}
                  onClick={() => setTab('register')}
                  className={styles.tabButton}
                >
                  Регистрация
                </Button>
              </Flex>
              <AnimatePresence mode="wait">
                {tab === 'login' ? (
                  <Box className={styles.formWrapper}>
                    <motion.div
                      key="login"
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FormControl mb="1rem">
                        <FormLabel>Логин</FormLabel>
                        <Input
                          value={loginInput}
                          onChange={(e) => setLoginInput(e.target.value)}
                          placeholder="Введите логин"
                          bg="#E7EBFC"
                        />
                      </FormControl>
                      <FormControl mb="1rem">
                        <FormLabel>Пароль</FormLabel>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Введите пароль"
                          bg="#E7EBFC"
                        />
                      </FormControl>
                      <Button
                        bg="#2E4FD7"
                        color="white"
                        _hover={{ bg: '#1e3fa9' }}
                        _active={{ bg: '#15307a' }}
                        w="100%"
                        isLoading={isLoading}
                        onClick={handleLogin}
                      >
                        Войти
                      </Button>
                    </motion.div>
                  </Box>
                ) : (
                  <Box className={styles.formWrapper}>
                    <motion.div
                      key="register"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FormControl mb="1rem">
                        <FormLabel>Логин</FormLabel>
                        <Input
                          value={loginInput}
                          onChange={(e) => setLoginInput(e.target.value)}
                          placeholder="Введите логин"
                          bg="#E7EBFC"
                        />
                      </FormControl>
                      <FormControl mb="1rem">
                        <FormLabel>Пароль</FormLabel>
                        <Input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Введите пароль"
                          bg="#E7EBFC"
                        />
                      </FormControl>
                      <Button
                        bg="#2E4FD7"
                        color="white"
                        _hover={{ bg: '#1e3fa9' }}
                        _active={{ bg: '#15307a' }}
                        w="100%"
                        isLoading={isLoading}
                        onClick={handleRegister}
                      >
                        Зарегистрироваться
                      </Button>
                    </motion.div>
                  </Box>
                )}
              </AnimatePresence>
            </Box>
          </motion.div>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
}

export default Login;