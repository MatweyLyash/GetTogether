import { FormControl, FormLabel, Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';

interface SearchFilterProps {
  searchTitle: string;
  searchLocation: string;
  onTitleChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  buttonSize?: 'sm' | 'md' | 'lg';
}

/**
 * Search inputs for title and location
 */
export function SearchFilter({
  searchTitle,
  searchLocation,
  onTitleChange,
  onLocationChange,
  buttonSize = 'md',
}: SearchFilterProps) {
  return (
    <>
      <FormControl>
        <FormLabel fontSize="sm">Название</FormLabel>
        <InputGroup size={buttonSize}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Поиск по названию"
            value={searchTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            bg="white"
            size={buttonSize}
          />
        </InputGroup>
      </FormControl>

      <FormControl>
        <FormLabel fontSize="sm">Локация</FormLabel>
        <InputGroup size={buttonSize}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" transform="translateX(-2px)" />
          </InputLeftElement>
          <Input
            placeholder="Поиск по локации"
            value={searchLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            bg="white"
            size={buttonSize}
          />
        </InputGroup>
      </FormControl>
    </>
  );
}
