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
    .min(1, "Must be at least 1MB")
    .required("Max file size is required"),
  defaultCurrency: yup.string().required("Default currency is required"),
  sessionTimeout: yup
    .number()
    .min(5, "Must be at least 5 minutes")
    .required("Session timeout is required"),
  emailSettings: yup.object({
    smtpHost: yup.string().required("SMTP host is required"),
    smtpPort: yup.number().required("SMTP port is required"),
    smtpUser: yup.string().required("SMTP username is required"),
    smtpPassword: yup.string().required("SMTP password is required"),
  }),
  securitySettings: yup.object({
    maxLoginAttempts: yup
      .number()
      .min(1, "Must be at least 1")
      .required("Max login attempts is required"),
    passwordExpiryDays: yup
      .number()
      .min(30, "Must be at least 30 days")
      .required("Password expiry days is required"),
    requireTwoFactor: yup.boolean(),
  }),
});

const Settings = () => {
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
        smtpPassword: "",
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
        await axios.patch("/api/admin/settings", values);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (err) {
        setError(err.response?.data?.message || "Error updating settings");
        setTimeout(() => setError(null), 3000);
      }
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get("/api/admin/settings");
        formik.setValues(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching settings");
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
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
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              General Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="siteName"
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
                  id="supportEmail"
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
                  id="maxFileSize"
                  name="maxFileSize"
                  label="Max File Size (MB)"
                  type="number"
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
                <TextField
                  fullWidth
                  id="defaultCurrency"
                  name="defaultCurrency"
                  label="Default Currency"
                  value={formik.values.defaultCurrency}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.defaultCurrency &&
                    Boolean(formik.errors.defaultCurrency)
                  }
                  helperText={
                    formik.touched.defaultCurrency &&
                    formik.errors.defaultCurrency
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="sessionTimeout"
                  name="sessionTimeout"
                  label="Session Timeout (minutes)"
                  type="number"
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
                      checked={formik.values.maintenanceMode}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "maintenanceMode",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Maintenance Mode"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.allowRegistration}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "allowRegistration",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Allow Registration"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Email Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="emailSettings.smtpHost"
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
                  id="emailSettings.smtpPort"
                  name="emailSettings.smtpPort"
                  label="SMTP Port"
                  type="number"
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
                  id="emailSettings.smtpUser"
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
                  id="emailSettings.smtpPassword"
                  name="emailSettings.smtpPassword"
                  label="SMTP Password"
                  type="password"
                  value={formik.values.emailSettings.smtpPassword}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.emailSettings?.smtpPassword &&
                    Boolean(formik.errors.emailSettings?.smtpPassword)
                  }
                  helperText={
                    formik.touched.emailSettings?.smtpPassword &&
                    formik.errors.emailSettings?.smtpPassword
                  }
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Security Settings
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="securitySettings.maxLoginAttempts"
                  name="securitySettings.maxLoginAttempts"
                  label="Max Login Attempts"
                  type="number"
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
                  id="securitySettings.passwordExpiryDays"
                  name="securitySettings.passwordExpiryDays"
                  label="Password Expiry (days)"
                  type="number"
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
                      checked={formik.values.securitySettings.requireTwoFactor}
                      onChange={(e) =>
                        formik.setFieldValue(
                          "securitySettings.requireTwoFactor",
                          e.target.checked
                        )
                      }
                    />
                  }
                  label="Require Two-Factor Authentication"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box display="flex" justifyContent="flex-end">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!formik.isValid || !formik.dirty}
          >
            Save Settings
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default Settings;
