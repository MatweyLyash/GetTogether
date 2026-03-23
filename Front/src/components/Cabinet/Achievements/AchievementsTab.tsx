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
    <Text color="rgba(66, 32, 6, 0.64)">Загрузка...</Text>
  ) : achievements.length === 0 ? (
    <Box width="100%" bg="rgba(255,255,255,0.82)" p="6" borderRadius="2xl" border="1px solid rgba(234, 179, 8, 0.16)">
      <Text color="rgba(66, 32, 6, 0.64)">Достижений пока нет</Text>
    </Box>
  ) : (
    <VStack spacing="4" align="stretch" width="100%">
      {achievements.map((item) => {
        const progressMax = item.score > 0 ? item.score : 1;
        const percent = Math.min(100, Math.round((item.progress / progressMax) * 100));
        const imageSrc = toImageSrc(item.image);

        return (
          <Box
            key={item.id}
            p="5"
            width="100%"
            borderWidth="1px"
            borderRadius="2xl"
            bg="rgba(255,255,255,0.9)"
            boxShadow="0 18px 34px rgba(140, 91, 14, 0.08)"
            borderColor="rgba(234, 179, 8, 0.16)"
            position="relative"
            overflow="hidden"
          >
            <Box position="absolute" top="-28px" right="-20px" w="110px" h="110px" borderRadius="full" bg="rgba(250, 204, 21, 0.16)" />
            <HStack justify="space-between" align="start" spacing="4" flexWrap="wrap">
              <Box flex="1">
                <HStack spacing="2">
                  <Text fontWeight="800" fontFamily="Outfit, sans-serif" fontSize="xl" color="#422006">{item.name}</Text>
                  {item.is_unlocked && <Badge bg="#facc15" color="#422006" borderRadius="full" px={3}>Получено</Badge>}
                </HStack>
                <Text mt="1" fontSize="sm" color="rgba(66, 32, 6, 0.74)">
                  {item.description || 'Описание отсутствует'}
                </Text>
              </Box>
              {imageSrc && (
                <Image
                  src={imageSrc}
                  alt={item.name}
                  boxSize="72px"
                  objectFit="cover"
                  borderRadius="2xl"
                  transform="rotate(-4deg)"
                  boxShadow="0 12px 24px rgba(140, 91, 14, 0.12)"
                />
              )}
            </HStack>
            <Box mt="3">
              <Text fontSize="sm" color="rgba(66, 32, 6, 0.62)" fontWeight="600">
                Прогресс: {item.progress} / {item.score}
              </Text>
              <Progress value={percent} size="sm" mt="2" borderRadius="full" sx={{ '& > div': { background: item.is_unlocked ? '#facc15' : '#fef3c7' } }} />
              {item.unlocked_at && (
                <Text fontSize="xs" color="#a16207" mt="2">
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
