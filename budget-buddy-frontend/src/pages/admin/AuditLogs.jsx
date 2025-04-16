import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Chip,
} from "@mui/material";
import { format } from "date-fns";
import { fetchAuditLogs } from "../../redux/slices/adminSlice";

const logTypes = [
  "USER_LOGIN",
  "USER_LOGOUT",
  "USER_CREATE",
  "USER_UPDATE",
  "USER_DELETE",
  "SETTINGS_UPDATE",
  "TRANSACTION_CREATE",
  "TRANSACTION_UPDATE",
  "TRANSACTION_DELETE",
  "BUDGET_CREATE",
  "BUDGET_UPDATE",
  "BUDGET_DELETE",
  "GOAL_CREATE",
  "GOAL_UPDATE",
  "GOAL_DELETE",
];

const severityColors = {
  INFO: "info",
  WARNING: "warning",
  ERROR: "error",
};

function AuditLogs() {
  const dispatch = useDispatch();
  const { logs, loading } = useSelector((state) => state.admin);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    type: "",
    severity: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    dispatch(fetchAuditLogs(filters));
  }, [dispatch, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters({
      ...filters,
      [field]: event.target.value,
    });
    setPage(0);
  };

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
        Audit Logs
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Log Type"
              value={filters.type}
              onChange={handleFilterChange("type")}
            >
              <MenuItem value="">All Types</MenuItem>
              {logTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.replace(/_/g, " ")}
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
              <MenuItem value="">All Severities</MenuItem>
              <MenuItem value="INFO">Info</MenuItem>
              <MenuItem value="WARNING">Warning</MenuItem>
              <MenuItem value="ERROR">Error</MenuItem>
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
        </Grid>
      </Paper>

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
            </TableRow>
          </TableHead>
          <TableBody>
            {logs
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((log) => (
                <TableRow key={log._id}>
                  <TableCell>
                    {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                  </TableCell>
                  <TableCell>{log.type.replace(/_/g, " ")}</TableCell>
                  <TableCell>{log.user}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.details}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.severity}
                      color={severityColors[log.severity]}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={logs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}

export default AuditLogs;
