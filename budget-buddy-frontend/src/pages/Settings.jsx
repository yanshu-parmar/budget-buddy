import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  alpha,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  CssBaseline,
} from "@mui/material";
import {
  AttachMoney,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const Settings = () => {
  // Load settings from localStorage
  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }

    // Default settings
    return {
      appearance: {
        darkMode: false,
        showCharts: true,
      },
      currency: "USD",
    };
  };

  // Settings state
  const [settings, setSettings] = useState(loadSettings);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Create a theme based on the dark mode setting
  const appTheme = createTheme({
    palette: {
      mode: settings.appearance.darkMode ? "dark" : "light",
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#dc004e",
      },
      background: {
        default: settings.appearance.darkMode ? "#121212" : "#f5f5f5",
        paper: settings.appearance.darkMode ? "#1e1e1e" : "#ffffff",
      },
    },
  });

  // Apply settings when component mounts or settings change
  useEffect(() => {
    // Store settings in localStorage for persistence
    localStorage.setItem("userSettings", JSON.stringify(settings));

    // Apply dark mode by updating the document's color scheme
    if (settings.appearance.darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.style.backgroundColor = "#121212";
      document.body.style.color = "#ffffff";
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.body.style.backgroundColor = "#f5f5f5";
      document.body.style.color = "#000000";
    }
  }, [settings]);

  const handleSelect = (setting, value) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleSave = async () => {
    try {
      // Simulate API call with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Save to localStorage
      localStorage.setItem("userSettings", JSON.stringify(settings));

      // Show success message
      setSnackbar({
        open: true,
        message: "Settings saved successfully!",
        severity: "success",
      });
    } catch (error) {
      // Show error message
      setSnackbar({
        open: true,
        message: "Failed to save settings. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Currency Settings */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ borderRadius: 2 }}>
              <CardHeader
                title="Currency"
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: alpha(appTheme.palette.info.main, 0.1),
                      color: appTheme.palette.info.main,
                    }}
                  >
                    <AttachMoney />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Currency"
                      secondary="Select your preferred currency"
                    />
                    <ListItemSecondaryAction>
                      <FormControl fullWidth>
                        <InputLabel>Currency</InputLabel>
                        <Select
                          value={settings.currency}
                          label="Currency"
                          onChange={(e) =>
                            handleSelect("currency", e.target.value)
                          }
                        >
                          <MenuItem value="USD">USD ($)</MenuItem>
                          <MenuItem value="INR">INR (₹)</MenuItem>
                        </Select>
                      </FormControl>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" mt={4}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Settings;
