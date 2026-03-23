import { Box, Image, Skeleton } from '@chakra-ui/react';

interface EventImageProps {
  imageSrc: string | null;
  isLoading?: boolean;
}

/**
 * Event image with skeleton loading
 */
export function EventImage({ imageSrc, isLoading = false }: EventImageProps) {
  return (
    <Skeleton isLoaded={!isLoading && !!imageSrc}>
      <Box
        position="relative"
        w="100%"
        h={{ base: '200px', md: '300px' }}
        overflow="hidden"
        bg="gray.100"
        borderRadius="lg"
      >
        <Image
          src={
            imageSrc ||
            'https://blog.eboost.com/wp-content/uploads/2016/11/background-of-people-smiling-4184.jpg'
          }
          alt="Event"
          objectFit="cover"
          w="100%"
          h="100%"
        />
      </Box>
    </Skeleton>
  );
}
