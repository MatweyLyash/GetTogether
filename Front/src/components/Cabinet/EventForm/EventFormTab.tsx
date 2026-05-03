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
  HStack,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import { FaCloudUploadAlt, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import { Tag } from '../../../api/api';
import { EventFormData } from '../types';
import { LocationPicker } from '../../Map/LocationPicker';
import { dateToLocalISOString } from '../../../utils/date';
import { PromotionPicker } from '../Promotion/PromotionPicker';

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
      onFormDataChange({ date: dateToLocalISOString(date) });
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
      <Heading size="lg" color="#422006" letterSpacing="-0.04em">
        {isEditing ? 'Редактировать событие' : 'Создать событие'}
      </Heading>

      <FormControl>
        <FormLabel color="rgba(66, 32, 6, 0.78)" fontWeight="700">Название</FormLabel>
        <Input
          value={formData.title}
          onChange={(e) => onFormDataChange({ title: e.target.value })}
          placeholder="Введите название"
          bg="rgba(255,255,255,0.92)"
          size={buttonSize}
        />
      </FormControl>

      <FormControl>
        <FormLabel color="rgba(66, 32, 6, 0.78)" fontWeight="700">Описание</FormLabel>
        <Textarea
          value={formData.description}
          onChange={(e) => onFormDataChange({ description: e.target.value })}
          placeholder="Опишите мероприятие"
          rows={4}
          bg="rgba(255,255,255,0.92)"
          size={buttonSize}
          borderRadius="1.5rem"
        />
      </FormControl>

      <FormControl>
        <FormLabel color="rgba(66, 32, 6, 0.78)" fontWeight="700">Дата и время</FormLabel>
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
          customInput={<Input bg="rgba(255,255,255,0.92)" size={buttonSize} width="100%" />}
        />
        {!isDateValid(formData.date) && formData.date && (
          <Text color="red.500" fontSize="sm" mt={1}>
            Дата должна быть минимум на сутки позже текущего времени
          </Text>
        )}
      </FormControl>

      <FormControl>
        <FormLabel color="rgba(66, 32, 6, 0.78)" fontWeight="700">Место проведения</FormLabel>
        <Input
          value={formData.location}
          onChange={(e) => onFormDataChange({ location: e.target.value })}
          placeholder="Где пройдет мероприятие"
          bg="rgba(255,255,255,0.92)"
          size={buttonSize}
        />
      </FormControl>

      <FormControl>
        <FormLabel color="rgba(66, 32, 6, 0.78)" fontWeight="700">Категория</FormLabel>
        <Select
          value={formData.category_id}
          onChange={(e) => onFormDataChange({ category_id: e.target.value })}
          placeholder="Выберите категорию"
          bg="rgba(255,255,255,0.92)"
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
          <FormLabel color="rgba(66, 32, 6, 0.78)" fontWeight="700">Цена (BYN)</FormLabel>
          <Input
            type="number"
            value={formData.price}
            onChange={(e) => onFormDataChange({ price: e.target.value })}
            placeholder="0"
            bg="rgba(255,255,255,0.92)"
            size={buttonSize}
          />
        </FormControl>

        <FormControl flex={1} minW="150px">
          <FormLabel color="rgba(66, 32, 6, 0.78)" fontWeight="700">Количество мест</FormLabel>
          <Input
            type="number"
            value={formData.capacity}
            onChange={(e) => onFormDataChange({ capacity: e.target.value })}
            placeholder="50"
            bg="rgba(255,255,255,0.92)"
            size={buttonSize}
          />
        </FormControl>
      </Flex>

      <FormControl>
        <FormLabel color="rgba(66, 32, 6, 0.78)" fontWeight="700">Место на карте</FormLabel>
        <LocationPicker
          latitude={formData.latitude}
          longitude={formData.longitude}
          onChange={(lat, lng) => onFormDataChange({ latitude: lat, longitude: lng })}
        />
      </FormControl>

      <FormControl>
        <FormLabel color="rgba(66, 32, 6, 0.78)" fontWeight="700">Теги</FormLabel>
        <Flex flexWrap="wrap" gap={2}>
          {tags.map((tag) => (
            <Box
              key={tag.id}
              px={3}
              py={2}
              borderRadius="full"
              cursor="pointer"
              bg={formData.tags.includes(tag.id) ? '#facc15' : 'rgba(255,255,255,0.78)'}
              color="#422006"
              border="1px solid rgba(234, 179, 8, 0.16)"
              onClick={() => handleTagToggle(tag.id)}
              _hover={{ opacity: 0.8 }}
            >
              {tag.name}
            </Box>
          ))}
        </Flex>
      </FormControl>

      <FormControl>
        <FormLabel color="rgba(66, 32, 6, 0.78)" fontWeight="700">Продвижение</FormLabel>
        <PromotionPicker
          value={{ type: formData.promotion_type, duration_days: formData.promotion_duration_days }}
          onChange={(val) => onFormDataChange({ promotion_type: val.type, promotion_duration_days: val.duration_days })}
        />
      </FormControl>

      <FormControl>
        <FormLabel color="rgba(66, 32, 6, 0.78)" fontWeight="700">Изображение</FormLabel>
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
          size={buttonSize}
          width="100%"
          leftIcon={<FaCloudUploadAlt />}
        >
          {imagePreview ? 'Заменить изображение' : 'Загрузить изображение'}
        </Button>
        {imagePreview && (
          <Box mt={3} className="eventFormImage">
            <Image src={imagePreview} alt="Preview" w="100%" h="100%" objectFit="cover" />
          </Box>
        )}
      </FormControl>

      <HStack gap={3} mt={4} justify="flex-end">
        <Tooltip label={isEditing ? 'Сохранить изменения' : 'Создать мероприятие'}>
          <IconButton
            aria-label={isEditing ? 'Сохранить изменения' : 'Создать мероприятие'}
            icon={isEditing ? <FaSave /> : <FaPlus />}
            bg="#facc15"
            color="#422006"
            _hover={{ bg: '#eab308', transform: 'scale(1.05)' }}
            size={buttonSize}
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
          />
        </Tooltip>
        {isEditing && (
          <Tooltip label="Отменить редактирование">
            <IconButton
              aria-label="Отменить редактирование"
              icon={<FaTimes />}
              variant="outline"
              size={buttonSize}
              onClick={onCancelEdit}
            />
          </Tooltip>
        )}
      </HStack>
    </VStack>
  );

  return withPanel ? <TabPanel px={0}>{content}</TabPanel> : content;
}
