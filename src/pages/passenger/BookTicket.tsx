import { useCallback, useMemo, useState, useEffect } from 'react';
import { Avatar, Container, Paper, Typography, TextField, Button, MenuItem, Box, Autocomplete } from '@mui/material';
import QRCode from 'react-qr-code';
import { useTickets, type Ticket } from '../../context/TicketContext';
import { useAuth } from '../../context/AuthContext';
import Map, { type MetroStationMarker } from '../../components/Map';
import { buildApiUrl } from '../../utils/api';
import { buildAssetUrl } from '../../utils/api';

type Coordinates = { lat: number; lng: number };

const transportTypes = [
  { value: 'bus_non_ac', label: 'Bus (Non-AC)', pricePerKm: 5 },
  { value: 'bus_ac', label: 'Bus (AC)', pricePerKm: 8 },
  { value: 'metro', label: 'Metro', pricePerKm: 10 },
  { value: 'cab', label: 'Cab', pricePerKm: 15 },
  { value: 'bike_taxi', label: 'Bike Taxi', pricePerKm: 7 },
];

// METRO_STATIONS will be fetched from API

export default function BookTicket() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [transportType, setTransportType] = useState('bus_non_ac');
  const [ticket, setTicket] = useState<Ticket | null>(null);

  const { addTicket, getRouteAvailability } = useTickets();
  const { user } = useAuth();

  const [metroStations, setMetroStations] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetch(buildApiUrl('/api/metro/stations'))
      .then(res => res.json())
      .then(data => setMetroStations(data))
      .catch(err => console.error('Failed to fetch metro stations:', err));
  }, []);

  const [isSourceSelectedFromSuggestion, setIsSourceSelectedFromSuggestion] = useState(false);
  const [isDestinationSelectedFromSuggestion, setIsDestinationSelectedFromSuggestion] = useState(false);
  const [metroLocationMessage, setMetroLocationMessage] = useState('');
  const [isResolvingMetroLocation, setIsResolvingMetroLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [nearbyMetroStations, setNearbyMetroStations] = useState<MetroStationMarker[]>([]);

  const handleBook = async () => {
    if (!canBook) return;

    let price = 0;
    const type = transportTypes.find((t) => t.value === transportType);
    let expiryTime: string | undefined;
    let status: string | undefined;

    if (transportType === 'metro') {
      try {
        const response = await fetch(
          buildApiUrl(`/api/metro/route?from=${encodeURIComponent(source)}&to=${encodeURIComponent(destination)}`)
        );
        if (response.ok) {
          const data = await response.json();
          if (data.status === 200) {
            price = data.fare;
          } else {
             price = 20; // fallback
          }
        }
      } catch (err) {
        console.error(err);
        price = 20; // fallback
      }
      expiryTime = new Date(Date.now() + 60 * 60 * 1000).toLocaleString();
      status = 'UNUSED';
    } else {
      const distance = Math.floor(Math.random() * 20) + 1;
      price = distance * (type?.pricePerKm || 0);
    }

    const newTicketData = {
      source,
      destination,
      type: type?.label || 'Unknown',
      price,
      date: new Date().toLocaleString(),
      ...(expiryTime && { expiryTime }),
      ...(status && { status })
    };

    try {
      const createdTicket = await addTicket(newTicketData);
      if (createdTicket) {
        setTicket(createdTicket);
      }
    } catch (error) {
      console.error('Failed to book ticket', error);
      alert('Failed to book ticket. Please try again.');
    }
  };

  const handleLocationFound = useCallback((lat: number, lng: number) => {
    setUserLocation({ lat, lng });
  }, []);

  const requestNearestMetroStation = useCallback(() => {
    if (!navigator.geolocation) {
      setMetroLocationMessage('Geolocation is not supported on this browser.');
      return;
    }

    setIsResolvingMetroLocation(true);
    setMetroLocationMessage('Fetching your location...');
    setNearbyMetroStations([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        try {
          const response = await fetch(
            buildApiUrl(
              `/api/metro/nearby?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}&limit=5`
            )
          );
          const data = await response.json();

          if (!response.ok || data.status !== 200 || !Array.isArray(data.stations) || data.stations.length === 0) {
            setMetroLocationMessage('Could not find a nearby metro station. Please choose manually.');
            return;
          }

          const stations = data.stations as MetroStationMarker[];
          setNearbyMetroStations(stations);
          setSource(stations[0].stationName);
          setIsSourceSelectedFromSuggestion(true);
          setMetroLocationMessage(`Showing ${stations.length} nearest metro stations on map.`);
        } catch (error) {
          console.error('Failed to fetch nearest metro station:', error);
          setMetroLocationMessage('Unable to fetch nearest station right now. Please choose manually.');
        } finally {
          setIsResolvingMetroLocation(false);
        }
      },
      (error) => {
        console.error('Location permission denied or unavailable:', error);
        setMetroLocationMessage('Location permission denied. Please select source station manually.');
        setIsResolvingMetroLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const selectedTransportLabel = useMemo(
    () => transportTypes.find((t) => t.value === transportType)?.label ?? '',
    [transportType]
  );

  const availability = useMemo(
    () => getRouteAvailability({ source, destination, transportType: selectedTransportLabel }),
    [source, destination, selectedTransportLabel, getRouteAvailability]
  );

  const canBook = transportType === 'metro' 
    ? Boolean(source && destination && source !== destination) 
    : availability.available;

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Paper sx={{ p: { xs: 2.5, md: 3 } }}>
            <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '1.75rem' } }}>Book Ticket</Typography>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 500 }}>
              Hello {user?.name}, where would you like to go today?
            </Typography>

            <TextField
              select
              label="Transport Type"
              fullWidth
              margin="normal"
              value={transportType}
              onChange={(e) => {
                const nextTransportType = e.target.value;
                setTransportType(nextTransportType);
                setSource('');
                setDestination('');
                setIsSourceSelectedFromSuggestion(false);
                setIsDestinationSelectedFromSuggestion(false);
                setMetroLocationMessage('');
                setNearbyMetroStations([]);
                if (nextTransportType === 'metro') {
                  requestNearestMetroStation();
                }
              }}
            >
              {transportTypes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <Autocomplete
              key="source"
              options={metroStations}
              getOptionLabel={(option) => option?.name || ''}
              value={metroStations.find(s => s.name === source) || null}
              onChange={(_, newValue) => {
                setSource(newValue?.name || '');
                setIsSourceSelectedFromSuggestion(!!newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} label={transportType === 'metro' ? "Source Station" : "Source"} fullWidth margin="normal" />
              )}
            />
            {transportType === 'metro' && metroLocationMessage ? (
              <Typography
                variant="body2"
                sx={{ mt: 1, color: metroLocationMessage.startsWith('Nearest') ? 'success.main' : 'warning.main' }}
              >
                {metroLocationMessage}
              </Typography>
            ) : null}
            <Autocomplete
              key="destination"
              options={metroStations}
              getOptionLabel={(option) => option?.name || ''}
              value={metroStations.find(s => s.name === destination) || null}
              onChange={(_, newValue) => {
                setDestination(newValue?.name || '');
                setIsDestinationSelectedFromSuggestion(!!newValue);
              }}
              renderInput={(params) => (
                <TextField {...params} label={transportType === 'metro' ? "Destination Station" : "Destination"} fullWidth margin="normal" />
              )}
            />

            <Box sx={{ mt: 2 }}>
              {canBook ? (
                <Typography variant="body2" color="textSecondary">
                  {transportType === 'metro' ? 'Metro route available!' : 'Checking seat availability...'} <span style={{ color: 'green' }}>Available</span>
                </Typography>
              ) : transportType === 'metro' ? (
                <Typography variant="body2" color="textSecondary">
                  Please select a valid source and destination.
                </Typography>
              ) : availability.nearbyMatches.length > 0 ? (
                <Typography variant="body2" color="warning.main">
                  No exact ride. Nearby routes are running.
                </Typography>
              ) : (
                <Typography variant="body2" color="error.main">
                  No rides nearby
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 3, minHeight: 44 }}
              onClick={handleBook}
              disabled={
                isResolvingMetroLocation ||
                !isSourceSelectedFromSuggestion ||
                !isDestinationSelectedFromSuggestion ||
                !canBook
              }
            >
              Pay & Book
            </Button>
          </Paper>
        </Box>

        <Box sx={{ flex: 1 }}>
          {ticket ? (
            <Paper sx={{ p: { xs: 2.5, md: 3 }, textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.4rem', md: '1.75rem' } }}>Ticket Generated</Typography>
              <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                <QRCode value={JSON.stringify(ticket)} size={130} />
              </Box>
              <Typography variant="h6">₹{ticket.price}</Typography>
              <Typography variant="body1">{ticket.source} to {ticket.destination}</Typography>
              <Typography variant="body2" color="textSecondary">{ticket.type}</Typography>
              <Typography variant="caption">{ticket.date}</Typography>
              {ticket.driver ? (
                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'left',
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'center',
                  }}
                >
                  <Avatar src={ticket.driver.profilePicture ? buildAssetUrl(ticket.driver.profilePicture) : undefined}>
                    {ticket.driver.name?.charAt(0) || 'D'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2">Driver: {ticket.driver.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Vehicle: {ticket.driver.vehicleName || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Number: {ticket.driver.vehicleNumber || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              ) : null}
            </Paper>
          ) : (
            <Paper
              sx={{
                height: '100%',
                minHeight: { xs: 340, md: 460 },
                overflow: 'hidden',
                borderRadius: 2,
                p: 0.5,
              }}
            >
              <Map
                onLocationFound={handleLocationFound}
                userLocation={userLocation}
                metroStations={nearbyMetroStations}
                showMetroStations={transportType === 'metro'}
                height={transportType === 'metro' ? 'clamp(360px, 50vh, 560px)' : 'clamp(340px, 45vh, 500px)'}
              />
            </Paper>
          )}
        </Box>
      </Box>
    </Container>
  );
}
