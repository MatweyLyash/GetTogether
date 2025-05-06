import { Box, Heading, Text, Button, VStack, Image } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import notFoundImage from '../../assets/notFound.jpg';
function NotFound() {
  return (
    <Box minHeight="100vh" display="flex" flexDirection="column">
      <Header />
      <Box flex="1" display="flex" alignItems="center" justifyContent="center" py={10} px={4}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={6} textAlign="center" maxW="600px">
            <Heading as="h1" size="2xl" color="#2E4FD7">
              404
            </Heading>
            <Heading as="h2" size="xl">
              Страница не найдена
            </Heading>
            <Text fontSize="lg">
              Кажется, вы попали на несуществующую страницу. Возможно, она была перемещена или удалена.
            </Text>
            <Box my={6}>
              <Image
                src={notFoundImage}
                alt="404 Not Found"
                boxSize="300px"
                objectFit="contain"
              />
            </Box>
            <Button
              as={Link}
              to="/"
              bg="#2E4FD7"
              color="white"
              _hover={{ bg: '#1e3fa9' }}
              size="lg"
            >
              Вернуться на главную
            </Button>
          </VStack>
        </motion.div>
      </Box>
      <Footer />
    </Box>
  );
}

export default NotFound; 