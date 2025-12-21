import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Navigate } from 'react-router-dom';
import {
    Box,
    Container,
    Heading,
    Text,
    VStack,
    useToast,
    Button,
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Spinner,
} from '@chakra-ui/react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { verifyRegistration, VerificationResponse } from '../../api/api';
import { useAuth } from '../../AuthContext/AuthContext';
import styles from './Scanner.module.scss';

function Scanner() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [scanResult, setScanResult] = useState<VerificationResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const scannerRef = useRef<Html5Qrcode | null>(null);
    const isProcessingRef = useRef(false);

    useEffect(() => {
        // Initialize scanner instance
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode("reader", {
                verbose: false,
                formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
            });
        }

        const startScanning = async () => {
            if (scannerRef.current && isScanning && !isProcessingRef.current) {
                try {
                    await scannerRef.current.start(
                        { facingMode: "environment" },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 }
                        },
                        onScanSuccess,
                        onScanFailure
                    );
                } catch (err) {
                    console.error("Error starting scanner:", err);
                    // Ignore errors if scanner is already running or other minor issues
                }
            }
        };

        const stopScanning = async () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                try {
                    await scannerRef.current.stop();
                } catch (err) {
                    console.error("Error stopping scanner:", err);
                }
            }
        };

        if (isScanning) {
            startScanning();
        } else {
            stopScanning();
        }

        return () => {
            // Cleanup on unmount
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop().catch(err => console.error("Failed to stop scanner on cleanup", err));
            }
        };
    }, [isScanning]);

    const onScanSuccess = async (decodedText: string, _decodedResult: any) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        // Stop scanning immediately
        if (scannerRef.current && scannerRef.current.isScanning) {
            try {
                await scannerRef.current.stop();
            } catch (err) {
                console.error("Failed to stop scanner on success", err);
            }
        }

        setIsScanning(false);
        setIsLoading(true);
        setError(null);
        setScanResult(null);

        try {
            const result = await verifyRegistration(decodedText);
            setScanResult(result);
            toast({
                title: 'Успех',
                description: 'QR-код успешно проверен',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (err: any) {
            setError(err.message || 'Ошибка проверки QR-кода');
            toast({
                title: 'Ошибка',
                description: err.message || 'Не удалось проверить QR-код',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
            isProcessingRef.current = false;
        }
    };

    const onScanFailure = (_error: any) => {
        // console.warn(`Code scan error = ${error}`);
    };

    const handleReset = () => {
        setScanResult(null);
        setError(null);
        setIsScanning(true);
    };



    if (authLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <Spinner size="xl" />
            </Box>
        );
    }

    if (!isAuthenticated || user?.role_id !== 2) {
        return <Navigate to="/not-found" replace />;
    }

    return (
        <Box className={styles.container}>
            <Header />
            <Container maxW="container.md" py={8} minH="70vh">
                <VStack spacing={6} align="stretch">
                    <Heading textAlign="center">Сканер QR-кодов</Heading>
                    <Text textAlign="center" color="gray.600">
                        Наведите камеру на QR-код участника для проверки регистрации
                    </Text>

                    {/* Scanner Container */}
                    <Box
                        id="reader"
                        width="100%"
                        height="500px"
                        overflow="hidden"
                        borderRadius="md"
                        display={isScanning ? 'block' : 'none'}
                    />

                    {isLoading && (
                        <Box display="flex" justifyContent="center" py={10}>
                            <Spinner size="xl" />
                        </Box>
                    )}

                    {scanResult && (
                        <Alert
                            status="success"
                            variant="subtle"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            textAlign="center"
                            height="200px"
                            borderRadius="md"
                        >
                            <AlertIcon boxSize="40px" mr={0} />
                            <AlertTitle mt={4} mb={1} fontSize="lg">
                                Доступ разрешен!
                            </AlertTitle>
                            <AlertDescription maxWidth="sm">
                                <Text fontWeight="bold">Участник: {scanResult.user}</Text>
                                <Text>Мероприятие: {scanResult.event}</Text>
                                <Text>Дата: {new Date(scanResult.date).toLocaleDateString()}</Text>
                                <Text color="green.600" fontWeight="bold" mt={2}>{scanResult.status}</Text>
                            </AlertDescription>
                        </Alert>
                    )}

                    {error && (
                        <Alert
                            status="error"
                            variant="subtle"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            textAlign="center"
                            height="200px"
                            borderRadius="md"
                        >
                            <AlertIcon boxSize="40px" mr={0} />
                            <AlertTitle mt={4} mb={1} fontSize="lg">
                                Ошибка проверки
                            </AlertTitle>
                            <AlertDescription maxWidth="sm">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {(!isScanning && !isLoading) && (
                        <Button colorScheme="blue" size="lg" onClick={handleReset}>
                            Сканировать следующий
                        </Button>
                    )}
                </VStack>
            </Container>
            <Footer />
        </Box>
    );
}

export default Scanner;
