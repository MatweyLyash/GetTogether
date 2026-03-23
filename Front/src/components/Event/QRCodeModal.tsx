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
      <ModalContent bg="#fffdf5" color="#422006" border="1px solid rgba(234, 179, 8, 0.18)" borderRadius="2rem">
        <ModalHeader>Ваш QR-код для входа</ModalHeader>
        <ModalCloseButton />
        <ModalBody display="flex" flexDirection="column" alignItems="center" pb={6}>
          {isLoading ? (
            <Spinner size="xl" my={10} />
          ) : qrCode ? (
            <VStack spacing={4}>
              <Image src={qrCode} alt="QR Code" boxSize="250px" />
              <Text textAlign="center" color="rgba(66, 32, 6, 0.64)">
                Покажите этот QR-код организатору при входе на мероприятие
              </Text>
            </VStack>
          ) : (
            <Text color="red.500">Не удалось загрузить QR-код</Text>
          )}
        </ModalBody>
        <ModalFooter>
          <Button bg="#facc15" color="#422006" _hover={{ bg: '#eab308' }} mr={3} onClick={onClose}>
            Закрыть
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
