import { Text } from '@chakra-ui/react';

interface PasswordRequirementsProps {
  password: string;
}

/**
 * Displays password requirements hint
 */
export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasDigit = /\d/.test(password);

  const isValid = hasMinLength && hasLetter && hasDigit;

  return (
    <Text
      fontSize="xs"
      color={isValid ? 'green.500' : 'gray.500'}
      mt={1}
    >
      Минимум 8 символов, включая буквы латиницы и цифры
    </Text>
  );
}
