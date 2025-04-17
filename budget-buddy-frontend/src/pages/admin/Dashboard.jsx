import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Button,
  Stack,
  Badge,
  Container,
  Snackbar,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import axios from "axios";
import { format, isValid, subDays, parseISO } from "date-fns";
import {
  People as PeopleIcon,
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  MoreVert as MoreVertIcon,
  AccessTime as AccessTimeIcon,
} from "@mui/icons-material";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
];

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return isValid(date) ? format(date, "MMM dd, yyyy HH:mm") : "Invalid Date";
};

// Generate sample data for the last 7 days
const generateSampleData = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, "MMM dd"),
      newUsers: Math.floor(Math.random() * 10) + 1,
      activeUsers: Math.floor(Math.random() * 30) + 50,
      totalUsers: Math.floor(Math.random() * 20) + 100 + i * 5,
    });
  }
  return data;
};

// Sample data for when API is not available
const sampleData = {
  totalUsers: 125,
  activeUsers: 98,
  totalTransactions: 543,
  recentActivity: [
    {
      _id: "1",
      timestamp: new Date().toISOString(),
      user: { name: "Admin User" },
      action: "Login",
      details: "User logged in successfully",
    },
    {
      _id: "2",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: { name: "John Doe" },
      action: "Transaction",
      details: "Added new expense: Groceries",
    },
    {
      _id: "3",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: { name: "Jane Smith" },
      action: "Budget",
      details: "Updated monthly budget",
    },
    {
      _id: "4",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      user: { name: "Bob Johnson" },
      action: "Goal",
      details: "Created new savings goal",
    },
    {
      _id: "5",
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      user: { name: "System" },
      action: "System",
      details: "Scheduled maintenance completed",
    },
  ],
  userStats: {
    byRole: {
      Admin: 5,
      User: 120,
    },
    byStatus: {
      Active: 98,
      Inactive: 27,
    },
    activityOverTime: [
      { date: format(subDays(new Date(), 6), "yyyy-MM-dd"), users: 120 },
      { date: format(subDays(new Date(), 5), "yyyy-MM-dd"), users: 122 },
      { date: format(subDays(new Date(), 4), "yyyy-MM-dd"), users: 125 },
      { date: format(subDays(new Date(), 3), "yyyy-MM-dd"), users: 123 },
      { date: format(subDays(new Date(), 2), "yyyy-MM-dd"), users: 126 },
      { date: format(subDays(new Date(), 1), "yyyy-MM-dd"), users: 124 },
      { date: format(new Date(), "yyyy-MM-dd"), users: 125 },
    ],
    newUsersOverTime: [
      { date: format(subDays(new Date(), 6), "yyyy-MM-dd"), newUsers: 2 },
      { date: format(subDays(new Date(), 5), "yyyy-MM-dd"), newUsers: 3 },
      { date: format(subDays(new Date(), 4), "yyyy-MM-dd"), newUsers: 1 },
      { date: format(subDays(new Date(), 3), "yyyy-MM-dd"), newUsers: 4 },
      { date: format(subDays(new Date(), 2), "yyyy-MM-dd"), newUsers: 2 },
      { date: format(subDays(new Date(), 1), "yyyy-MM-dd"), newUsers: 3 },
      { date: format(new Date(), "yyyy-MM-dd"), newUsers: 1 },
    ],
    userGrowth: [
      {
        date: format(subDays(new Date(), 6), "yyyy-MM-dd"),
        total: 120,
        new: 2,
        active: 95,
        engagement: 78,
      },
      {
        date: format(subDays(new Date(), 5), "yyyy-MM-dd"),
        total: 122,
        new: 3,
        active: 96,
        engagement: 82,
      },
      {
        date: format(subDays(new Date(), 4), "yyyy-MM-dd"),
        total: 125,
        new: 1,
        active: 97,
        engagement: 85,
      },
      {
        date: format(subDays(new Date(), 3), "yyyy-MM-dd"),
        total: 123,
        new: 4,
        active: 98,
        engagement: 88,
      },
      {
        date: format(subDays(new Date(), 2), "yyyy-MM-dd"),
        total: 126,
        new: 2,
        active: 99,
        engagement: 90,
      },
      {
        date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
        total: 124,
        new: 3,
        active: 97,
        engagement: 87,
      },
      {
        date: format(new Date(), "yyyy-MM-dd"),
        total: 125,
        new: 1,
        active: 98,
        engagement: 89,
      },
    ],
    userMetrics: [
      { name: "Total Users", value: 125, color: "#8884d8" },
      { name: "Active Users", value: 98, color: "#82ca9d" },
      { name: "New Users", value: 1, color: "#ffc658" },
      { name: "Engagement Rate", value: 78.4, color: "#ff8042" },
      { name: "Retention Rate", value: 92.5, color: "#0088FE" },
      { name: "Churn Rate", value: 7.5, color: "#f44336" },
    ],
    userDemographics: [
      { category: "Age 18-24", value: 15, color: "#8884d8" },
      { category: "Age 25-34", value: 35, color: "#82ca9d" },
      { category: "Age 35-44", value: 25, color: "#ffc658" },
      { category: "Age 45-54", value: 20, color: "#ff8042" },
      { category: "Age 55+", value: 5, color: "#0088FE" },
    ],
    userEngagement: [
      { metric: "Daily Active", value: 85, color: "#8884d8" },
      { metric: "Weekly Active", value: 95, color: "#82ca9d" },
      { metric: "Monthly Active", value: 100, color: "#ffc658" },
      { metric: "Feature Usage", value: 75, color: "#ff8042" },
      { metric: "Session Duration", value: 65, color: "#0088FE" },
      { metric: "Return Rate", value: 80, color: "#f44336" },
    ],
  },
  userUsageData: generateSampleData(),
};

const Dashboard = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    recentActivity: [],
    userStats: {
      byRole: {},
      byStatus: {},
    },
    userUsageData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingSampleData, setUsingSampleData] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const refreshIntervalRef = useRef(null);

  const fetchDashboardData = async (showSuccessMessage = true) => {
    try {
      setRefreshing(true);
      setError(null);

      // Get the auth token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found. Please log in.");
      }

      const response = await axios.get(
        "http://localhost:5000/api/admin/dashboard",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Ensure userUsageData exists in the response
      const data = response.data;
      if (!data.userUsageData) {
        data.userUsageData = generateSampleData();
      }

      setStats(data);
      setUsingSampleData(false);

      if (showSuccessMessage) {
        setRefreshSuccess(true);

        // Hide success message after 3 seconds
        setTimeout(() => {
          setRefreshSuccess(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setStats(sampleData);
      setUsingSampleData(true);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load dashboard data. Please try again later."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData(false);
  }, []);

  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
        sx={{
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.light,
            0.1
          )} 0%, ${alpha(theme.palette.background.paper, 0.1)} 100%)`,
        }}
      >
        <CircularProgress size={60} thickness={4} color="primary" />
        <Typography variant="h6" sx={{ mt: 2, fontWeight: 500 }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert
          severity={usingSampleData ? "warning" : "error"}
          sx={{
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={`item-${index}`}
              variant="body2"
              color={entry.color}
            >
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.background.paper,
          0.8
        )} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
        minHeight: "100vh",
        py: 6,
      }}
    >
      <Container maxWidth="xl">
        {/* Dashboard Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={8}
          sx={{
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.1
            )} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
            p: 4,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Box display="flex" alignItems="center">
            <DashboardIcon
              sx={{ fontSize: 40, color: "primary.main", mr: 3 }}
            />
            <Typography variant="h4" fontWeight="bold" color="primary">
              Admin Dashboard
            </Typography>
          </Box>
          <Tooltip title="Refresh data">
            <IconButton
              onClick={handleRefresh}
              color="primary"
              disabled={refreshing}
              sx={{
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                },
                position: "relative",
              }}
            >
              {refreshing ? (
                <CircularProgress size={24} color="primary" />
              ) : (
                <RefreshIcon />
              )}
            </IconButton>
          </Tooltip>
        </Box>

        {/* Success Snackbar */}
        <Snackbar
          open={refreshSuccess}
          autoHideDuration={3000}
          onClose={() => setRefreshSuccess(false)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={() => setRefreshSuccess(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            Dashboard data refreshed successfully!
          </Alert>
        </Snackbar>

        {usingSampleData && (
          <Alert
            severity="warning"
            sx={{
              mb: 8,
              borderRadius: 2,
              boxShadow: 1,
              "& .MuiAlert-icon": {
                fontSize: 28,
              },
            }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => setUsingSampleData(false)}
                startIcon={<CheckCircleIcon />}
              >
                Dismiss
              </Button>
            }
          >
            Using sample data. Connect to the backend to see real-time data.
          </Alert>
        )}

        {/* Statistics Cards */}
        <Box mb={10}>
          <Typography variant="h5" fontWeight="bold" color="primary" mb={4}>
            Overview
          </Typography>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6} md={6}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 2,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                    borderLeft: `4px solid ${theme.palette.primary.main}`,
                  },
                  overflow: "hidden",
                  position: "relative",
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "100px",
                    height: "100px",
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
                    borderRadius: "0 0 0 100%",
                    zIndex: 0,
                  }}
                />
                <CardContent sx={{ position: "relative", zIndex: 1, p: 4 }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        width: 64,
                        height: 64,
                        mr: 3,
                      }}
                    >
                      <PeopleIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography
                        color="textSecondary"
                        variant="subtitle2"
                        sx={{ fontWeight: 500 }}
                      >
                        Total Users
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary"
                      >
                        {stats.totalUsers}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 3 }} />
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="textSecondary">
                      Active: {stats.activeUsers}
                    </Typography>
                    <Chip
                      label={`${Math.round(
                        (stats.activeUsers / stats.totalUsers) * 100
                      )}%`}
                      size="small"
                      color="success"
                      icon={<ArrowUpwardIcon fontSize="small" />}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 2,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                    borderLeft: `4px solid ${theme.palette.warning.main}`,
                  },
                  overflow: "hidden",
                  position: "relative",
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "100px",
                    height: "100px",
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.warning.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.warning.light, 0.05)} 100%)`,
                    borderRadius: "0 0 0 100%",
                    zIndex: 0,
                  }}
                />
                <CardContent sx={{ position: "relative", zIndex: 1, p: 4 }}>
                  <Box display="flex" alignItems="center" mb={3}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        color: theme.palette.warning.main,
                        width: 64,
                        height: 64,
                        mr: 3,
                      }}
                    >
                      <TrendingUpIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography
                        color="textSecondary"
                        variant="subtitle2"
                        sx={{ fontWeight: 500 }}
                      >
                        User Growth
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="warning.main"
                      >
                        {Math.round(
                          (stats.activeUsers / stats.totalUsers) * 100
                        )}
                        %
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 3 }} />
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="body2" color="textSecondary">
                      Engagement Rate
                    </Typography>
                    <Chip
                      label="Healthy"
                      size="small"
                      color="success"
                      icon={<CheckCircleIcon fontSize="small" />}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* User Usage Charts */}
        <Box mb={10}>
          <Typography variant="h5" fontWeight="bold" color="primary" mb={4}>
            User Analytics
          </Typography>
          <Grid container spacing={5}>
            {/* New Users Chart */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 2,
                  height: "100%",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={4}
                  >
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      New User Registrations
                    </Typography>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 4 }} />
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={stats.userUsageData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={alpha(theme.palette.divider, 0.5)}
                      />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="newUsers"
                        name="New Users"
                        fill={theme.palette.success.main}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>

            {/* User Activity Chart */}
            <Grid item xs={12} md={6}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 2,
                  height: "100%",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={4}
                  >
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      User Activity
                    </Typography>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 4 }} />
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart
                      data={stats.userUsageData}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={alpha(theme.palette.divider, 0.5)}
                      />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="activeUsers"
                        name="Active Users"
                        stroke={theme.palette.primary.main}
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalUsers"
                        name="Total Users"
                        stroke={theme.palette.info.main}
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Recent Activity */}
        <Box>
          <Typography variant="h5" fontWeight="bold" color="primary" mb={4}>
            Recent Activity
          </Typography>
          <Card
            elevation={3}
            sx={{
              borderRadius: 2,
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                boxShadow: 6,
              },
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={4}
              >
                <Typography variant="h6" fontWeight="bold" color="primary">
                  Activity Log
                </Typography>
                <Chip
                  label={`${stats.recentActivity?.length || 0} activities`}
                  size="small"
                  color="primary"
                  icon={<PersonIcon fontSize="small" />}
                />
              </Box>
              <Divider sx={{ mb: 4 }} />
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  borderRadius: 2,
                  maxHeight: 450,
                  overflow: "auto",
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.05
                          ),
                          py: 2,
                        }}
                      >
                        Timestamp
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.05
                          ),
                          py: 2,
                        }}
                      >
                        User
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.05
                          ),
                          py: 2,
                        }}
                      >
                        Action
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: "bold",
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.05
                          ),
                          py: 2,
                        }}
                      >
                        Details
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentActivity?.map((activity, index) => (
                      <TableRow
                        key={activity._id || index}
                        sx={{
                          "&:nth-of-type(odd)": {
                            backgroundColor: alpha(
                              theme.palette.action.hover,
                              0.05
                            ),
                          },
                          "&:hover": {
                            backgroundColor: alpha(
                              theme.palette.action.hover,
                              0.1
                            ),
                          },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <TableCell sx={{ py: 2 }}>
                          {formatDate(activity.timestamp)}
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Box display="flex" alignItems="center">
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                mr: 2,
                                bgcolor:
                                  activity.user?.name === "System"
                                    ? "grey.500"
                                    : "primary.main",
                              }}
                            >
                              {activity.user?.name?.charAt(0) || "S"}
                            </Avatar>
                            {activity.user?.name || "System"}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>
                          <Chip
                            label={activity.action}
                            size="small"
                            color={
                              activity.action === "Login"
                                ? "success"
                                : activity.action === "Transaction"
                                ? "info"
                                : activity.action === "Budget"
                                ? "warning"
                                : activity.action === "Goal"
                                ? "primary"
                                : "default"
                            }
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell sx={{ py: 2 }}>{activity.details}</TableCell>
                      </TableRow>
                    ))}
                    {(!stats.recentActivity ||
                      stats.recentActivity.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                          >
                            <CheckCircleIcon
                              color="disabled"
                              sx={{ fontSize: 48, mb: 2 }}
                            />
                            <Typography variant="body1" color="textSecondary">
                              No recent activity
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
