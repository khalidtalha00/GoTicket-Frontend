import React, { useState, useMemo, useRef } from 'react';
import { Container, Paper, Typography, Avatar, Box, Divider, Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketContext';
import { buildApiUrl, buildAssetUrl } from '../../utils/api';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { tickets } = useTickets();
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [timeFilter, setTimeFilter] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredTickets = useMemo(() => {
    if (timeFilter === 'all') return tickets;

    const now = new Date();
    return tickets.filter(ticket => {
      const ticketDate = new Date(ticket.date);
      // Check if date is valid
      if (isNaN(ticketDate.getTime())) return false;

      const diffTime = Math.abs(now.getTime() - ticketDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (timeFilter === 'week') return diffDays <= 7;
      if (timeFilter === 'month') return diffDays <= 30;
      if (timeFilter === 'year') return diffDays <= 365;
      return true;
    });
  }, [tickets, timeFilter]);

  const totalRides = filteredTickets.length;
  const totalSpent = filteredTickets.reduce((sum, ticket) => sum + ticket.price, 0);
  // Mock distance calculation based on price (assuming avg 10rs/km for simplicity in this view)
  const totalDistance = Math.floor(totalSpent / 10); 

  const handleSave = () => {
    if (imageUrl) {
      updateUser({ profilePicture: imageUrl });
    }
    setOpen(false);
    setImageUrl('');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(buildApiUrl('/api/upload'), {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const filePath = await response.json();
        await updateUser({ profilePicture: filePath });
        setOpen(false);
      } else {
        console.error('Upload failed');
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  const getProfileSrc = (path?: string) => {
    if (!path) return undefined;
    return buildAssetUrl(path);
  };

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
      <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexDirection: { xs: 'column', sm: 'row' }, textAlign: { xs: 'center', sm: 'left' } }}>
          <Avatar 
            sx={{ width: { xs: 70, sm: 80 }, height: { xs: 70, sm: 80 }, mr: { xs: 0, sm: 3 }, mb: { xs: 1.5, sm: 0 }, cursor: 'pointer' }} 
            src={getProfileSrc(user?.profilePicture)}
            onClick={() => setOpen(true)}
          >
            {user?.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>{user?.name}</Typography>
            <Typography variant="body1" color="textSecondary">{user?.email}</Typography>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', bgcolor: '#eee', px: 1, borderRadius: 1 }}>
              {user?.role}
            </Typography>
            <Button size="small" sx={{ display: 'block', mt: 1 }} onClick={() => setOpen(true)}>
              Edit Picture
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
          <Typography variant="h6">Ride Statistics</Typography>
          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
            <InputLabel id="time-filter-label">Time Period</InputLabel>
            <Select
              labelId="time-filter-label"
              value={timeFilter}
              label="Time Period"
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="week">Last 7 Days</MenuItem>
              <MenuItem value="month">Last 30 Days</MenuItem>
              <MenuItem value="year">Last Year</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" color="primary">{totalRides}</Typography>
            <Typography variant="body2">Total Rides</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" color="primary">{totalDistance} km</Typography>
            <Typography variant="body2">Est. Distance Traveled</Typography>
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" color="primary">₹{totalSpent}</Typography>
            <Typography variant="body2">Total Spent</Typography>
          </Box>
        </Box>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
              sx={{ mb: 2, py: 1.5 }}
            >
              Upload from Gallery
            </Button>
            <input
              type="file"
              hidden
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
            />
            
            <Divider sx={{ my: 2 }}>OR</Divider>

            <TextField
              margin="dense"
              label="Image URL"
              type="url"
              fullWidth
              variant="outlined"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              helperText="Enter a direct link to an image"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save URL</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;
