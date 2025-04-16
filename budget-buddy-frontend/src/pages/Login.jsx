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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { login } from "../redux/slices/authSlice";

const validationSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password should be at least 6 characters")
    .required("Password is required"),
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
        console.log("Login attempt with:", values.email);
        const result = await dispatch(login(values));
        console.log("Login result:", result);
        if (result.error) {
          console.error("Login error:", result.error);
          setShowError(true);
        }
      } catch (error) {
        console.error("Form submission error:", error);
        setShowError(true);
      }
    },
  });

  useEffect(() => {
    if (error) {
      console.error("Auth state error:", error);
      setShowError(true);
    } else {
      setShowError(false);
    }
  }, [error]);

  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  return (
    <Box
      component="form"
      onSubmit={formik.handleSubmit}
      sx={{
        width: "100%",
        maxWidth: 400,
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 3,
      }}
    >
      <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
        Sign In
      </Typography>

      {showError && error && (
        <Alert
          severity="error"
          sx={{ width: "100%", mb: 2 }}
          onClose={() => setShowError(false)}
        >
          {error === "Invalid credentials"
            ? "Invalid email or password. Please try again."
            : error}
        </Alert>
      )}

      <TextField
        fullWidth
        id="email"
        name="email"
        label="Email Address"
        autoComplete="email"
        autoFocus
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        margin="normal"
      />

      <TextField
        fullWidth
        id="password"
        name="password"
        label="Password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        margin="normal"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClickShowPassword}
                edge="end"
                aria-label="toggle password visibility"
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
        sx={{ mt: 3, mb: 2 }}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : "Sign In"}
      </Button>

      <Link
        component={RouterLink}
        to="/register"
        variant="body2"
        sx={{ mt: 1 }}
      >
        Dont have an account? Sign Up
      </Link>
    </Box>
  );
}

export default Login;
