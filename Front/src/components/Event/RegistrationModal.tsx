import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
} from '@chakra-ui/react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * Registration confirmation modal
 */
export function RegistrationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: RegistrationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent bg="#fffdf5" color="#422006" border="1px solid rgba(234, 179, 8, 0.18)" borderRadius="2rem">
        <ModalHeader>Подтверждение регистрации</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          Вы уверены, что хотите отправить заявку на участие в мероприятии?
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Отмена
          </Button>
          <Button bg="#facc15" color="#422006" _hover={{ bg: '#eab308' }} onClick={onConfirm} isLoading={isLoading}>
            Подтвердить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
