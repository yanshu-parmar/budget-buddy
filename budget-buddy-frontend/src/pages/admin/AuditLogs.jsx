import React, { useState, useEffect } from "react";
import {
  Box,
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
  TextField,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
} from "@mui/material";
import { format } from "date-fns";
import axios from "axios";

const severityColors = {
  low: "success",
  medium: "warning",
  high: "error",
};

const typeLabels = {
  user: "User Action",
  system: "System Event",
  security: "Security Event",
  error: "Error",
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    severity: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/admin/audit-logs", {
        params: {
          ...filters,
          page,
          limit: 10,
        },
      });
      setLogs(response.data.logs);
      setTotalPages(response.data.totalPages);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching audit logs");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filters, page]);

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading && !logs.length) {
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
        Audit Logs
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Type"
                value={filters.type}
                onChange={handleFilterChange("type")}
              >
                <MenuItem value="">All</MenuItem>
                {Object.entries(typeLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="Severity"
                value={filters.severity}
                onChange={handleFilterChange("severity")}
              >
                <MenuItem value="">All</MenuItem>
                {Object.keys(severityColors).map((severity) => (
                  <MenuItem key={severity} value={severity}>
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Start Date"
                value={filters.startDate}
                onChange={handleFilterChange("startDate")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="End Date"
                value={filters.endDate}
                onChange={handleFilterChange("endDate")}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={handleFilterChange("search")}
                placeholder="Search by user, action, or details..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>IP Address</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log._id}>
                <TableCell>
                  {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                </TableCell>
                <TableCell>
                  <Chip
                    label={typeLabels[log.type]}
                    color={log.type === "error" ? "error" : "default"}
                    size="small"
                  />
                </TableCell>
                <TableCell>{log.user?.email || "System"}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.details}</TableCell>
                <TableCell>
                  <Chip
                    label={log.severity}
                    color={severityColors[log.severity]}
                    size="small"
                  />
                </TableCell>
                <TableCell>{log.ipAddress}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default AuditLogs;
