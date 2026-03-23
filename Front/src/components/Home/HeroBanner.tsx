import { motion } from 'framer-motion';
import {
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import styles from './Home.module.scss';

interface HeroBannerProps {
  searchQueryByTitle: string;
  searchQueryByLocation: string;
  onSearchTitleChange: (value: string) => void;
  onSearchLocationChange: (value: string) => void;
  onSearch: () => void;
}

/**
 * Hero banner with search functionality
 */
export function HeroBanner({
  searchQueryByTitle,
  searchQueryByLocation,
  onSearchTitleChange,
  onSearchLocationChange,
  onSearch,
}: HeroBannerProps) {
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl', lg: '2xl' });
  const buttonSize = useBreakpointValue({ base: 'md', md: 'lg' });

  return (
    <Box
      className={styles.banner}
      bgGradient="linear(135deg, rgba(255, 249, 195, 0.96) 0%, rgba(255, 255, 255, 0.92) 48%, rgba(254, 243, 199, 0.95) 100%)"
      position="relative"
      overflow="hidden"
      border="1px solid"
      borderColor="rgba(234, 179, 8, 0.18)"
    >
      <Box position="absolute" top="-28px" left="-24px" w="132px" h="132px" bg="rgba(250, 204, 21, 0.22)" borderRadius="full" />
      <Box position="absolute" bottom="-44px" right="8%" w="160px" h="160px" bg="rgba(251, 191, 36, 0.14)" borderRadius="full" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: 'spring', stiffness: 110, damping: 16 }}
      >
        <VStack spacing={{ base: 4, md: 6 }} align="center">
          <Text
            px={4}
            py={2}
            borderRadius="full"
            bg="rgba(255,255,255,0.75)"
            border="1px solid rgba(234, 179, 8, 0.16)"
            fontWeight="600"
            color="rgba(66, 32, 6, 0.72)"
          >
            Солнечные встречи по интересам
          </Text>
          <Heading
            as="h1"
            size={headingSize}
            textAlign="center"
            color="#422006"
            letterSpacing="-0.06em"
            maxW="760px"
          >
            Найдите компанию для тёплого выходного, хобби и простых радостей в городе
          </Heading>
          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            color="rgba(66, 32, 6, 0.72)"
            textAlign="center"
            maxW="600px"
          >
            Ярмарки, киновечера, клубы по интересам и мастер-классы без официоза. Просто люди, район и хороший повод встретиться.
          </Text>
          <Flex
            gap={{ base: 3, md: 4 }}
            flexDir={{ base: 'column', md: 'row' }}
            w="100%"
            maxW="700px"
            mt={2}
          >
            <InputGroup size={buttonSize} flex={1}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Поиск по названию"
                value={searchQueryByTitle}
                onChange={(e) => onSearchTitleChange(e.target.value)}
                bg="rgba(255,255,255,0.9)"
                borderRadius="999px"
                borderColor="rgba(234, 179, 8, 0.18)"
                _hover={{ borderColor: '#eab308' }}
                _focus={{ borderColor: '#eab308', boxShadow: '0 0 0 3px rgba(250, 204, 21, 0.24)' }}
              />
            </InputGroup>
            <InputGroup size={buttonSize} flex={1}>
              <InputLeftElement pointerEvents="none">
                <Icon viewBox="0 0 24 24" color="gray.400">
                  <path
                    fill="currentColor"
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  />
                </Icon>
              </InputLeftElement>
              <Input
                placeholder="Поиск по месту"
                value={searchQueryByLocation}
                onChange={(e) => onSearchLocationChange(e.target.value)}
                bg="rgba(255,255,255,0.9)"
                borderRadius="999px"
                borderColor="rgba(234, 179, 8, 0.18)"
                _hover={{ borderColor: '#eab308' }}
                _focus={{ borderColor: '#eab308', boxShadow: '0 0 0 3px rgba(250, 204, 21, 0.24)' }}
              />
            </InputGroup>
            <Button
              bg="#facc15"
              color="#422006"
              _hover={{ bg: '#eab308', transform: 'scale(1.05)' }}
              _active={{ transform: 'translateY(0)' }}
              size={buttonSize}
              onClick={onSearch}
              leftIcon={<SearchIcon />}
              borderRadius="999px"
              transition="all 0.25s"
              boxShadow="0 16px 28px rgba(140, 91, 14, 0.16)"
              minW={{ base: 'full', md: '120px' }}
            >
              Поиск
            </Button>
          </Flex>
        </VStack>
      </motion.div>
    </Box>
  );
}
