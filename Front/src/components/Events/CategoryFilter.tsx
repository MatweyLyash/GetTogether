import { FormControl, FormLabel, Select } from '@chakra-ui/react';

interface Category {
  id: number;
  category_name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onChange: (value: string) => void;
  buttonSize?: 'sm' | 'md' | 'lg';
}

/**
 * Category selection dropdown
 */
export function CategoryFilter({
  categories,
  selectedCategory,
  onChange,
  buttonSize = 'md',
}: CategoryFilterProps) {
  return (
    <FormControl>
      <FormLabel fontSize="sm">Категория</FormLabel>
      <Select
        placeholder="Все категории"
        value={selectedCategory}
        onChange={(e) => onChange(e.target.value)}
        bg="white"
        size={buttonSize}
      >
        {categories.map((cat) => (
          <option key={cat.id} value={String(cat.id)}>
            {cat.category_name}
          </option>
        ))}
      </Select>
    </FormControl>
  );
}
