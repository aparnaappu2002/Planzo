import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useMutation } from '@tanstack/react-query';
import { useVerifyTicket } from '@/hooks/vendorCustomHooks';

const TicketScanner: React.FC = () => {
    const [scannerInitialized, setScannerInitialized] = useState(false);
    const { mutate: verifyTicket, isLoading, error, data } = useVerifyTicket();

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            'qr-reader',
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        scanner.render(
            (decodedText) => {
                try {
                    const url = new URL(decodedText);
                    const pathParts = url.pathname.split('/'); 
                    const ticketId = pathParts[2];
                    const eventId = pathParts[3];

                    if (!ticketId || !eventId) {
                        throw new Error('Invalid QR code format');
                    }

                    verifyTicket(
                        { ticketId, eventId },
                        {
                            onSuccess: (result) => {
                                toast.success('Ticket verified successfully!', {
                                    position: 'top-center',
                                    theme: 'colored',
                                    style: { backgroundColor: '#fef08a' },
                                });
                            },
                            onError: (error) => {
                                toast.error('Failed to verify ticket: ' + error.message, {
                                    position: 'top-center',
                                    theme: 'colored',
                                    style: { backgroundColor: '#fef08a' },
                                });
                            },
                        }
                    );
                } catch (error) {
                    toast.error('Invalid QR code: ' + error.message, {
                        position: 'top-center',
                        theme: 'colored',
                        style: { backgroundColor: '#fef08a' },
                    });
                }
            },
            (error) => {
                console.warn('QR Code scan error:', error);
            }
        );

        setScannerInitialized(true);

        return () => {
            scanner.clear().catch((error) => console.error('Failed to clear scanner:', error));
        };
    }, [verifyTicket]);

    return (
        <div className="min-h-screen bg-yellow-100 flex flex-col items-center justify-center p-4">
            <h1 className="text-3xl font-bold text-yellow-800 mb-6">Ticket Scanner</h1>
            <div className="bg-yellow-200 p-6 rounded-lg shadow-lg w-full max-w-md">
                <div id="qr-reader" className="w-full"></div>
                {isLoading && (
                    <p className="text-yellow-800 mt-4 text-center">Verifying ticket...</p>
                )}
                {error && (
                    <p className="text-red-600 mt-4 text-center">
                        Error: {error.message}
                    </p>
                )}
                {data && (
                    <p className="text-green-600 mt-4 text-center">
                        Ticket verified successfully!
                    </p>
                )}
            </div>
            <ToastContainer />
        </div>
    );
};

export default TicketScanner;