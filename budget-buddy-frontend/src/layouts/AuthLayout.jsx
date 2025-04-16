import { Outlet } from "react-router-dom";
import { Box, Container } from "@mui/material";

function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
      }}
    >
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default AuthLayout;
