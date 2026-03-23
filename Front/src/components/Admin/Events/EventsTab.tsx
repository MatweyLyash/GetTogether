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
  Button,
  HStack,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Tag } from '../../../api/api';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  category_id: number;
  category?: { category_name: string };
  image: string | null;
  tags?: Tag[];
}

interface EventsTabProps {
  events: Event[];
  categories: { id: number; category_name: string }[];
  isLoading: boolean;
  onUpdate: (eventId: string, data: FormData) => Promise<void>;
  onDelete: (eventId: string) => Promise<void>;
}

export function EventsTab({ events, categories, isLoading, onUpdate, onDelete }: EventsTabProps) {
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({});
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' });

  const handleUpdate = async () => {
    if (!editEvent) return;
    const data = new FormData();
    data.append('title', formData.title || editEvent.title);
    data.append('description', '');
    data.append('date', editEvent.date);
    data.append('location', editEvent.location);
    data.append('category_id', String(formData.category_id || editEvent.category_id));
    data.append('price', '0');
    data.append('capacity', '0');
    await onUpdate(editEvent.id, data);
    setEditEvent(null);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    await onDelete(eventToDelete);
    setEventToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <TabPanel className="tabPanel">
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Мероприятия</Heading>

        <div className="tableContainer">
          <Table variant="simple" size={buttonSize}>
            <Thead>
              <Tr>
                <Th>Название</Th>
                <Th>Дата</Th>
                <Th>Место</Th>
                <Th>Категория</Th>
                <Th>Действия</Th>
              </Tr>
            </Thead>
            <Tbody>
              {events.map((event) => (
                <Tr key={event.id}>
                  <Td fontWeight="medium">{event.title}</Td>
                  <Td>{formatDate(event.date)}</Td>
                  <Td>{event.location}</Td>
                  <Td>
                    <Badge colorScheme="blue">{event.category?.category_name || 'N/A'}</Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Button size={buttonSize} colorScheme="blue" onClick={() => setEditEvent(event)}>
                        Ред.
                      </Button>
                      <Button size={buttonSize} colorScheme="red" onClick={() => setEventToDelete(event.id)}>
                        Удалить
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </div>
      </VStack>

      {/* Edit Modal */}
      <Modal isOpen={!!editEvent} onClose={() => setEditEvent(null)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Редактировать мероприятие</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Название</FormLabel>
                <Input value={formData.title || editEvent?.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </FormControl>
              <FormControl>
                <FormLabel>Категория</FormLabel>
                <Select value={formData.category_id || editEvent?.category_id} onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.category_name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setEditEvent(null)}>
              Отмена
            </Button>
            <Button colorScheme="blue" onClick={handleUpdate} isLoading={isLoading}>
              Сохранить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!eventToDelete} onClose={() => setEventToDelete(null)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Удалить мероприятие</ModalHeader>
          <ModalCloseButton />
          <ModalBody>Вы уверены?</ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setEventToDelete(null)}>
              Отмена
            </Button>
            <Button colorScheme="red" onClick={handleDelete} isLoading={isLoading}>
              Удалить
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </TabPanel>
  );
}
