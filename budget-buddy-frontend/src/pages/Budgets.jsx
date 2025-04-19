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
  Typography,
  Paper,
  LinearProgress,
  Grid,
  IconButton,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import {
  fetchBudgets,
  addBudget,
  updateBudget,
  deleteBudget,
} from "../redux/slices/budgetSlice";
import { fetchTransactions } from "../redux/slices/transactionSlice";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#4caf50", "#e0e0e0"];
const categories = ["Food", "Transport", "Housing", "Utilities", "Entertainment", "Other"];
const periods = ["weekly", "monthly", "yearly"];

const validationSchema = yup.object({
  name: yup.string().required("Name is required"),
  period: yup.string().required("Period is required"),
  startDate: yup.date().required("Start date is required"),
  endDate: yup.date().required("End date is required"),
  totalBudget: yup
    .number()
    .required("Total budget is required")
    .positive("Budget must be positive"),
  categories: yup.array().of(
    yup.object().shape({
      category: yup.string().required("Category is required"),
      limit: yup
        .number()
        .required("Limit is required")
        .positive("Limit must be positive"),
    })
  ),
});

function Budgets() {
  const dispatch = useDispatch();
  const { budgets, loading } = useSelector((state) => state.budgets);
  const { transactions } = useSelector((state) => state.transactions);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(fetchBudgets());
    dispatch(fetchTransactions());
  }, [dispatch]);

  const calculateSpent = (category, startDate, endDate) => {
    return transactions
      .filter(
        (t) =>
          t.category === category &&
          t.type === "expense" &&
          new Date(t.date) >= new Date(startDate) &&
          new Date(t.date) <= new Date(endDate)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateTotalSpent = (budget) => {
    return transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          new Date(t.date) >= new Date(budget.startDate) &&
          new Date(t.date) <= new Date(budget.endDate)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      period: "monthly",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        .toISOString()
        .split("T")[0],
      totalBudget: "",
      categories: [
        { category: "Food", limit: "" },
        { category: "Transport", limit: "" },
        { category: "Housing", limit: "" },
      ],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const budgetData = {
          ...values,
          startDate: new Date(values.startDate).toISOString(),
          endDate: new Date(values.endDate).toISOString(),
        };

        if (editingBudget) {
          await dispatch(updateBudget({ id: editingBudget._id, budgetData }));
        } else {
          await dispatch(addBudget(budgetData));
        }

        setSuccess(true);
        setError(null);
        setTimeout(() => setSuccess(false), 3000);
        handleCloseDialog();
      } catch (error) {
        setError(error.message || "Failed to save budget");
        setSuccess(false);
      }
    },
  });

  const handleOpenDialog = (budget = null) => {
    if (budget) {
      setEditingBudget(budget);
      formik.setValues({
        name: budget.name,
        period: budget.period,
        startDate: new Date(budget.startDate).toISOString().split("T")[0],
        endDate: new Date(budget.endDate).toISOString().split("T")[0],
        totalBudget: budget.totalBudget,
        categories: budget.categories.map((cat) => ({
          category: cat.category,
          limit: cat.limit,
        })),
      });
    } else {
      setEditingBudget(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingBudget(null);
    formik.resetForm();
    setError(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      try {
        await dispatch(deleteBudget(id));
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } catch (error) {
        setError(error.message || "Failed to delete budget");
        setSuccess(false);
      }
    }
  };

  return (
    <Box sx={{ width: "80vw", p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">Budget Management</Typography>
        <Box sx={{ position: "absolute", right: 30 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Add Budget
          </Button>
        </Box>
      </Box>

      {success && <Alert severity="success" sx={{ mb: 3 }}>{editingBudget ? "Budget updated successfully!" : "Budget added successfully!"}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={2}>
        {budgets.map((budget) => {
          const totalSpent = calculateTotalSpent(budget);
          const chartData = [
            { name: "Spent", value: Math.min(totalSpent, budget.totalBudget) },
            { name: "Remaining", value: Math.max(budget.totalBudget - totalSpent, 0) },
          ];

          return (
            <Grid item xs={12} md={6} key={budget._id}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="h6">{budget.name}</Typography>
                  <Box>
                    <IconButton onClick={() => handleOpenDialog(budget)}><EditIcon sx={{ color: "#1976d2" }} /></IconButton>
                    <IconButton onClick={() => handleDelete(budget._id)}><DeleteIcon sx={{ color: "#f44336" }} /></IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary">Period: {budget.period}</Typography>
                <Typography variant="body2" color="text.secondary">Total Budget: ₹{budget.totalBudget.toFixed(2)}</Typography>
                <Typography variant="body2" color="text.secondary">Total Spent: ₹{totalSpent.toFixed(2)}</Typography>

                {budget.totalBudget > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        innerRadius={40}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {COLORS.map((color, index) => (<Cell key={`cell-${index}`} fill={color} />))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary" mt={2}>
                    Cannot show chart: Total budget is ₹0.
                  </Typography>
                )}

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Category Breakdown:</Typography>
                  {budget.categories.map((cat) => {
                    const spent = calculateSpent(cat.category, budget.startDate, budget.endDate);
                    const progress = (spent / cat.limit) * 100;

                    return (
                      <Box key={cat.category} sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2">{cat.category}: ₹{spent.toFixed(2)} / ₹{cat.limit.toFixed(2)}</Typography>
                          <Typography variant="body2" color={progress > 100 ? "error" : "text.secondary"}>{progress.toFixed(1)}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(progress, 100)}
                          sx={{ height: 8, borderRadius: 4, backgroundColor: "#e0e0e0", "& .MuiLinearProgress-bar": { backgroundColor: progress > 100 ? "error.main" : "primary.main" } }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBudget ? "Edit Budget" : "Add Budget"}</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <TextField fullWidth name="name" label="Budget Name" value={formik.values.name} onChange={formik.handleChange} error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && formik.errors.name} margin="normal" />
            <TextField fullWidth select name="period" label="Period" value={formik.values.period} onChange={formik.handleChange} error={formik.touched.period && Boolean(formik.errors.period)} helperText={formik.touched.period && formik.errors.period} margin="normal">
              {periods.map((period) => (<MenuItem key={period} value={period}>{period.charAt(0).toUpperCase() + period.slice(1)}</MenuItem>))}
            </TextField>
            <TextField fullWidth name="startDate" label="Start Date" type="date" value={formik.values.startDate} onChange={formik.handleChange} error={formik.touched.startDate && Boolean(formik.errors.startDate)} helperText={formik.touched.startDate && formik.errors.startDate} margin="normal" InputLabelProps={{ shrink: true }} />
            <TextField fullWidth name="endDate" label="End Date" type="date" value={formik.values.endDate} onChange={formik.handleChange} error={formik.touched.endDate && Boolean(formik.errors.endDate)} helperText={formik.touched.endDate && formik.errors.endDate} margin="normal" InputLabelProps={{ shrink: true }} />
            <TextField fullWidth name="totalBudget" label="Total Budget" type="number" value={formik.values.totalBudget} onChange={formik.handleChange} error={formik.touched.totalBudget && Boolean(formik.errors.totalBudget)} helperText={formik.touched.totalBudget && formik.errors.totalBudget} margin="normal" />

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Category Limits</Typography>
            {formik.values.categories.map((cat, index) => (
              <Box key={index} sx={{ display: "flex", gap: 2, mb: 1 }}>
                <TextField fullWidth select name={`categories.${index}.category`} label="Category" value={cat.category} onChange={formik.handleChange} margin="normal">
                  {categories.map((category) => (<MenuItem key={category} value={category}>{category}</MenuItem>))}
                </TextField>
                <TextField fullWidth name={`categories.${index}.limit`} label="Limit" type="number" value={cat.limit} onChange={formik.handleChange} margin="normal" />
              </Box>
            ))}

            <Button variant="outlined" onClick={() => {
              formik.setFieldValue("categories", [...formik.values.categories, { category: "", limit: "" }]);
            }} sx={{ mt: 1 }}>
              Add Category
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">{editingBudget ? "Update" : "Add"}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Budgets;
