import React, { useState } from 'react';
import { Container, Paper, Typography, Button, ToggleButton, ToggleButtonGroup, Box, TextField, Alert, MenuItem } from '@mui/material';
import { useAuth, type UserRole } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('passenger');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [vehicleType, setVehicleType] = useState('Bus (Non-AC)');
  const [vehicleName, setVehicleName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(
        name,
        email,
        password,
        role,
        role === 'driver' ? vehicleType : undefined,
        role === 'driver' ? vehicleName : undefined,
        role === 'driver' ? vehicleNumber : undefined
      );
      navigate('/', { state: { loginSuccess: true } });
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: { xs: 3, md: 8 }, px: { xs: 1, sm: 2 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2.5, sm: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.8rem', sm: '2.125rem' }, textAlign: 'center' }}>
          Register for GoTicket
        </Typography>
        
        {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}

        <Box sx={{ mb: 3, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={role}
            exclusive
            onChange={(_, newRole) => newRole && setRole(newRole)}
            aria-label="user role"
            fullWidth
            sx={{ maxWidth: 360 }}
          >
            <ToggleButton value="passenger">Passenger</ToggleButton>
            <ToggleButton value="driver">Driver</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box component="form" onSubmit={handleRegister} sx={{ width: '100%' }}>
          <TextField 
            label="Full Name" 
            fullWidth 
            margin="normal" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <TextField 
            label="Email" 
            fullWidth 
            margin="normal" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField 
            label="Password" 
            type="password" 
            fullWidth 
            margin="normal" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {role === 'driver' && (
            <>
              <TextField
                select
                label="Vehicle Type"
                fullWidth
                margin="normal"
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                required
              >
                <MenuItem value="Bus (Non-AC)">Bus (Non-AC)</MenuItem>
                <MenuItem value="Bus (AC)">Bus (AC)</MenuItem>
                <MenuItem value="Cab">Cab</MenuItem>
                <MenuItem value="Bike Taxi">Bike Taxi</MenuItem>
              </TextField>
              <TextField 
                label="Vehicle Name / Model" 
                fullWidth 
                margin="normal" 
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
                required
              />
              <TextField
                label="Vehicle Number"
                fullWidth
                margin="normal"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                placeholder="e.g. DL1PC1234"
                required
              />
            </>
          )}

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
            Register
          </Button>
        </Box>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2">
            Already have an account? <Link to="/login">Login here</Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
