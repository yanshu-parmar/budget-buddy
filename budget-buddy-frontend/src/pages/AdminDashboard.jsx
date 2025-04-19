import React, { useState, useEffect } from "react";
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
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import axios from "axios";
import { format } from "date-fns";

const AdminDashboard = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    totalAmount: 0,
    recentActivity: [],
    systemHealth: {
      status: "healthy",
      lastChecked: new Date(),
    },
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setStats(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Auto-refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4">
              {typeof value === "number" ? value.toLocaleString() : value}
            </Typography>
          </Box>
          <IconButton
            sx={{
              backgroundColor: `${color}15`,
              color: color,
              "&:hover": { backgroundColor: `${color}25` },
            }}
          >
            {icon}
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && !stats.totalUsers) {
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4">Admin Dashboard</Typography>
        <IconButton onClick={fetchDashboardData} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<PeopleIcon />}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Users"
            value={stats.activeUsers}
            icon={<PeopleIcon />}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Transactions"
            value={stats.totalTransactions}
            icon={<AccountBalanceIcon />}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Amount"
            value={`₹${stats.totalAmount.toLocaleString()}`}
            icon={<AttachMoneyIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Type</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Severity</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentActivity.map((activity) => (
                      <TableRow key={activity._id}>
                        <TableCell>
                          <Chip
                            label={activity.type}
                            size="small"
                            color={
                              activity.type === "error"
                                ? "error"
                                : activity.type === "warning"
                                ? "warning"
                                : "info"
                            }
                          />
                        </TableCell>
                        <TableCell>{activity.action}</TableCell>
                        <TableCell>
                          {activity.user?.email || "System"}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(activity.timestamp),
                            "MMM d, yyyy HH:mm"
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={activity.severity}
                            size="small"
                            color={
                              activity.severity === "high"
                                ? "error"
                                : activity.severity === "medium"
                                ? "warning"
                                : "success"
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Health
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Chip
                  icon={<WarningIcon />}
                  label={stats.systemHealth.status}
                  color={
                    stats.systemHealth.status === "healthy"
                      ? "success"
                      : stats.systemHealth.status === "warning"
                      ? "warning"
                      : "error"
                  }
                />
                <Typography variant="body2" color="textSecondary" ml={2}>
                  Last checked:{" "}
                  {stats.systemHealth.lastChecked
                    ? format(
                        new Date(stats.systemHealth.lastChecked),
                        "HH:mm:ss"
                      )
                    : "Never"}
                </Typography>
              </Box>
              {stats.systemHealth.issues?.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Active Issues:
                  </Typography>
                  {stats.systemHealth.issues.map((issue, index) => (
                    <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                      {issue}
                    </Alert>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
