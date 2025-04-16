import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { login } from "../redux/slices/authSlice";

const validationSchema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().min(6, "Password should be at least 6 characters").required("Password is required"),
});

function Login() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showError, setShowError] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const result = await dispatch(login(values));
        if (result.error) setShowError(true);
      } catch {
        setShowError(true);
      }
    },
  });

  useEffect(() => {
    if (error) setShowError(true);
    else setShowError(false);
  }, [error]);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
        background: "linear-gradient(135deg, #ece9e6, #ffffff)",
        padding: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          padding: 4,
          borderRadius: 4,
          width: "100%",
          maxWidth: 400,
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h4" gutterBottom fontWeight={600} color="primary">
          Budget Buddy
        </Typography>

        <Typography variant="h6" gutterBottom>
          Sign In to your account
        </Typography>

        {showError && error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setShowError(false)}
          >
            {error === "Invalid credentials"
              ? "Invalid email or password."
              : error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            margin="normal"
            autoComplete="email"
          />

          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            margin="normal"
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((prev) => !prev)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2, borderRadius: 2, fontWeight: 600 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Sign In"}
          </Button>
        </form>

        <Typography variant="body2">
          Don't have an account?{" "}
          <Link component={RouterLink} to="/register">
            Sign Up
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}

export default Login;
