import React, { useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useAuth } from '../../context/AuthContext';
import { buildApiUrl, buildAssetUrl } from '../../utils/api';

const DRIVER_TRANSPORT_TYPES = ['Bus (Non-AC)', 'Bus (AC)', 'Cab', 'Bike Taxi'];

const DriverProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [vehicleType, setVehicleType] = useState(user?.vehicleType || 'Bus (Non-AC)');
  const [vehicleName, setVehicleName] = useState(user?.vehicleName || '');
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicleNumber || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [openPictureDialog, setOpenPictureDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await updateUser({
        name: name.trim(),
        email: email.trim(),
        vehicleType,
        vehicleName: vehicleName.trim(),
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
      });
      setSuccess('Profile updated successfully.');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePictureUrlSave = async () => {
    if (!imageUrl.trim()) return;
    try {
      await updateUser({ profilePicture: imageUrl.trim() });
      setImageUrl('');
      setOpenPictureDialog(false);
      setSuccess('Profile picture updated.');
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to update profile picture.');
    }
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

      if (!response.ok) {
        setError('Failed to upload image.');
        return;
      }

      const filePath = await response.json();
      await updateUser({ profilePicture: filePath });
      setOpenPictureDialog(false);
      setSuccess('Profile picture updated.');
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to upload image.');
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, md: 4 }, px: { xs: 1, sm: 2 } }}>
      <Paper sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mb: 3,
            gap: 2,
            flexDirection: { xs: 'column', sm: 'row' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Avatar
            src={user?.profilePicture ? buildAssetUrl(user.profilePicture) : undefined}
            sx={{ width: 80, height: 80, cursor: 'pointer' }}
            onClick={() => setOpenPictureDialog(true)}
          >
            {user?.name?.charAt(0) || 'D'}
          </Avatar>
          <Box>
            <Typography variant="h5">Driver Profile</Typography>
            <Typography variant="body2" color="textSecondary">
              Manage your personal and vehicle details
            </Typography>
            <Button size="small" sx={{ mt: 1 }} onClick={() => setOpenPictureDialog(true)}>
              Edit Picture
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 2.5 }} />

        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <Box component="form" onSubmit={handleSave} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            select
            label="Vehicle Type"
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            fullWidth
          >
            {DRIVER_TRANSPORT_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Vehicle Name / Model"
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Vehicle Number"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
            placeholder="e.g. DL1PC1234"
            required
            fullWidth
          />

          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Paper>

      <Dialog open={openPictureDialog} onClose={() => setOpenPictureDialog(false)} fullWidth maxWidth="xs">
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
          <Button onClick={() => setOpenPictureDialog(false)}>Cancel</Button>
          <Button onClick={handlePictureUrlSave} variant="contained">Save URL</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DriverProfile;
