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
        bgGradient="linear(135deg, #E7EBFC 0%, #D5DFFB 100%)"
        borderRadius="xl"
      >
        <VStack spacing={4}>
          <Heading as="h3" size={headingSize}>
            Присоединяйтесь к GetTogether!
          </Heading>
          <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600" maxW="500px">
            Создавайте и посещайте уникальные события
          </Text>
          <Link to="/login">
            <Button
              bg="#2E4FD7"
              color="white"
              _hover={{ bg: '#1e3fa9', transform: 'translateY(-2px)' }}
              _active={{ transform: 'translateY(0)' }}
              size={buttonSize}
              borderRadius="lg"
              boxShadow="md"
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
