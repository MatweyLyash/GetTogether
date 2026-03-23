import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Spinner, Box } from '@chakra-ui/react';
import { useAuth } from '../../AuthContext/AuthContext';
import { verifyRegistration, VerificationResponse } from '../../api/api';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { ScannerContainer } from '../../components/Scanner/ScannerContainer';
import { QRCodeReader } from '../../components/Scanner/QRCodeReader';
import { ScanResult } from '../../components/Scanner/ScanResult';
import { ScanError } from '../../components/Scanner/ScanError';
import { ScannerActions } from '../../components/Scanner/ScannerActions';
import styles from './Scanner.module.scss';

function Scanner() {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [scanResult, setScanResult] = useState<VerificationResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const handleScanSuccess = async (decodedText: string) => {
        setIsScanning(false);
        setIsLoading(true);
        setError(null);
        setScanResult(null);

        try {
            const result = await verifyRegistration(decodedText);
            setScanResult(result);
        } catch (err: any) {
            setError(err.message || 'Ошибка проверки QR-кода');
        } finally {
            setIsLoading(false);
        }
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
            <ScannerContainer>
                <QRCodeReader onScanSuccess={handleScanSuccess} isActive={isScanning} />
                <ScannerActions
                    onReset={handleReset}
                    isLoading={isLoading}
                    showReset={!isScanning && !isLoading}
                />
                {scanResult && <ScanResult result={scanResult} />}
                {error && <ScanError error={error} />}
            </ScannerContainer>
            <Footer />
        </Box>
    );
}

export default Scanner;
