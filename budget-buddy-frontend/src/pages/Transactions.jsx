import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Tooltip,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Fade,
  Zoom,
  Alert,
  Snackbar,
  Divider,
  Tabs,
  Tab,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  TrendingUp as IncomeIcon,
  TrendingDown as ExpenseIcon,
  AttachMoney as MoneyIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  format,
  parseISO,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import {
  fetchTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "../redux/slices/transactionSlice";

const validationSchema = yup.object({
  type: yup.string().required("Type is required"),
  amount: yup
    .number()
    .required("Amount is required")
    .positive("Amount must be positive"),
  category: yup.string().required("Category is required"),
  description: yup.string(),
  date: yup.date().required("Date is required"),
});

const transactionTypes = ["income", "expense"];
const categories = {
  income: ["Salary", "Freelance", "Investments", "Other"],
  expense: [
    "Food",
    "Transport",
    "Housing",
    "Utilities",
    "Entertainment",
    "Other",
  ],
};

function Transactions() {
  const dispatch = useDispatch();
  const { transactions, loading } = useSelector((state) => state.transactions);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const theme = useTheme();

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      type: "expense",
      amount: "",
      category: "",
      description: "",
      date: format(new Date(), "yyyy-MM-dd"),
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Convert the date string to a Date object for the backend
        const transactionData = {
          ...values,
          date: new Date(values.date).toISOString(),
        };

        if (editingTransaction) {
          await dispatch(
            updateTransaction({
              id: editingTransaction._id,
              transactionData,
            })
          );
          setSuccessMessage("Transaction updated successfully!");
        } else {
          await dispatch(addTransaction(transactionData));
          setSuccessMessage("Transaction added successfully!");
        }
        handleCloseDialog();
      } catch (error) {
        setErrorMessage(error.message || "An error occurred");
      }
    },
  });

  const handleOpenDialog = (transaction = null) => {
    if (transaction) {
      setEditingTransaction(transaction);
      formik.setValues({
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description || "",
        date: format(new Date(transaction.date), "yyyy-MM-dd"),
      });
    } else {
      setEditingTransaction(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
    formik.resetForm();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await dispatch(deleteTransaction(id));
        setSuccessMessage("Transaction deleted successfully!");
      } catch (error) {
        setErrorMessage(error.message || "An error occurred");
      }
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage("");
    setErrorMessage("");
  };

  const getFilteredTransactions = () => {
    let filtered = [...transactions];

    // Filter by type
    if (filterValue !== "all") {
      filtered = filtered.filter((t) => t.type === filterValue);
    }

    // Filter by date range
    if (dateRange !== "all") {
      const now = new Date();
      let start, end;

      if (dateRange === "today") {
        start = new Date(now.setHours(0, 0, 0, 0));
        end = new Date(now.setHours(23, 59, 59, 999));
      } else if (dateRange === "week") {
        start = new Date(now.setDate(now.getDate() - now.getDay()));
        end = new Date(now.setDate(now.getDate() + 6));
      } else if (dateRange === "month") {
        start = startOfMonth(now);
        end = endOfMonth(now);
      } else if (dateRange === "year") {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
      }

      filtered = filtered.filter((t) =>
        isWithinInterval(new Date(t.date), { start, end })
      );
    }

    return filtered;
  };

  const calculateTotals = () => {
    const filtered = getFilteredTransactions();
    const income = filtered
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  };

  const totals = calculateTotals();

  const columns = [
    {
      field: "date",
      headerName: "Date",
      width: 120,
      valueFormatter: (params) =>
        format(new Date(params.value), "MMM dd, yyyy"),
    },
    {
      field: "type",
      headerName: "Type",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          color={params.value === "income" ? "success" : "error"}
          size="small"
          icon={params.value === "income" ? <IncomeIcon /> : <ExpenseIcon />}
        />
      ),
    },
    {
      field: "amount",
      headerName: "Amount",
      width: 120,
      valueFormatter: (params) => `₹${params.value.toFixed(2)}`,
      renderCell: (params) => (
        <Typography
          color={params.row.type === "income" ? "success.main" : "error.main"}
          fontWeight="bold"
        >
          ₹{params.value.toFixed(2)}
        </Typography>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      width: 150,
      renderCell: (params) => (
        <Chip label={params.value} variant="outlined" size="small" />
      ),
    },
    {
      field: "description",
      headerName: "Description",
      width: 200,
      renderCell: (params) => (
        <Tooltip title={params.value || "No description"}>
          <Typography noWrap>{params.value || "—"}</Typography>
        </Tooltip>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              onClick={() => handleOpenDialog(params.row)}
              color="primary"
              size="small"
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              onClick={() => handleDelete(params.row._id)}
              color="error"
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "80vw", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Transactions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            boxShadow: `0 3px 5px 2px ${alpha(
              theme.palette.primary.main,
              0.3
            )}`,
          }}
        >
          Add Transaction
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              background: `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`,
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <IncomeIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Total Income</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
              ₹{totals.income.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              background: `linear-gradient(135deg, ${theme.palette.error.light}, ${theme.palette.error.main})`,
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <ExpenseIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Total Expenses</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
              ₹{totals.expenses.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              background: `linear-gradient(135deg, ${theme.palette.info.light}, ${theme.palette.info.main})`,
              color: "white",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <MoneyIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Balance</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
              ₹{totals.balance.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Filters</Typography>
          <Box>
            <FormControl sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel id="type-filter-label">Type</InputLabel>
              <Select
                labelId="type-filter-label"
                value={filterValue}
                label="Type"
                onChange={(e) => setFilterValue(e.target.value)}
                size="small"
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel id="date-filter-label">Date Range</InputLabel>
              <Select
                labelId="date-filter-label"
                value={dateRange}
                label="Date Range"
                onChange={(e) => setDateRange(e.target.value)}
                size="small"
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="week">This Week</MenuItem>
                <MenuItem value="month">This Month</MenuItem>
                <MenuItem value="year">This Year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Paper sx={{ height: 500, width: "100%" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : getFilteredTransactions().length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              p: 3,
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No transactions found
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              align="center"
              sx={{ mb: 2 }}
            >
              {filterValue !== "all" || dateRange !== "all"
                ? "Try adjusting your filters"
                : "Add your first transaction to get started"}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Transaction
            </Button>
          </Box>
        ) : (
          <DataGrid
            rows={getFilteredTransactions()}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            loading={loading}
            getRowId={(row) => row._id}
            disableSelectionOnClick
            components={{
              Toolbar: GridToolbar,
            }}
            sx={{
              "& .MuiDataGrid-row:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
              },
            }}
          />
        )}
      </Paper>
      </Paper>

      

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 500 }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            color: "white",
          }}
        >
          {editingTransaction ? "Edit Transaction" : "Add Transaction"}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleCloseDialog}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="type-label">Type</InputLabel>
                  <Select
                    labelId="type-label"
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    error={formik.touched.type && Boolean(formik.errors.type)}
                    label="Type"
                  >
                    {transactionTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {type === "income" ? (
                            <IncomeIcon color="success" sx={{ mr: 1 }} />
                          ) : (
                            <ExpenseIcon color="error" sx={{ mr: 1 }} />
                          )}
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.type && formik.errors.type && (
                    <Typography color="error" variant="caption">
                      {formik.errors.type}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="amount"
                  label="Amount"
                  type="number"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  helperText={formik.touched.amount && formik.errors.amount}
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="category-label">Category</InputLabel>
                  <Select
                    labelId="category-label"
                    name="category"
                    value={formik.values.category}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.category && Boolean(formik.errors.category)
                    }
                    label="Category"
                  >
                    {categories[formik.values.type].map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.category && formik.errors.category && (
                    <Typography color="error" variant="caption">
                      {formik.errors.category}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  name="date"
                  label="Date"
                  type="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  helperText={formik.touched.date && formik.errors.date}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                  margin="normal"
                  multiline
                  rows={3}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={handleCloseDialog} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              }}
            >
              {editingTransaction ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          icon={<SuccessIcon />}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          variant="filled"
          icon={<ErrorIcon />}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default Transactions;
