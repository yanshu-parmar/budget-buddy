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

  const [settings, setSettings] = useState(loadSettings);

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

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleDarkModeToggle = () => {
    setSettings((prev) => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        darkMode: !prev.appearance.darkMode,
      },
    }));

    // Save to localStorage
    localStorage.setItem(
      "userSettings",
      JSON.stringify({
        ...settings,
        appearance: {
          ...settings.appearance,
          darkMode: !settings.appearance.darkMode,
        },
      })
    );
  };

  // Apply dark mode when settings change
  useEffect(() => {
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
  }, [settings.appearance.darkMode]);

  const menuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/" },
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
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Budget Buddy
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      {user?.email === "admin@budgetbuddy.com" && (
        <>
          <Divider />
          <List>
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
      <List>
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
        <CssBaseline />
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
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1 }}
            >
              {/* Page title could be dynamic based on current route */}
            </Typography>
            <Tooltip title="User menu">
              <IconButton
                onClick={handleMenuOpen}
                size="small"
                sx={{ ml: 2 }}
                aria-controls="user-menu"
                aria-haspopup="true"
              >
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
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
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
                boxSizing: "border-box",
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
