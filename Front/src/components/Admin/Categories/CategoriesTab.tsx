import { useState } from 'react';
import { TabPanel, VStack, Heading, Input, Table, Thead, Tbody, Tr, Th, Td, HStack, useToast, useBreakpointValue, IconButton, Tooltip } from '@chakra-ui/react';
import { FaCheck, FaEdit, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';

interface Category {
  id: number;
  category_name: string;
}

interface CategoriesTabProps {
  categories: Category[];
  isLoading: boolean;
  onAdd: (name: string) => Promise<void>;
  onRename: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => void;
}

export function CategoriesTab({ categories, isLoading, onAdd, onRename, onDelete }: CategoriesTabProps) {
  const [newCategory, setNewCategory] = useState('');
  const [editCategory, setEditCategory] = useState<{ id: number; name: string } | null>(null);
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const toast = useToast();

  const handleAdd = async () => {
    if (!newCategory.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    await onAdd(newCategory);
    setNewCategory('');
  };

  const handleRename = async (id: number) => {
    if (!editCategory?.name.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    await onRename(id, editCategory.name);
    setEditCategory(null);
  };

  return (
    <TabPanel className="tabPanel">
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Управление категориями</Heading>

        <VStack spacing={3} align="stretch" className="formSection">
          <Heading size="md">Добавить категорию</Heading>
          <HStack>
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Название категории"
              bg="white"
              size={buttonSize}
            />
            <Tooltip label="Добавить категорию"><IconButton aria-label="Добавить категорию" icon={<FaPlus />} bg="#facc15" color="#422006" _hover={{ bg: '#eab308' }} size={buttonSize} onClick={handleAdd} isLoading={isLoading} /></Tooltip>
          </HStack>
        </VStack>

        <VStack spacing={3} align="stretch">
          <Heading size="md">Список категорий</Heading>
          <div className="tableContainer">
            <Table variant="simple" size={buttonSize}>
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Название</Th>
                  <Th>Действия</Th>
                </Tr>
              </Thead>
              <Tbody>
                {categories.map((cat) => (
                  <Tr key={cat.id}>
                    <Td>{cat.id}</Td>
                    <Td>
                      {editCategory?.id === cat.id ? (
                        <Input
                          value={editCategory.name}
                          onChange={(e) => setEditCategory({ id: cat.id, name: e.target.value })}
                          size={buttonSize}
                        />
                      ) : (
                        cat.category_name
                      )}
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        {editCategory?.id === cat.id ? (
                          <>
                            <Tooltip label="Сохранить"><IconButton aria-label="Сохранить" icon={<FaCheck />} size={buttonSize} bg="#facc15" color="#422006" _hover={{ bg: '#eab308' }} onClick={() => handleRename(cat.id)} isLoading={isLoading} /></Tooltip>
                            <Tooltip label="Отмена"><IconButton aria-label="Отмена" icon={<FaTimes />} size={buttonSize} variant="ghost" onClick={() => setEditCategory(null)} /></Tooltip>
                          </>
                        ) : (
                          <>
                            <Tooltip label="Редактировать"><IconButton aria-label="Редактировать" icon={<FaEdit />} size={buttonSize} bg="#facc15" color="#422006" _hover={{ bg: '#eab308' }} onClick={() => setEditCategory({ id: cat.id, name: cat.category_name })} /></Tooltip>
                            <Tooltip label="Удалить"><IconButton aria-label="Удалить" icon={<FaTrash />} size={buttonSize} variant="outline" borderColor="rgba(180, 83, 9, 0.24)" color="#7c2d12" onClick={() => onDelete(cat.id)} /></Tooltip>
                          </>
                        )}
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </VStack>
      </VStack>
    </TabPanel>
  );
}
