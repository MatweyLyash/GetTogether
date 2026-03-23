import { Box, Badge, Flex } from '@chakra-ui/react';
import { Tag } from '../../api/api';

interface EventTagsProps {
  category: {
    id: string;
    category_name: string;
  };
  tags?: Tag[];
}

/**
 * Event category and tags display
 */
export function EventTags({ category, tags }: EventTagsProps) {
  return (
    <Box mb={2}>
      <Badge bg="#fff7d6" color="#422006" borderRadius="full" px={3} py={1} mb={2}>
        {category.category_name}
      </Badge>
      {tags && tags.length > 0 && (
        <Flex flexWrap="wrap" gap={2} mb={2}>
          {tags.map((tag) => (
            <Badge key={tag.id} bg="rgba(255,255,255,0.8)" color="#7c4a19" borderRadius="full" px={3} py={1} border="1px solid rgba(234, 179, 8, 0.12)">
              {tag.name}
            </Badge>
          ))}
        </Flex>
      )}
    </Box>
  );
}
