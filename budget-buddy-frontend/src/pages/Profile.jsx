import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Edit as EditIcon,
  PhotoCamera as PhotoCameraIcon,
} from "@mui/icons-material";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { updateProfile, updatePassword } from "../redux/slices/authSlice";

const profileValidationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().matches(
    /^[0-9]+$/,
    "Phone number must contain only digits"
  ),
  address: Yup.string(),
});

const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Confirm password is required"),
});

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleProfileUpdate = async (values) => {
    try {
      await dispatch(updateProfile(values)).unwrap();
      setSuccessMessage("Profile updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      // Error is handled by the reducer
    }
  };

  const handlePasswordUpdate = async (values) => {
    try {
      await dispatch(updatePassword(values)).unwrap();
      setOpenPasswordDialog(false);
      setSuccessMessage("Password updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      // Error is handled by the reducer
    }
  };

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
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Box position="relative" display="inline-block">
              <Avatar
                src={user?.avatar}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <IconButton
                color="primary"
                component="label"
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "background.paper",
                }}
              >
                <input hidden accept="image/*" type="file" />
                <PhotoCameraIcon />
              </IconButton>
            </Box>
            <Typography variant="h6">{user?.name}</Typography>
            <Typography color="textSecondary">{user?.email}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Member since {new Date(user?.createdAt).toLocaleDateString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6">Personal Information</Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setOpenPasswordDialog(true)}
              >
                Change Password
              </Button>
            </Box>

            <Formik
              initialValues={{
                name: user?.name || "",
                email: user?.email || "",
                phone: user?.phone || "",
                address: user?.address || "",
              }}
              validationSchema={profileValidationSchema}
              onSubmit={handleProfileUpdate}
            >
              {({ values, handleChange, handleBlur, errors, touched }) => (
                <Form>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="name"
                        label="Name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.name && Boolean(errors.name)}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="email"
                        label="Email"
                        value={values.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.email && Boolean(errors.email)}
                        helperText={touched.email && errors.email}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="phone"
                        label="Phone"
                        value={values.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.phone && Boolean(errors.phone)}
                        helperText={touched.phone && errors.phone}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="address"
                        label="Address"
                        value={values.address}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched.address && Boolean(errors.address)}
                        helperText={touched.address && errors.address}
                        multiline
                        rows={3}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained" color="primary">
                        Save Changes
                      </Button>
                    </Grid>
                  </Grid>
                </Form>
              )}
            </Formik>
          </Paper>
        </Grid>
      </Grid>

      <Dialog
        open={openPasswordDialog}
        onClose={() => setOpenPasswordDialog(false)}
      >
        <DialogTitle>Change Password</DialogTitle>
        <Formik
          initialValues={{
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validationSchema={passwordValidationSchema}
          onSubmit={handlePasswordUpdate}
        >
          {({ values, handleChange, handleBlur, errors, touched }) => (
            <Form>
              <DialogContent>
                <TextField
                  fullWidth
                  name="currentPassword"
                  label="Current Password"
                  type="password"
                  value={values.currentPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.currentPassword && Boolean(errors.currentPassword)
                  }
                  helperText={touched.currentPassword && errors.currentPassword}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type="password"
                  value={values.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.newPassword && Boolean(errors.newPassword)}
                  helperText={touched.newPassword && errors.newPassword}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.confirmPassword && Boolean(errors.confirmPassword)
                  }
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  margin="normal"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenPasswordDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Update Password
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
};

export default Profile;
