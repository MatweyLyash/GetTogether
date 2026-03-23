import { motion } from 'framer-motion';
import { Box, Heading, SimpleGrid, Skeleton, Text, useBreakpointValue } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import styles from './Home.module.scss';

interface Category {
  id: number;
  category_name: string;
}

interface CategoriesGridProps {
  categories: Category[];
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/**
 * Grid of category cards
 */
export function CategoriesGrid({ categories, isLoading }: CategoriesGridProps) {
  const subHeadingSize = useBreakpointValue({ base: 'md', md: 'lg' });
  const categoryColumns = useBreakpointValue({ base: 2, sm: 3, md: 4 });

  return (
    <Box className={styles.categories}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Heading as="h3" size={subHeadingSize} mb={4}>
          Популярные категории
        </Heading>
        {isLoading ? (
          <SimpleGrid columns={categoryColumns} spacing={4}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} height="60px" borderRadius="lg" />
            ))}
          </SimpleGrid>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <SimpleGrid columns={categoryColumns} spacing={4}>
              {categories.map((cat) => (
                <motion.div
                  key={cat.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link to="/events" state={{ category: String(cat.id) }}>
                    <Box
                      bg="rgba(255,255,255,0.86)"
                      p={4}
                      borderRadius="2xl"
                      boxShadow="0 16px 28px rgba(140, 91, 14, 0.08)"
                      textAlign="center"
                      border="1px solid"
                      borderColor="rgba(234, 179, 8, 0.16)"
                      _hover={{
                        boxShadow: '0 22px 34px rgba(140, 91, 14, 0.12)',
                        borderColor: '#eab308',
                        bg: '#fff7d6',
                      }}
                      transition="all 0.2s"
                      transform={cat.id % 2 === 0 ? 'rotate(-1deg)' : 'rotate(1deg)'}
                    >
                      <Text fontWeight="700" color="#422006">
                        {cat.category_name}
                      </Text>
                    </Box>
                  </Link>
                </motion.div>
              ))}
            </SimpleGrid>
          </motion.div>
        )}
      </motion.div>
    </Box>
  );
}
