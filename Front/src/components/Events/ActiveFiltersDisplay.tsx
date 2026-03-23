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
      <Text fontSize="sm" color="rgba(66, 32, 6, 0.64)" mb="0.5rem" fontWeight="700">
        Активные фильтры:
      </Text>
      <Flex flexWrap="wrap" gap="0.5rem">
        {searchTitle && (
          <Badge bg="#fff7d6" color="#422006" borderRadius="full" px={3} py={1} border="1px solid rgba(234, 179, 8, 0.16)">
            Название: {searchTitle}
          </Badge>
        )}
        {searchLocation && (
          <Badge bg="#fef3c7" color="#422006" borderRadius="full" px={3} py={1} border="1px solid rgba(234, 179, 8, 0.16)">
            Локация: {searchLocation}
          </Badge>
        )}
        {selectedCategory && (
          <Badge bg="rgba(255,255,255,0.74)" color="#422006" borderRadius="full" px={3} py={1} border="1px solid rgba(234, 179, 8, 0.16)">
            {categoryNames[selectedCategory] || `Категория ${selectedCategory}`}
          </Badge>
        )}
        {startDate && (
          <Badge bg="#fff7d6" color="#422006" borderRadius="full" px={3} py={1} border="1px solid rgba(234, 179, 8, 0.16)">
            От: {startDate.toLocaleString('ru-RU')}
          </Badge>
        )}
        {endDate && (
          <Badge bg="#fff7d6" color="#422006" borderRadius="full" px={3} py={1} border="1px solid rgba(234, 179, 8, 0.16)">
            До: {endDate.toLocaleString('ru-RU')}
          </Badge>
        )}
        {selectedTags.map((tagId) => {
          const tag = tags.find((t) => t.id === tagId);
          return tag ? (
            <Badge key={tag.id} bg="#facc15" color="#422006" borderRadius="full" px={3} py={1} border="1px solid rgba(234, 179, 8, 0.16)">
              Тег: {tag.name}
            </Badge>
          ) : null;
        })}
      </Flex>
    </Box>
  );
}
