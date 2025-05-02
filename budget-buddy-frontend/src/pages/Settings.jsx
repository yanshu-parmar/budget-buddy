import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Avatar,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CssBaseline,
} from "@mui/material";
import { ThemeProvider, createTheme, alpha } from "@mui/material/styles";
import { AttachMoney, Save as SaveIcon } from "@mui/icons-material";

const Settings = () => {
  // Load settings from localStorage or use default
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem("userSettings");
      return saved ? JSON.parse(saved) : getDefaultSettings();
    } catch {
      return getDefaultSettings();
    }
  };

  const getDefaultSettings = () => ({
    appearance: {
      darkMode: false,
      showCharts: true,
    },
    currency: "USD",
  });

  const [settings, setSettings] = useState(loadSettings);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Create MUI theme
  const theme = createTheme({
    palette: {
      mode: settings.appearance.darkMode ? "dark" : "light",
      primary: { main: "#1976d2" },
      secondary: { main: "#dc004e" },
      background: {
        default: settings.appearance.darkMode ? "#121212" : "#f5f5f5",
        paper: settings.appearance.darkMode ? "#1e1e1e" : "#ffffff",
      },
    },
  });

  // Save settings on change
  useEffect(() => {
    localStorage.setItem("userSettings", JSON.stringify(settings));
    document.body.style.backgroundColor = theme.palette.background.default;
    document.body.style.color = settings.appearance.darkMode ? "#fff" : "#000";
  }, [settings]);

  const handleSelectChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await new Promise((res) => setTimeout(res, 1000)); // Simulate API
      setSnackbar({
        open: true,
        message: "Settings saved successfully!",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to save settings. Please try again.",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box maxWidth="700px" mx="auto" px={3} py={4}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card elevation={3} sx={{ borderRadius: 2 }}>
              <CardHeader
                title="Currency"
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                    }}
                  >
                    <AttachMoney />
                  </Avatar>
                }
              />
              <Divider />
              <CardContent>
                <FormControl fullWidth>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={settings.currency}
                    label="Currency"
                    onChange={(e) =>
                      handleSelectChange("currency", e.target.value)
                    }
                  >
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="INR">INR (₹)</MenuItem>
                    {/* Add more currencies if needed */}
                  </Select>
                </FormControl>
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
            severity={snackbar.severity}
            onClose={handleCloseSnackbar}
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
