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
import { PasswordRequirements } from './PasswordRequirements';

interface RegisterFormProps {
  onSubmit: (login: string, password: string, confirmPassword: string) => Promise<void>;
  isLoading?: boolean;
}

/**
 * Registration form with login, password, and password confirmation
 */
export function RegisterForm({ onSubmit, isLoading = false }: RegisterFormProps) {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const toast = useToast();

  const validatePassword = (pass: string): boolean => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(pass);
  };

  const handleSubmit = async () => {
    if (!loginInput || !password || !confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!validatePassword(password)) {
      toast({
        title: 'Ошибка',
        description: 'Пароль должен содержать минимум 8 символов, включая буквы латиницы и цифры',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    await onSubmit(loginInput, password, confirmPassword);
  };

  return (
    <Box>
      <motion.div
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
          <PasswordRequirements password={password} />
        </FormControl>
        <FormControl mb="1rem">
          <FormLabel>Подтверждение пароля</FormLabel>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Повторите пароль"
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
          Зарегистрироваться
        </Button>
      </motion.div>
    </Box>
  );
}
