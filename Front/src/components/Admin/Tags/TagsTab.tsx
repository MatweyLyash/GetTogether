import { useState } from 'react';
import { TabPanel, VStack, Heading, Input, Button, Table, Thead, Tbody, Tr, Th, Td, HStack, useToast, useBreakpointValue } from '@chakra-ui/react';

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
            <Button bg="#2E4FD7" color="white" _hover={{ bg: '#1e3fa9' }} size={buttonSize} onClick={handleAdd} isLoading={isLoading}>
              Добавить
            </Button>
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
                            <Button size={buttonSize} colorScheme="green" onClick={() => handleRename(tag.id)} isLoading={isLoading}>
                              Сохранить
                            </Button>
                            <Button size={buttonSize} variant="ghost" onClick={() => setEditTag(null)}>
                              Отмена
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button size={buttonSize} colorScheme="blue" onClick={() => setEditTag({ id: tag.id, name: tag.name })}>
                              Ред.
                            </Button>
                            <Button size={buttonSize} colorScheme="red" onClick={() => onDelete(tag.id)}>
                              Удалить
                            </Button>
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
