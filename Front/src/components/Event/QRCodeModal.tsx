import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Image,
  VStack,
  Text,
  Spinner,
  Button,
} from '@chakra-ui/react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string | null;
  isLoading: boolean;
}

/**
 * Modal displaying QR code for event check-in
 */
export function QRCodeModal({
  isOpen,
  onClose,
  qrCode,
  isLoading,
}: QRCodeModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Ваш QR-код для входа</ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" flexDirection="column" alignItems="center" pb={6}>
          {isLoading ? (
            <Spinner size="xl" my={10} />
          ) : qrCode ? (
            <VStack spacing={4}>
              <Image src={qrCode} alt="QR Code" boxSize="250px" />
              <Text textAlign="center" color="gray.600">
                Покажите этот QR-код организатору при входе на мероприятие
              </Text>
            </VStack>
          ) : (
            <Text color="red.500">Не удалось загрузить QR-код</Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Закрыть
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
