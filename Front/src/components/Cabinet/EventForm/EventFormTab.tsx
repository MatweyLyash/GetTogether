import { useRef, ChangeEvent } from 'react';
import {
  TabPanel,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Image,
  Box,
  Text,
  useBreakpointValue,
  Flex,
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import { Tag } from '../../../api/api';
import { EventFormData } from '../types';

interface EventFormTabProps {
  categories: { id: number; category_name: string }[];
  tags: Tag[];
  isEditing: boolean;
  isLoading: boolean;
  formData: EventFormData;
  imagePreview: string | null;
  onFormDataChange: (data: Partial<EventFormData>) => void;
  onImageChange: (file: File | null) => void;
  onSubmit: () => void;
  onCancelEdit: () => void;
  withPanel?: boolean;
}

export function EventFormTab({
  categories,
  tags,
  isEditing,
  isLoading,
  formData,
  imagePreview,
  onFormDataChange,
  onImageChange,
  onSubmit,
  onCancelEdit,
  withPanel = true,
}: EventFormTabProps) {
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onImageChange(file);
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      onFormDataChange({ date: date.toISOString().slice(0, 16) });
    }
  };

  const handleTagToggle = (tagId: number) => {
    const newTags = formData.tags.includes(tagId)
      ? formData.tags.filter((id) => id !== tagId)
      : [...formData.tags, tagId];
    onFormDataChange({ tags: newTags });
  };

  const isDateValid = (date: string) => {
    if (!date) return true;
    const selectedDate = new Date(date);
    if (Number.isNaN(selectedDate.getTime())) return false;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return selectedDate >= tomorrow;
  };

  const selectedDate = formData.date ? new Date(formData.date) : null;
  const normalizedSelectedDate = selectedDate && !Number.isNaN(selectedDate.getTime()) ? selectedDate : null;

  const content = (
      <VStack spacing="6" align="stretch" className="eventForm" w="100%">
        <Heading size="lg">
          {isEditing ? 'Редактировать событие' : 'Создать событие'}
        </Heading>

        <FormControl>
          <FormLabel>Название</FormLabel>
          <Input
            value={formData.title}
            onChange={(e) => onFormDataChange({ title: e.target.value })}
            placeholder="Введите название"
            bg="#E7EBFC"
            size={buttonSize}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Описание</FormLabel>
          <Textarea
            value={formData.description}
            onChange={(e) => onFormDataChange({ description: e.target.value })}
            placeholder="Опишите мероприятие"
            rows={4}
            bg="#E7EBFC"
            size={buttonSize}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Дата и время</FormLabel>
          <DatePicker
            selected={normalizedSelectedDate}
            onChange={handleDateChange}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd.MM.yyyy HH:mm"
            locale="ru"
            placeholderText="Выберите дату и время"
            portalId="root-portal"
            minDate={new Date()}
            customInput={
              <Input bg="#E7EBFC" size={buttonSize} width="100%" />
            }
          />
          {!isDateValid(formData.date) && formData.date && (
            <Text color="red.500" fontSize="sm" mt={1}>
              Дата должна быть минимум на сутки позже текущего времени
            </Text>
          )}
        </FormControl>

        <FormControl>
          <FormLabel>Место проведения</FormLabel>
          <Input
            value={formData.location}
            onChange={(e) => onFormDataChange({ location: e.target.value })}
            placeholder="Где пройдет мероприятие"
            bg="#E7EBFC"
            size={buttonSize}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Категория</FormLabel>
          <Select
            value={formData.category_id}
            onChange={(e) => onFormDataChange({ category_id: e.target.value })}
            placeholder="Выберите категорию"
            bg="#E7EBFC"
            size={buttonSize}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.category_name}
              </option>
            ))}
          </Select>
        </FormControl>

        <Flex gap={4} flexWrap="wrap">
          <FormControl flex={1} minW="150px">
            <FormLabel>Цена (BYN)</FormLabel>
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => onFormDataChange({ price: e.target.value })}
              placeholder="0"
              bg="#E7EBFC"
              size={buttonSize}
            />
          </FormControl>

          <FormControl flex={1} minW="150px">
            <FormLabel>Количество мест</FormLabel>
            <Input
              type="number"
              value={formData.capacity}
              onChange={(e) => onFormDataChange({ capacity: e.target.value })}
              placeholder="50"
              bg="#E7EBFC"
              size={buttonSize}
            />
          </FormControl>
        </Flex>

        <FormControl>
          <FormLabel>Telegram чат</FormLabel>
          <Input
            value={formData.telegram_chat_link}
            onChange={(e) =>
              onFormDataChange({ telegram_chat_link: e.target.value })
            }
            placeholder="@your_chat"
            bg="#E7EBFC"
            size={buttonSize}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Теги</FormLabel>
          <Flex flexWrap="wrap" gap={2}>
            {tags.map((tag) => (
              <Box
                key={tag.id}
                px={3}
                py={1}
                borderRadius="md"
                cursor="pointer"
                bg={formData.tags.includes(tag.id) ? 'blue.500' : 'gray.200'}
                color={formData.tags.includes(tag.id) ? 'white' : 'gray.700'}
                onClick={() => handleTagToggle(tag.id)}
                _hover={{ opacity: 0.8 }}
              >
                {tag.name}
              </Box>
            ))}
          </Flex>
        </FormControl>

        <FormControl>
          <FormLabel>Изображение</FormLabel>
          <Input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelect}
            display="none"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            colorScheme="blue"
            size={buttonSize}
            width="100%"
          >
            {imagePreview ? 'Заменить изображение' : 'Загрузить изображение'}
          </Button>
          {imagePreview && (
            <Box mt={3} className="eventFormImage">
              <Image
                src={imagePreview}
                alt="Preview"
                w="100%"
                h="100%"
                objectFit="cover"
              />
            </Box>
          )}
        </FormControl>

        <Flex gap={3} mt={4}>
          <Button
            bg="#2E4FD7"
            color="white"
            _hover={{ bg: '#1e3fa9' }}
            size={buttonSize}
            flex={1}
            onClick={onSubmit}
            isLoading={isLoading}
            isDisabled={
              !formData.title ||
              !formData.description ||
              !formData.date ||
              !formData.location ||
              !formData.category_id ||
              !formData.price ||
              !formData.capacity
            }
          >
            {isEditing ? 'Сохранить' : 'Создать'}
          </Button>
          {isEditing && (
            <Button
              variant="outline"
              colorScheme="blue"
              size={buttonSize}
              flex={1}
              onClick={onCancelEdit}
            >
              Отмена
            </Button>
          )}
        </Flex>
      </VStack>
  );

  return withPanel ? <TabPanel px={0}>{content}</TabPanel> : content;
}
