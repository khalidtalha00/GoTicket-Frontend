import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container, IconButton, type ButtonProps } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { mode, toggleColorMode } = useThemeMode();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // close menu on route change
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  type NavItem = {
    label: string;
    onClick: () => void | Promise<void>;
    color: ButtonProps['color'];
    variant?: ButtonProps['variant'];
  };

  const navItems: NavItem[] = !user
    ? [
        { label: 'Login', onClick: () => navigate('/login'), color: 'primary' as const },
        { label: 'Register', onClick: () => navigate('/register'), color: 'primary' as const, variant: 'contained' as const },
      ]
    : [
        ...(user.role === 'passenger'
          ? [
              { label: 'Dashboard', onClick: () => navigate('/passenger/dashboard'), color: 'primary' as const },
              { label: 'Book', onClick: () => navigate('/passenger/book'), color: 'primary' as const },
              { label: 'My Tickets', onClick: () => navigate('/passenger/tickets'), color: 'primary' as const },
              { label: 'Profile', onClick: () => navigate('/passenger/profile'), color: 'primary' as const },
            ]
          : []),
        ...(user.role === 'driver'
          ? [
              { label: 'Dashboard', onClick: () => navigate('/driver/dashboard'), color: 'primary' as const },
              { label: 'Scan Ticket', onClick: () => navigate('/driver/scan'), color: 'primary' as const },
              { label: 'Profile', onClick: () => navigate('/driver/profile'), color: 'primary' as const },
            ]
          : []),
        { label: 'Logout', onClick: handleLogout, color: 'error' as const },
      ];

  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ backdropFilter: 'blur(8px)' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ position: 'relative', minHeight: { xs: 56, sm: 64 }, py: { xs: 0.5, sm: 0 } }}>
          <Box
            component={Link}
            to="/"
            aria-label="Go to home"
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'primary.main',
              flexShrink: 0,
              mr: 'auto',     // left-most, pushes rest to right
              pl: 1,
              zIndex: 3       // keep above mobile overlays
            }}
          >
            <DirectionsBusIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography
              variant="h6"
              component="span"
              noWrap
              sx={{
                display: 'block', // always visible including mobile
                fontFamily: 'Poppins',
                fontWeight: 700,
                letterSpacing: '.08rem',
                color: 'primary.main',
                lineHeight: 1
              }}
            >
              GoTicket
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
              {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button
                  key={item.label}
                  color={item.color}
                  variant={item.variant}
                  onClick={item.onClick}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          </Box>

          <button
            className={`hamburger-btn ${menuOpen ? 'open' : ''}`}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            type="button"
          >
            <span />
            <span />
            <span />
          </button>

          <div className={`mobile-nav-links ${menuOpen ? 'open' : ''}`}>
            {navItems.map((item) => (
              <Button
                key={`mobile-${item.label}`}
                color={item.color}
                variant={item.variant ?? 'text'}
                onClick={item.onClick}
                sx={{ justifyContent: 'flex-start' }}
                fullWidth
              >
                {item.label}
              </Button>
            ))}
          </div>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
