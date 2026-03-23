import { Box, Text, Flex, Badge } from '@chakra-ui/react';
import { Tag } from '../../api/api';

interface ActiveFiltersDisplayProps {
  searchTitle: string;
  searchLocation: string;
  selectedCategory: string;
  categoryNames: Record<string, string>;
  startDate: Date | null;
  endDate: Date | null;
  selectedTags: number[];
  tags: Tag[];
}

/**
 * Displays active filters as badges
 */
export function ActiveFiltersDisplay({
  searchTitle,
  searchLocation,
  selectedCategory,
  categoryNames,
  startDate,
  endDate,
  selectedTags,
  tags,
}: ActiveFiltersDisplayProps) {
  const hasActiveFilters =
    searchTitle || searchLocation || selectedCategory || startDate || endDate || selectedTags.length > 0;

  if (!hasActiveFilters) {
    return null;
  }

  return (
    <Box pt="1rem">
      <Text fontSize="sm" color="gray.600" mb="0.5rem">
        Активные фильтры:
      </Text>
      <Flex flexWrap="wrap" gap="0.5rem">
        {searchTitle && (
          <Badge colorScheme="blue" variant="subtle">
            Название: {searchTitle}
          </Badge>
        )}
        {searchLocation && (
          <Badge colorScheme="green" variant="subtle">
            Локация: {searchLocation}
          </Badge>
        )}
        {selectedCategory && (
          <Badge colorScheme="purple" variant="subtle">
            {categoryNames[selectedCategory] || `Категория ${selectedCategory}`}
          </Badge>
        )}
        {startDate && (
          <Badge colorScheme="orange" variant="subtle">
            От: {startDate.toLocaleString('ru-RU')}
          </Badge>
        )}
        {endDate && (
          <Badge colorScheme="orange" variant="subtle">
            До: {endDate.toLocaleString('ru-RU')}
          </Badge>
        )}
        {selectedTags.map((tagId) => {
          const tag = tags.find((t) => t.id === tagId);
          return tag ? (
            <Badge key={tag.id} colorScheme="blue" variant="subtle">
              Тег: {tag.name}
            </Badge>
          ) : null;
        })}
      </Flex>
    </Box>
  );
}
