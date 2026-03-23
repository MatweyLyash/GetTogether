import { motion } from 'framer-motion';
import { Box, Heading, Text, Button, VStack, useBreakpointValue } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import styles from './Home.module.scss';

interface RegistrationCTAProps {
  subHeadingSize?: string;
}

/**
 * Call-to-action for unauthenticated users to register
 */
export function RegistrationCTA({ subHeadingSize }: RegistrationCTAProps) {
  const buttonSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const headingSize = subHeadingSize || { base: 'md', md: 'lg' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
    >
      <Box
        className={styles.cta}
        p={{ base: 6, md: 10 }}
        textAlign="center"
        bgGradient="linear(135deg, rgba(254, 249, 195, 0.95) 0%, rgba(255, 255, 255, 0.96) 100%)"
        borderRadius="2xl"
        border="1px solid rgba(234, 179, 8, 0.18)"
        boxShadow="0 22px 38px rgba(140, 91, 14, 0.1)"
      >
        <VStack spacing={4}>
          <Heading as="h3" size={headingSize}>
            Присоединяйтесь к клубу хороших встреч
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color="rgba(66, 32, 6, 0.72)" maxW="560px">
            Создавайте уютные события, находите новых знакомых рядом и собирайте своё маленькое сообщество вокруг любимого дела.
          </Text>
          <Link to="/login">
            <Button
              bg="#facc15"
              color="#422006"
              _hover={{ bg: '#eab308', transform: 'scale(1.05)' }}
              _active={{ transform: 'translateY(0)' }}
              size={buttonSize}
              borderRadius="999px"
              boxShadow="0 16px 28px rgba(140, 91, 14, 0.16)"
              transition="all 0.2s"
              px={8}
            >
              Зарегистрироваться
            </Button>
          </Link>
        </VStack>
      </Box>
    </motion.div>
  );
}
