import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  fetchSystemSettings,
  updateSystemSettings,
} from "../../redux/slices/adminSlice";

const validationSchema = yup.object({
  siteName: yup.string().required("Site name is required"),
  supportEmail: yup
    .string()
    .email("Invalid email")
    .required("Support email is required"),
  maxFileSize: yup
    .number()
    .required("Max file size is required")
    .positive("Must be positive"),
  maintenanceMode: yup.boolean(),
  allowRegistration: yup.boolean(),
  defaultCurrency: yup.string().required("Default currency is required"),
  sessionTimeout: yup
    .number()
    .required("Session timeout is required")
    .positive("Must be positive"),
});

function SystemSettings() {
  const dispatch = useDispatch();
  const { settings, loading } = useSelector((state) => state.admin);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(fetchSystemSettings());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      siteName: settings?.siteName || "",
      supportEmail: settings?.supportEmail || "",
      maxFileSize: settings?.maxFileSize || 5,
      maintenanceMode: settings?.maintenanceMode || false,
      allowRegistration: settings?.allowRegistration || true,
      defaultCurrency: settings?.defaultCurrency || "USD",
      sessionTimeout: settings?.sessionTimeout || 30,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        await dispatch(updateSystemSettings(values));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (error) {
        setError("Failed to update system settings");
        setTimeout(() => setError(""), 3000);
      }
    },
  });

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", p: 3 }}>
      <Typography variant="h5" gutterBottom>
        System Settings
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Settings updated successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                General Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

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

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Security Settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
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
                  formik.touched.sessionTimeout && formik.errors.sessionTimeout
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.maintenanceMode}
                    onChange={(e) =>
                      formik.setFieldValue("maintenanceMode", e.target.checked)
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
                label="Allow User Registration"
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Button type="submit" variant="contained">
                  Save Settings
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

export default SystemSettings;
