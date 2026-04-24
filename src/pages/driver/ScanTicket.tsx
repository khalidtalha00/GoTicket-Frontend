import React, { useState } from 'react';
import { Container, Paper, Typography, Button, Box, TextField, Divider } from '@mui/material';
import { Scanner } from '@yudiel/react-qr-scanner';

const ScanTicket: React.FC = () => {
  const [ticketData, setTicketData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(true);

  const verifyCode = (code: string) => {
    try {
      const parsed = JSON.parse(code);
      if (parsed && parsed.source && parsed.destination && parsed.price !== undefined) {
        setTicketData(parsed);
        setError(null);
      } else {
        setTicketData(null);
        setError('Invalid ticket format.');
      }
    } catch (e) {
      setTicketData(null);
      setError('Invalid QR Code data.');
    }
  };

  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const code = detectedCodes[0].rawValue;
      verifyCode(code);
      setIsScanning(false);
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setTicketData(null);
    setError(null);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
      <Paper sx={{ p: { xs: 2.5, sm: 4 }, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Scan Passenger Ticket</Typography>
        
        <Box sx={{ height: { xs: 240, sm: 300 }, bgcolor: '#eee', my: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
          {isScanning ? (
            <Scanner 
              onScan={handleScan} 
              onError={(error) => console.log(error)}
              styles={{ container: { width: '100%', height: '100%' } }}
            />
          ) : (
            <Typography color="textSecondary">Start Scanning</Typography>
          )}
        </Box>

        {!isScanning && (
          <Button variant="contained" color="primary" size="large" onClick={startScanning} sx={{ mb: 3 }} fullWidth>
            Scan Ticket
          </Button>
        )}

        {isScanning && (
          <Button variant="outlined" color="secondary" size="large" onClick={() => setIsScanning(false)} sx={{ mb: 3 }} fullWidth>
            Cancel Scan
          </Button>
        )}

        <Typography variant="body1" gutterBottom>OR Enter Ticket ID</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <TextField 
                label="Ticket JSON String" 
                fullWidth 
                value={manualCode} 
                onChange={(e) => setManualCode(e.target.value)} 
            />
            <Button variant="outlined" onClick={() => { setIsScanning(false); verifyCode(manualCode); }} sx={{ minWidth: { sm: 120 } }}>Verify</Button>
        </Box>

        {error && (
          <Box sx={{ mt: 4, textAlign: 'left', bgcolor: '#ffebee', p: 2, borderRadius: 1 }}>
            <Typography variant="h6" color="error.main" gutterBottom>Verification Failed</Typography>
            <Typography variant="body1">{error}</Typography>
          </Box>
        )}

        {ticketData && (
          <Box sx={{ mt: 4, textAlign: 'left', bgcolor: '#f9f9f9', p: 3, borderRadius: 2, border: '1px solid #ddd' }}>
            <Typography variant="h5" color="success.main" gutterBottom fontWeight="bold" textAlign="center">Ticket Verified!</Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="caption" color="textSecondary">Source</Typography>
                <Typography variant="body1" fontWeight="500">{ticketData.source}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">Destination</Typography>
                <Typography variant="body1" fontWeight="500">{ticketData.destination}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">Amount Paid</Typography>
                <Typography variant="body1" fontWeight="bold" color="primary">₹{ticketData.price}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="textSecondary">Transport Type</Typography>
                <Typography variant="body1">{ticketData.type}</Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="textSecondary">Date</Typography>
                <Typography variant="body2">{ticketData.date}</Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ScanTicket;
