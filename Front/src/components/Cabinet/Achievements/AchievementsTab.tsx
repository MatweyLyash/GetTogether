import { TabPanel, VStack, Text, Image, Badge, Box, HStack, Progress } from '@chakra-ui/react';
import { AchievementProgress } from '../../../api/api';

interface AchievementsTabProps {
  achievements: AchievementProgress[];
  isLoading: boolean;
  withPanel?: boolean;
}

export function AchievementsTab({ achievements, isLoading, withPanel = true }: AchievementsTabProps) {
  const toImageSrc = (image: unknown): string | null => {
    if (!image) return null;
    if (typeof image === 'string') {
      if (image.startsWith('data:') || image.startsWith('http')) return image;
      return `data:image/png;base64,${image}`;
    }

    const bytes = (image as { data?: number[] }).data || image;
    if (Array.isArray(bytes)) {
      const binary = Uint8Array.from(bytes).reduce((acc, value) => acc + String.fromCharCode(value), '');
      return `data:image/png;base64,${btoa(binary)}`;
    }

    return null;
  };

  const content = isLoading ? (
    <Text>Загрузка...</Text>
  ) : achievements.length === 0 ? (
    <Box width="100%">
      <Text color="gray.600">Достижений пока нет</Text>
    </Box>
  ) : (
    <VStack spacing="3" align="stretch" width="100%">
      {achievements.map((item) => {
        const progressMax = item.score > 0 ? item.score : 1;
        const percent = Math.min(100, Math.round((item.progress / progressMax) * 100));
        const imageSrc = toImageSrc(item.image);

        return (
          <Box
            key={item.id}
            p="4"
            width="100%"
            borderWidth="1px"
            borderRadius="md"
            bg="white"
            boxShadow="sm"
          >
            <HStack justify="space-between" align="start" spacing="4" flexWrap="wrap">
              <Box flex="1">
                <HStack spacing="2">
                  <Text fontWeight="bold">{item.name}</Text>
                  {item.is_unlocked && <Badge colorScheme="green">Получено</Badge>}
                </HStack>
                <Text mt="1" fontSize="sm" color="gray.700">
                  {item.description || 'Описание отсутствует'}
                </Text>
              </Box>
              {imageSrc && (
                <Image
                  src={imageSrc}
                  alt={item.name}
                  boxSize="64px"
                  objectFit="cover"
                  borderRadius="md"
                />
              )}
            </HStack>
            <Box mt="3">
              <Text fontSize="sm" color="gray.600">
                Прогресс: {item.progress} / {item.score}
              </Text>
              <Progress value={percent} size="sm" mt="1" colorScheme={item.is_unlocked ? 'green' : 'blue'} />
              {item.unlocked_at && (
                <Text fontSize="xs" color="green.600" mt="1">
                  Открыто: {new Date(item.unlocked_at).toLocaleString()}
                </Text>
              )}
            </Box>
          </Box>
        );
      })}
    </VStack>
  );

  return withPanel ? <TabPanel px={0}>{content}</TabPanel> : content;
}
