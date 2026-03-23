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
      bgGradient="linear(135deg, #E7EBFC 0%, #FEFEFE 50%, #E7EBFC 100%)"
      position="relative"
      overflow="hidden"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <VStack spacing={{ base: 4, md: 6 }} align="center">
          <Heading
            as="h1"
            size={headingSize}
            textAlign="center"
            bgGradient="linear(to-r, #2E4FD7, #5A7AE8)"
            bgClip="text"
          >
            Найдите своё следующее приключение
          </Heading>
          <Text
            fontSize={{ base: 'md', md: 'lg' }}
            color="gray.600"
            textAlign="center"
            maxW="600px"
          >
            Концерты, мастер-классы, вечеринки — всё в одном месте с GetTogether
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
                bg="white"
                borderRadius="lg"
                borderColor="gray.200"
                _hover={{ borderColor: '#2E4FD7' }}
                _focus={{ borderColor: '#2E4FD7', boxShadow: '0 0 0 1px #2E4FD7' }}
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
                bg="white"
                borderRadius="lg"
                borderColor="gray.200"
                _hover={{ borderColor: '#2E4FD7' }}
                _focus={{ borderColor: '#2E4FD7', boxShadow: '0 0 0 1px #2E4FD7' }}
              />
            </InputGroup>
            <Button
              bg="#2E4FD7"
              color="white"
              _hover={{ bg: '#1e3fa9', transform: 'translateY(-2px)' }}
              _active={{ transform: 'translateY(0)' }}
              size={buttonSize}
              onClick={onSearch}
              leftIcon={<SearchIcon />}
              borderRadius="lg"
              transition="all 0.2s"
              boxShadow="md"
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
