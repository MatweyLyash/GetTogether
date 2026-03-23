import { FormControl, FormLabel, Flex, Badge } from '@chakra-ui/react';
import { Tag } from '../../api/api';

interface TagsFilterProps {
  tags: Tag[];
  selectedTags: number[];
  onToggleTag: (tagId: number) => void;
}

/**
 * Tags selection with badges
 */
export function TagsFilter({ tags, selectedTags, onToggleTag }: TagsFilterProps) {
  return (
    <FormControl>
      <FormLabel fontSize="sm">Теги</FormLabel>
      <Flex flexWrap="wrap" gap="0.5rem">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            px={2}
            py={1}
            borderRadius="md"
            cursor="pointer"
            colorScheme={selectedTags.includes(tag.id) ? 'blue' : 'gray'}
            onClick={() => onToggleTag(tag.id)}
          >
            {tag.name}
          </Badge>
        ))}
      </Flex>
    </FormControl>
  );
}
