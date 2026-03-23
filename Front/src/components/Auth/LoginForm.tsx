import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

interface LoginFormProps {
  onSubmit: (login: string, password: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Login form with username and password fields
 */
export function LoginForm({ onSubmit, isLoading = false }: LoginFormProps) {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const toast = useToast();

  const handleSubmit = async () => {
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

    await onSubmit(loginInput, password);
  };

  return (
    <Box>
      <motion.div
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
            bg="rgba(255,255,255,0.92)"
          />
        </FormControl>
        <FormControl mb="1rem">
          <FormLabel>Пароль</FormLabel>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            bg="rgba(255,255,255,0.92)"
          />
        </FormControl>
        <Button
          bg="#facc15"
          color="#422006"
          _hover={{ bg: '#eab308' }}
          _active={{ bg: '#ca8a04' }}
          w="100%"
          isLoading={isLoading}
          onClick={handleSubmit}
        >
          Войти
        </Button>
      </motion.div>
    </Box>
  );
}
