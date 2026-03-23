import { useState } from 'react';
import {
  TabPanel,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Image,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useToast,
  useBreakpointValue,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { Achievement, AchievementPayload } from '../../../api/api';
import { FaCheck, FaEdit, FaPlus, FaTimes, FaTrash } from 'react-icons/fa';

interface AchievementsTabProps {
  achievements: Achievement[];
  categories: { id: number; category_name: string }[];
  isLoading: boolean;
  onCreate: (data: AchievementPayload) => Promise<void>;
  onUpdate: (id: number, data: AchievementPayload) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function AchievementsTab({ achievements, categories, isLoading, onCreate, onUpdate, onDelete }: AchievementsTabProps) {
  const [editing, setEditing] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState<AchievementPayload>({
    name: '',
    description: '',
    score: 1,
    trigger: 'apply' as const,
    condition_category_id: null,
    condition_payload: null,
    image: '',
  });
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const toast = useToast();

  const handleSubmit = async () => {
    if (!formData.name || !formData.image) {
      toast({ title: 'Ошибка', description: 'Заполните название и изображение', status: 'error', duration: 3000, isClosable: true });
      return;
    }
    if (editing) {
      await onUpdate(editing.id, formData);
    } else {
      await onCreate(formData);
    }
    resetForm();
  };

  const resetForm = () => {
    setEditing(null);
    setFormData({ name: '', description: '', score: 1, trigger: 'apply', condition_category_id: null, condition_payload: null, image: '' });
  };

  const handleEdit = (a: Achievement) => {
    setEditing(a);
    setFormData({
      name: a.name,
      description: a.description || '',
      score: a.score,
      trigger: a.trigger as 'apply' | 'attend' | 'category',
      condition_category_id: a.condition_category_id || null,
      condition_payload: null,
      image: typeof a.image === 'string' ? a.image : '',
    });
  };

  return (
    <TabPanel className="tabPanel">
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Достижения</Heading>

        <VStack spacing={4} align="stretch" className="formSection">
          <Heading size="md">{editing ? 'Редактировать' : 'Создать'} достижение</Heading>
          <FormControl>
            <FormLabel>Название</FormLabel>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} bg="white" size={buttonSize} />
          </FormControl>
          <FormControl>
            <FormLabel>Описание</FormLabel>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} bg="white" size={buttonSize} />
          </FormControl>
          <FormControl>
            <FormLabel>Очки</FormLabel>
            <Input type="number" value={formData.score} onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })} bg="white" size={buttonSize} />
          </FormControl>
          <FormControl>
            <FormLabel>Триггер</FormLabel>
            <Select
              value={formData.trigger}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({ ...formData, trigger: e.target.value as 'apply' | 'attend' | 'category' })
              }
              bg="white"
              size={buttonSize}
            >
              <option value="apply">Заявка</option>
              <option value="attend">Посещение</option>
              <option value="category">Категория</option>
            </Select>
          </FormControl>
          {formData.trigger === 'category' && (
            <FormControl>
              <FormLabel>Категория</FormLabel>
              <Select
                placeholder="Выберите категорию"
                value={formData.condition_category_id ? String(formData.condition_category_id) : undefined}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setFormData({ ...formData, condition_category_id: e.target.value ? Number(e.target.value) : null })
                }
                bg="white"
                size={buttonSize}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
          <FormControl>
            <FormLabel>Изображение (URL)</FormLabel>
            <Input value={formData.image || ''} onChange={(e) => setFormData({ ...formData, image: e.target.value })} bg="white" size={buttonSize} />
          </FormControl>
          <HStack>
            <Tooltip label={editing ? 'Сохранить достижение' : 'Создать достижение'}><IconButton aria-label={editing ? 'Сохранить достижение' : 'Создать достижение'} icon={editing ? <FaCheck /> : <FaPlus />} bg="#facc15" color="#422006" _hover={{ bg: '#eab308' }} size={buttonSize} onClick={handleSubmit} isLoading={isLoading} /></Tooltip>
            {editing && (
              <Tooltip label="Отмена"><IconButton aria-label="Отмена" icon={<FaTimes />} variant="outline" size={buttonSize} onClick={resetForm} /></Tooltip>
            )}
          </HStack>
        </VStack>

        <VStack spacing={3} align="stretch">
          <Heading size="md">Список достижений</Heading>
          <div className="tableContainer">
            <Table variant="simple" size={buttonSize}>
              <Thead>
                <Tr>
                  <Th>Изображение</Th>
                  <Th>Название</Th>
                  <Th>Очки</Th>
                  <Th>Триггер</Th>
                  <Th>Действия</Th>
                </Tr>
              </Thead>
              <Tbody>
                {achievements.map((a) => (
                  <Tr key={a.id}>
                    <Td>
                      <Image src={a.image} alt={a.name} boxSize="50px" borderRadius="full" className="achievementImage" />
                    </Td>
                    <Td fontWeight="medium">{a.name}</Td>
                    <Td>{a.score}</Td>
                    <Td>{a.trigger}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label="Редактировать"><IconButton aria-label="Редактировать" icon={<FaEdit />} size={buttonSize} bg="#facc15" color="#422006" _hover={{ bg: '#eab308' }} onClick={() => handleEdit(a)} /></Tooltip>
                        <Tooltip label="Удалить"><IconButton aria-label="Удалить" icon={<FaTrash />} size={buttonSize} variant="outline" borderColor="rgba(180, 83, 9, 0.24)" color="#7c2d12" onClick={() => onDelete(a.id)} /></Tooltip>
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
