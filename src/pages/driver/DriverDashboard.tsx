import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  TextField,
  MenuItem,
  Autocomplete,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import { buildApiUrl } from '../../utils/api';

type LocationOption = { id: string; name: string };

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addDriverRoute, removeDriverRoute, driverRoutes } = useTickets();

  const [routeForm, setRouteForm] = useState({
    source: '',
    destination: '',
    transportType: 'Bus (Non-AC)',
  });

  const [metroStations, setMetroStations] = useState<LocationOption[]>([]);
  const [sourcePicked, setSourcePicked] = useState(false);
  const [destinationPicked, setDestinationPicked] = useState(false);

  useEffect(() => {
    fetch(buildApiUrl('/api/metro/stations'))
      .then(res => res.json())
      .then(data => setMetroStations(data))
      .catch(err => console.error('Failed to fetch metro stations:', err));
  }, []);

  const driverId = String(user?._id || user?.email || 'unknown-driver');
  const myRoutes = driverRoutes.filter((r) => r.driverId === driverId);

  const onAddRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeForm.source.trim() || !routeForm.destination.trim()) return;

    // Remove existing active routes for this driver to register a new one
    myRoutes.forEach((route) => {
      removeDriverRoute(route.id);
    });

    addDriverRoute({
      driverId,
      source: routeForm.source.trim(),
      destination: routeForm.destination.trim(),
      transportType: routeForm.transportType,
    });

    setRouteForm((s) => ({ ...s, source: '', destination: '' }));
    setSourcePicked(false);
    setDestinationPicked(false);
  };

  const canSaveRoute =
    sourcePicked &&
    destinationPicked &&
    routeForm.source.trim().length > 0 &&
    routeForm.destination.trim().length > 0;

  return (
    <Container maxWidth="lg" sx={{ mt: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" gutterBottom>
        Driver Dashboard
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: { xs: 2.5, md: 3 }, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Today&apos;s Earnings
            </Typography>
            <Typography variant="h3" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>₹1,250</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: { xs: 2.5, md: 3 }, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Monthly Earnings
            </Typography>
            <Typography variant="h3" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>₹28,400</Typography>
          </Paper>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: { xs: 2.5, md: 3 }, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              Total Rides
            </Typography>
            <Typography variant="h3" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>45</Typography>
          </Paper>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Paper
            sx={{
              p: { xs: 2.5, md: 3 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: { xs: 160, md: 200 },
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Verify Ticket
            </Typography>
            <Button variant="contained" size="large" onClick={() => navigate('/driver/scan')} fullWidth sx={{ maxWidth: 220 }}>
              Scan QR Code
            </Button>
          </Paper>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Recent Payments
            </Typography>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee', gap: 1 }}>
                <Typography>Ride #1234</Typography>
                <Typography color="green">+ ₹150</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #eee' }}>
                <Typography>Ride #1235</Typography>
                <Typography color="green">+ ₹50</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                <Typography>Ride #1236</Typography>
                <Typography color="green">+ ₹200</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Paper sx={{ mt: 3, p: { xs: 2.5, md: 3 } }}>
        <Typography variant="h6" gutterBottom>
          Add Running Route
        </Typography>

        <Box component="form" onSubmit={onAddRoute} sx={{ display: 'grid', gap: 2 }}>
          <Autocomplete
            options={metroStations}
            getOptionLabel={(option) => option?.name || ''}
            value={metroStations.find(s => s.name === routeForm.source) || null}
            onChange={(_, newValue) => {
              if (newValue) {
                setRouteForm((s) => ({ ...s, source: newValue.name }));
                setSourcePicked(true);
              } else {
                setRouteForm((s) => ({ ...s, source: '' }));
                setSourcePicked(false);
              }
            }}
            renderInput={(params) => <TextField {...params} label="Source" fullWidth />}
          />

          <Autocomplete
            options={metroStations}
            getOptionLabel={(option) => option?.name || ''}
            value={metroStations.find(s => s.name === routeForm.destination) || null}
            onChange={(_, newValue) => {
              if (newValue) {
                setRouteForm((s) => ({ ...s, destination: newValue.name }));
                setDestinationPicked(true);
              } else {
                setRouteForm((s) => ({ ...s, destination: '' }));
                setDestinationPicked(false);
              }
            }}
            renderInput={(params) => <TextField {...params} label="Destination" fullWidth />}
          />

          <TextField
            select
            label="Transport Type"
            value={routeForm.transportType}
            onChange={(e) => setRouteForm((s) => ({ ...s, transportType: e.target.value }))
            }
          >
            <MenuItem value="Bus (Non-AC)">Bus (Non-AC)</MenuItem>
            <MenuItem value="Bus (AC)">Bus (AC)</MenuItem>
            <MenuItem value="Cab">Cab</MenuItem>
            <MenuItem value="Bike Taxi">Bike Taxi</MenuItem>
          </TextField>

          {!canSaveRoute && (
            <Alert severity="info">
              Select both source and destination from map suggestions to save route.
            </Alert>
          )}

          <Button type="submit" variant="contained" disabled={!canSaveRoute}>
            Save Route
          </Button>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            My Active Routes
          </Typography>
          {myRoutes.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              No routes added yet.
            </Typography>
          ) : (
            <List>
              {myRoutes.map((r) => (
                <ListItem key={r.id} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1, border: '1px solid #eee' }}>
                  <ListItemText
                    primary={`${r.source} → ${r.destination}`}
                    secondary={r.transportType}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" onClick={() => removeDriverRoute(r.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
