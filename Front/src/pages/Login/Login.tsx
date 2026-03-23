import { useState, useEffect } from 'react';
import { Box, Heading, Text, useToast } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { register } from '../../api/api';
import { useAuth } from '../../AuthContext/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { AuthContainer } from '../../components/Auth/AuthContainer';
import { AuthTabs } from '../../components/Auth/AuthTabs';
import { LoginForm } from '../../components/Auth/LoginForm';
import { RegisterForm } from '../../components/Auth/RegisterForm';
import styles from './Login.module.scss';

type AuthTab = 'login' | 'register';

function Login() {
  const [tab, setTab] = useState<AuthTab>('login');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, loginUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Redirect after authentication
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPaths: Record<number, string> = {
        1: '/',
        2: '/cabinet',
        3: '/admin',
      };
      navigate(redirectPaths[user.role_id] || '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLoginSubmit = async (login: string, password: string) => {
    setIsLoading(true);
    try {
      await loginUser({ login, password });
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

  const handleRegisterSubmit = async (login: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await register({ login, password });
      toast({
        title: 'Успех',
        description: response.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
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
    <AuthContainer>
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
            <Box
              bg="#FEFEFE"
              p={{ base: '1.5rem', md: '2rem' }}
              borderRadius="md"
              boxShadow="sm"
              maxW="400px"
              w="100%"
            >
              <AuthTabs activeTab={tab} onTabChange={setTab} />
              {tab === 'login' ? (
                <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} />
              ) : (
                <RegisterForm onSubmit={handleRegisterSubmit} isLoading={isLoading} />
              )}
            </Box>
          </motion.div>
        </Box>
      </Box>
      <Footer />
    </AuthContainer>
  );
}

export default Login;
