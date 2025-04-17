import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import axios from "axios";

const validationSchema = yup.object({
  siteName: yup.string().required("Site name is required"),
  supportEmail: yup
    .string()
    .email("Invalid email")
    .required("Support email is required"),
  maxFileSize: yup
    .number()
    .min(1, "File size must be at least 1MB")
    .max(10, "File size cannot exceed 10MB")
    .required("Max file size is required"),
  maintenanceMode: yup.boolean(),
  allowRegistration: yup.boolean(),
  defaultCurrency: yup.string().required("Default currency is required"),
  sessionTimeout: yup
    .number()
    .min(5, "Session timeout must be at least 5 minutes")
    .max(120, "Session timeout cannot exceed 120 minutes")
    .required("Session timeout is required"),
  emailSettings: yup.object({
    smtpHost: yup.string().required("SMTP host is required"),
    smtpPort: yup
      .number()
      .min(1, "Port must be at least 1")
      .max(65535, "Port cannot exceed 65535")
      .required("SMTP port is required"),
    smtpUser: yup.string().required("SMTP username is required"),
    smtpPass: yup.string().required("SMTP password is required"),
  }),
  securitySettings: yup.object({
    maxLoginAttempts: yup
      .number()
      .min(1, "Max login attempts must be at least 1")
      .max(10, "Max login attempts cannot exceed 10")
      .required("Max login attempts is required"),
    passwordExpiryDays: yup
      .number()
      .min(30, "Password expiry must be at least 30 days")
      .max(365, "Password expiry cannot exceed 365 days")
      .required("Password expiry days is required"),
    requireTwoFactor: yup.boolean(),
  }),
});

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      siteName: "",
      supportEmail: "",
      maxFileSize: 5,
      maintenanceMode: false,
      allowRegistration: true,
      defaultCurrency: "USD",
      sessionTimeout: 30,
      emailSettings: {
        smtpHost: "",
        smtpPort: 587,
        smtpUser: "",
        smtpPass: "",
      },
      securitySettings: {
        maxLoginAttempts: 5,
        passwordExpiryDays: 90,
        requireTwoFactor: false,
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setError(null);
        await axios.put("/api/admin/settings", values, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to update settings");
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/admin/settings", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        formik.setValues(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading && !formik.values.siteName) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Settings updated successfully
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="siteName"
                  label="Site Name"
                  value={formik.values.siteName}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.siteName && Boolean(formik.errors.siteName)
                  }
                  helperText={formik.touched.siteName && formik.errors.siteName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="supportEmail"
                  label="Support Email"
                  value={formik.values.supportEmail}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.supportEmail &&
                    Boolean(formik.errors.supportEmail)
                  }
                  helperText={
                    formik.touched.supportEmail && formik.errors.supportEmail
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="maxFileSize"
                  label="Max File Size (MB)"
                  value={formik.values.maxFileSize}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.maxFileSize &&
                    Boolean(formik.errors.maxFileSize)
                  }
                  helperText={
                    formik.touched.maxFileSize && formik.errors.maxFileSize
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Default Currency</InputLabel>
                  <Select
                    name="defaultCurrency"
                    value={formik.values.defaultCurrency}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.defaultCurrency &&
                      Boolean(formik.errors.defaultCurrency)
                    }
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                    <MenuItem value="JPY">JPY</MenuItem>
                    <MenuItem value="INR">INR</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="sessionTimeout"
                  label="Session Timeout (minutes)"
                  value={formik.values.sessionTimeout}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.sessionTimeout &&
                    Boolean(formik.errors.sessionTimeout)
                  }
                  helperText={
                    formik.touched.sessionTimeout &&
                    formik.errors.sessionTimeout
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="maintenanceMode"
                      checked={formik.values.maintenanceMode}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Maintenance Mode"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="allowRegistration"
                      checked={formik.values.allowRegistration}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Allow Registration"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Email Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="emailSettings.smtpHost"
                  label="SMTP Host"
                  value={formik.values.emailSettings.smtpHost}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.emailSettings?.smtpHost &&
                    Boolean(formik.errors.emailSettings?.smtpHost)
                  }
                  helperText={
                    formik.touched.emailSettings?.smtpHost &&
                    formik.errors.emailSettings?.smtpHost
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="emailSettings.smtpPort"
                  label="SMTP Port"
                  value={formik.values.emailSettings.smtpPort}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.emailSettings?.smtpPort &&
                    Boolean(formik.errors.emailSettings?.smtpPort)
                  }
                  helperText={
                    formik.touched.emailSettings?.smtpPort &&
                    formik.errors.emailSettings?.smtpPort
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="emailSettings.smtpUser"
                  label="SMTP Username"
                  value={formik.values.emailSettings.smtpUser}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.emailSettings?.smtpUser &&
                    Boolean(formik.errors.emailSettings?.smtpUser)
                  }
                  helperText={
                    formik.touched.emailSettings?.smtpUser &&
                    formik.errors.emailSettings?.smtpUser
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="password"
                  name="emailSettings.smtpPass"
                  label="SMTP Password"
                  value={formik.values.emailSettings.smtpPass}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.emailSettings?.smtpPass &&
                    Boolean(formik.errors.emailSettings?.smtpPass)
                  }
                  helperText={
                    formik.touched.emailSettings?.smtpPass &&
                    formik.errors.emailSettings?.smtpPass
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="securitySettings.maxLoginAttempts"
                  label="Max Login Attempts"
                  value={formik.values.securitySettings.maxLoginAttempts}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.securitySettings?.maxLoginAttempts &&
                    Boolean(formik.errors.securitySettings?.maxLoginAttempts)
                  }
                  helperText={
                    formik.touched.securitySettings?.maxLoginAttempts &&
                    formik.errors.securitySettings?.maxLoginAttempts
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="number"
                  name="securitySettings.passwordExpiryDays"
                  label="Password Expiry (days)"
                  value={formik.values.securitySettings.passwordExpiryDays}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.securitySettings?.passwordExpiryDays &&
                    Boolean(formik.errors.securitySettings?.passwordExpiryDays)
                  }
                  helperText={
                    formik.touched.securitySettings?.passwordExpiryDays &&
                    formik.errors.securitySettings?.passwordExpiryDays
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="securitySettings.requireTwoFactor"
                      checked={formik.values.securitySettings.requireTwoFactor}
                      onChange={formik.handleChange}
                    />
                  }
                  label="Require Two-Factor Authentication"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !formik.isValid || !formik.dirty}
          >
            {loading ? <CircularProgress size={24} /> : "Save Settings"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default AdminSettings;
