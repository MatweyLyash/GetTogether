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
      <Badge colorScheme="blue" mb={2}>
        {category.category_name}
      </Badge>
      {tags && tags.length > 0 && (
        <Flex flexWrap="wrap" gap={2} mb={2}>
          {tags.map((tag) => (
            <Badge key={tag.id} colorScheme="purple">
              {tag.name}
            </Badge>
          ))}
        </Flex>
      )}
    </Box>
  );
}
