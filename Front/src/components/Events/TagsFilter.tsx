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
      <FormLabel fontSize="sm" color="rgba(66, 32, 6, 0.74)" fontWeight="700">Теги</FormLabel>
      <Flex flexWrap="wrap" gap="0.5rem">
        {tags.map((tag) => (
          <Badge
            key={tag.id}
            px={3}
            py={2}
            borderRadius="full"
            cursor="pointer"
            bg={selectedTags.includes(tag.id) ? '#facc15' : 'rgba(255,255,255,0.74)'}
            color="#422006"
            border="1px solid rgba(234, 179, 8, 0.16)"
            onClick={() => onToggleTag(tag.id)}
          >
            {tag.name}
          </Badge>
        ))}
      </Flex>
    </FormControl>
  );
}
