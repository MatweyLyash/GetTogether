import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
} from '@chakra-ui/react';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * Registration cancellation confirmation modal
 */
export function CancellationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: CancellationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Отзыв заявки</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>Вы уверены, что хотите отозвать свою заявку?</Text>
          <Text fontWeight="bold" mt={2} color="red.500">
            ВНИМАНИЕ: после отзыва заявки вы не сможете подать её снова!
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Отмена
          </Button>
          <Button colorScheme="red" onClick={onConfirm} isLoading={isLoading}>
            Отозвать
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
