import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  Switch,
  ListItemSecondaryAction,
  ListSubheader,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard,
  AccountBalance,
  Assessment,
  Flag,
  BarChart,
  Person,
  AdminPanelSettings,
  Group,
  Settings,
  Logout,
  DarkMode,
  LightMode,
} from "@mui/icons-material";
import { logout } from "../redux/slices/authSlice";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const drawerWidth = 240;

function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loadSettings = () => {
    try {
      const savedSettings = localStorage.getItem("userSettings");
      if (savedSettings) return JSON.parse(savedSettings);
    } catch (err) {
      console.error("Error loading settings:", err);
    }
    return {
      appearance: {
        darkMode: false,
        showCharts: true,
      },
      currency: "USD",
    };
  };

  const [settings, setSettings] = useState(loadSettings);

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

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleDarkModeToggle = () => {
    const updated = {
      ...settings,
      appearance: {
        ...settings.appearance,
        darkMode: !settings.appearance.darkMode,
      },
    };
    setSettings(updated);
    localStorage.setItem("userSettings", JSON.stringify(updated));
  };

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      settings.appearance.darkMode ? "dark" : "light"
    );
    document.body.style.backgroundColor = settings.appearance.darkMode
      ? "#121212"
      : "#f5f5f5";
    document.body.style.color = settings.appearance.darkMode
      ? "#ffffff"
      : "#000000";
  }, [settings.appearance.darkMode]);

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/dashboard" },
    { text: "Transactions", icon: <AccountBalance />, path: "/transactions" },
    { text: "Budgets", icon: <Assessment />, path: "/budgets" },
    { text: "Goals", icon: <Flag />, path: "/goals" },
    { text: "Reports", icon: <BarChart />, path: "/reports" },
  ];

  const adminMenuItems = [
    { text: "Admin Dashboard", icon: <AdminPanelSettings />, path: "/admin" },
    { text: "User Management", icon: <Group />, path: "/admin/users" },
  ];

  const drawer = (
    <div>
      <Box
          sx={{
            display: "flex",
            alignItems: "center", 
            justifyContent: "center",
            mb: 3,
            mt: 4
          }}
        >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            mr: 1,
          }}
        >
        <Box
          sx={{
            width: 6,
            height: 15,
            backgroundColor: "#4CAF50",
            borderRadius: "6px",
            mr: 0.5,
          }}
        />
        <Box
          sx={{
            width: 6,
            height: 25,
            backgroundColor: "#1E88E5",
            borderRadius: "6px",
          }}
        />
        </Box>
        <Typography variant="h5" fontWeight={600} sx={{ color: "#1E88E5" }}>
          Budget Buddy
        </Typography>
    </Box>
      <Divider />
      <List>
  {menuItems.map((item) => {
    const isActive = location.pathname === item.path;

    return (
      <ListItem
        button
        key={item.text}
        onClick={() => navigate(item.path)}
        sx={{
          backgroundColor: isActive ? "#14532d" : "transparent", // Dark green background
          color: isActive ? "#FFFFFF" : "inherit",               // White text for active
          borderRadius: "8px",
          mb: 1,
          "&:hover": {
            backgroundColor: isActive ? "#14532d" : "#166534",   // Lighter green hover
          },
        }}
      >
        <ListItemIcon
          sx={{
            color: isActive ? "#A7F3D0" : "inherit", // Minty green icon for active
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText primary={item.text} />
      </ListItem>
    );
  })}
</List>

      {user?.email === "admin@budgetbuddy.com" && (
        <>
          <Divider />
          <List
            subheader={<ListSubheader component="div">Admin</ListSubheader>}
          >
            {adminMenuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </>
      )}
      <Divider />
      <List
        subheader={<ListSubheader component="div">Preferences</ListSubheader>}
      >
        <ListItem>
          <ListItemIcon>
            {settings.appearance.darkMode ? <DarkMode /> : <LightMode />}
          </ListItemIcon>
          <ListItemText primary="Dark Mode" />
          <ListItemSecondaryAction>
            <Switch
              edge="end"
              checked={settings.appearance.darkMode}
              onChange={handleDarkModeToggle}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem button onClick={() => navigate("/settings")}>
          <ListItemIcon>
            <Settings />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }} />
            <Tooltip title="User menu">
              <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 2 }}>
                <Badge color="success" variant="dot" overlap="circular">
                  <Avatar>{user?.firstName?.[0]}</Avatar>
                </Badge>
              </IconButton>
            </Tooltip>
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: { minWidth: 200, mt: 1.5 },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => navigate("/profile")}>
                <ListItemIcon>
                  <Person fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <MenuItem onClick={() => navigate("/settings")}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Toolbar>
        </AppBar>
        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", sm: "block" },
              "& .MuiDrawer-paper": {
                width: drawerWidth,
              },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          <Toolbar />
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default MainLayout;
