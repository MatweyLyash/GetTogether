import { useState } from 'react';
import { TabPanel, VStack, Heading, Input, Table, Thead, Tbody, Tr, Th, Td, HStack, useToast, useBreakpointValue, IconButton, Tooltip } from '@chakra-ui/react';
import { FaCheck, FaEdit, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';

interface Tag {
  id: number;
  name: string;
}

interface TagsTabProps {
  tags: Tag[];
  isLoading: boolean;
  onAdd: (name: string) => Promise<void>;
  onRename: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TagsTab({ tags, isLoading, onAdd, onRename, onDelete }: TagsTabProps) {
  const [newTag, setNewTag] = useState('');
  const [editTag, setEditTag] = useState<{ id: number; name: string } | null>(null);
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const toast = useToast();

  const handleAdd = async () => {
    if (!newTag.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    await onAdd(newTag);
    setNewTag('');
  };

  const handleRename = async (id: number) => {
    if (!editTag?.name.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    await onRename(id, editTag.name);
    setEditTag(null);
  };

  return (
    <TabPanel className="tabPanel">
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Управление тегами</Heading>

        <VStack spacing={3} align="stretch" className="formSection">
          <Heading size="md">Добавить тег</Heading>
          <HStack>
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Название тега"
              bg="white"
              size={buttonSize}
            />
            <Tooltip label="Добавить тег"><IconButton aria-label="Добавить тег" icon={<FaPlus />} bg="#facc15" color="#422006" _hover={{ bg: '#eab308' }} size={buttonSize} onClick={handleAdd} isLoading={isLoading} /></Tooltip>
          </HStack>
        </VStack>

        <VStack spacing={3} align="stretch">
          <Heading size="md">Список тегов</Heading>
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
                {tags.map((tag) => (
                  <Tr key={tag.id}>
                    <Td>{tag.id}</Td>
                    <Td>
                      {editTag?.id === tag.id ? (
                        <Input
                          value={editTag.name}
                          onChange={(e) => setEditTag({ id: tag.id, name: e.target.value })}
                          size={buttonSize}
                        />
                      ) : (
                        tag.name
                      )}
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        {editTag?.id === tag.id ? (
                          <>
                            <Tooltip label="Сохранить"><IconButton aria-label="Сохранить" icon={<FaCheck />} size={buttonSize} bg="#facc15" color="#422006" _hover={{ bg: '#eab308' }} onClick={() => handleRename(tag.id)} isLoading={isLoading} /></Tooltip>
                            <Tooltip label="Отмена"><IconButton aria-label="Отмена" icon={<FaTimes />} size={buttonSize} variant="ghost" onClick={() => setEditTag(null)} /></Tooltip>
                          </>
                        ) : (
                          <>
                            <Tooltip label="Редактировать"><IconButton aria-label="Редактировать" icon={<FaEdit />} size={buttonSize} bg="#facc15" color="#422006" _hover={{ bg: '#eab308' }} onClick={() => setEditTag({ id: tag.id, name: tag.name })} /></Tooltip>
                            <Tooltip label="Удалить"><IconButton aria-label="Удалить" icon={<FaTrash />} size={buttonSize} variant="outline" borderColor="rgba(180, 83, 9, 0.24)" color="#7c2d12" onClick={() => onDelete(tag.id)} /></Tooltip>
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
