import { useState, useEffect, useMemo } from 'react';
import { Box, Text, Heading, HStack, SimpleGrid, useToast, useBreakpointValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { getEvents, getCategories, getTags, Tag } from '../../api/api';
import { Event } from '../../types/event';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { EventsLayout } from '../../components/Events/EventsLayout';
import { FilterSidebar } from '../../components/Events/FilterSidebar';
import { SearchTitleFilter, SearchLocationFilter } from '../../components/Events/SearchFilter';
import { CategoryFilter } from '../../components/Events/CategoryFilter';
import { StartDateFilter, EndDateFilter } from '../../components/Events/DateRangeFilter';
import { TagsFilter } from '../../components/Events/TagsFilter';
import { FilterActions } from '../../components/Events/FilterActions';
import { ActiveFiltersDisplay } from '../../components/Events/ActiveFiltersDisplay';
import { EventsGrid } from '../../components/Events/EventsGrid';
import { EventsEmptyState } from '../../components/Events/EventsEmptyState';
import styles from './Events.module.scss';

interface Category {
  id: number;
  category_name: string;
}

interface ApiEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category_id: number;
  price: number | string;
  capacity: number;
  image?: string | null;
  telegram_chat_link?: string | null;
  telegram_chat_id?: string | null;
  organizer_verification_key?: string | null;
  created_at?: string;
  updated_at?: string;
  creator_id?: string | number;
  creator?: {
    id?: string | number;
    login?: string | null;
    telegram?: string | null;
  } | null;
  latitude?: number | null;
  longitude?: number | null;
  deletedAt?: string | null;
  tags?: Tag[];
}

function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const location = useLocation();

  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const categoryNames = useMemo(
    () =>
      categories.reduce<Record<string, string>>((acc, cat) => {
        acc[String(cat.id)] = cat.category_name;
        return acc;
      }, {}),
    [categories]
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [eventData, catData, tagData] = await Promise.all([
          getEvents(),
          getCategories(),
          getTags(),
        ]);
        setTags(tagData || []);

        const mappedCategories: Category[] = catData.map((cat) => ({
          id: cat.id,
          category_name: cat.category_name,
        }));

        const mappedEvents: Event[] = eventData
          .filter((event: ApiEvent) => {
            const eventDate = new Date(event.date);
            const currentDate = new Date();
            return eventDate > currentDate && !event.deletedAt;
          })
          .map((event: ApiEvent) => {
            const creatorId = String(event.creator?.id ?? event.creator_id ?? '0');
            const creatorLogin = event.creator?.login?.trim() || 'Организатор';
            const creatorTelegram = event.creator?.telegram?.trim() || event.telegram_chat_link || null;

            return {
              id: String(event.id),
              title: event.title,
              description: event.description,
              date: event.date,
              price: typeof event.price === 'string' ? parseFloat(event.price) : event.price,
              capacity: event.capacity,
              location: event.location,
              latitude: event.latitude ?? null,
              longitude: event.longitude ?? null,
              image: event.image ?? null,
              category: {
                id: String(event.category_id),
                category_name:
                  mappedCategories.find((cat) => cat.id === event.category_id)?.category_name ||
                  `Категория ${event.category_id}`,
              },
              creator: {
                id: creatorId,
                login: creatorLogin,
                telegram: creatorTelegram || '',
              },
              reviews: [],
              deletedAt: event.deletedAt ?? null,
              category_id: event.category_id,
              telegram_chat_link: event.telegram_chat_link ?? null,
              telegram_chat_id: event.telegram_chat_id ?? null,
              organizer_verification_key: event.organizer_verification_key ?? null,
              created_at: event.created_at ?? null,
              updated_at: event.updated_at ?? null,
              tags: event.tags || [],
            };
          });

        setCategories(mappedCategories);
        setEvents(mappedEvents);
        setFilteredEvents(mappedEvents);

        const { title, location: loc, category } = (location.state || {}) as {
          title?: string;
          location?: string;
          category?: string;
        };

        if (title || loc || category) {
          setSearchTitle(title || '');
          setSearchLocation(loc || '');
          setSelectedCategory(category || '');

          let filtered = mappedEvents;
          if (title) {
            filtered = filtered.filter((event) =>
              event.title.toLowerCase().includes(title.toLowerCase())
            );
          }
          if (loc) {
            filtered = filtered.filter((event) =>
              event.location.toLowerCase().includes(loc.toLowerCase())
            );
          }
          if (category) {
            filtered = filtered.filter((event) => event.category.id === category);
          }
          setFilteredEvents(filtered);
        }
      } catch (error: any) {
        toast({
          title: 'Ошибка загрузки данных',
          description: error.message || 'Не удалось загрузить мероприятия',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast, location.state]);

  const applyFilters = () => {
    let filtered = events;

    if (searchTitle) {
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(searchTitle.toLowerCase())
      );
    }
    if (searchLocation) {
      filtered = filtered.filter((event) =>
        event.location.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter((event) => event.category.id === selectedCategory);
    }
    if (startDate) {
      const startDateTime = startDate.getTime();
      filtered = filtered.filter(
        (event) => new Date(event.date).getTime() >= startDateTime
      );
    }
    if (endDate) {
      const endDateTime = endDate.getTime();
      filtered = filtered.filter(
        (event) => new Date(event.date).getTime() <= endDateTime
      );
    }
    if (selectedTags.length > 0) {
      filtered = filtered.filter((event) =>
        selectedTags.every((tagId) => event.tags?.some((eventTag) => eventTag.id === tagId))
      );
    }

    setFilteredEvents(filtered);
  };

  const handleReset = () => {
    setSearchTitle('');
    setSearchLocation('');
    setSelectedCategory('');
    setStartDate(null);
    setEndDate(null);
    setSelectedTags([]);
    setFilteredEvents(events);
    toast({
      title: 'Фильтры сброшены',
      description: 'Показаны все мероприятия',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const hasFilters = Boolean(
    searchTitle ||
    searchLocation ||
    selectedCategory ||
    startDate !== null ||
    endDate !== null ||
    selectedTags.length > 0
  );

  return (
    <EventsLayout>
      <Header />
      <Box className={styles.content} py="6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%' }}
        >
          <Heading
            as="h1"
            size={headingSize}
            mb="1.5rem"
            color="#422006"
            textAlign={{ base: 'center', md: 'left' }}
            letterSpacing="-0.05em"
          >
            Мероприятия
          </Heading>

          <Text fontSize={{ base: 'md', md: 'lg' }} mb="2rem" color="rgba(66, 32, 6, 0.68)">
            Найдено мероприятий: {filteredEvents.length}
          </Text>

          <div className={styles.contentContainer}>
            <FilterSidebar isOpen={isFilterOpen} onToggle={() => setIsFilterOpen(!isFilterOpen)}>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3, xl: 5 }} spacing="1rem">
                <SearchTitleFilter
                  searchTitle={searchTitle}
                  onTitleChange={setSearchTitle}
                />
                <SearchLocationFilter
                  searchLocation={searchLocation}
                  onLocationChange={setSearchLocation}
                />
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onChange={setSelectedCategory}
                />
                <StartDateFilter
                  startDate={startDate}
                  onStartDateChange={setStartDate}
                />
                <EndDateFilter
                  endDate={endDate}
                  onEndDateChange={setEndDate}
                />
              </SimpleGrid>

              <TagsFilter
                tags={tags}
                selectedTags={selectedTags}
                onToggleTag={(tagId) => {
                  setSelectedTags((prev) =>
                    prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
                  );
                }}
              />

              <HStack align="flex-start" spacing="1rem" flexWrap="wrap">
                <Box flexShrink={0}>
                  <FilterActions
                    onApply={applyFilters}
                    onReset={handleReset}
                    isLoading={isLoading}
                    hasFilters={hasFilters}
                  />
                </Box>
                <Box flex="1" minW="0">
                  <ActiveFiltersDisplay
                    searchTitle={searchTitle}
                    searchLocation={searchLocation}
                    selectedCategory={selectedCategory}
                    categoryNames={categoryNames}
                    startDate={startDate}
                    endDate={endDate}
                    selectedTags={selectedTags}
                    tags={tags}
                  />
                </Box>
              </HStack>
            </FilterSidebar>

            <div className={styles.eventContainer}>
              {filteredEvents.length === 0 && !isLoading ? (
                <EventsEmptyState onReset={handleReset} />
              ) : (
                <EventsGrid events={filteredEvents} isLoading={isLoading} />
              )}
            </div>
          </div>
        </motion.div>
      </Box>
      <Footer />
    </EventsLayout>
  );
}

export default Events;
