import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import { fetchTransactions } from "../redux/slices/transactionSlice";
import { fetchBudgets } from "../redux/slices/budgetSlice";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Reports() {
  const dispatch = useDispatch();
  const { transactions, loading: transactionsLoading } = useSelector(
    (state) => state.transactions
  );
  const { budgets, loading: budgetsLoading } = useSelector(
    (state) => state.budgets
  );
  const [timeRange, setTimeRange] = useState("month");

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchBudgets());
  }, [dispatch]);

  const getDateRange = () => {
    const today = new Date();
    switch (timeRange) {
      case "week":
        return {
          start: new Date(today.setDate(today.getDate() - 7)),
          end: new Date(),
        };
      case "lastMonth":
        const lastMonth = new Date(
          today.getFullYear(),
          today.getMonth() - 1,
          1
        );
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth),
        };
      case "month":
        return {
          start: startOfMonth(new Date()),
          end: endOfMonth(new Date()),
        };
      case "year":
        return {
          start: new Date(today.getFullYear(), 0, 1),
          end: new Date(today.getFullYear(), 11, 31),
        };
      default:
        return {
          start: startOfMonth(new Date()),
          end: endOfMonth(new Date()),
        };
    }
  };

  const getFilteredTransactions = () => {
    const { start, end } = getDateRange();
    return transactions.filter(
      (t) => new Date(t.date) >= start && new Date(t.date) <= end
    );
  };

  const prepareIncomeVsExpensesData = () => {
    const filteredTransactions = getFilteredTransactions();
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      labels: ["Income", "Expenses"],
      datasets: [
        {
          data: [income, expenses],
          backgroundColor: ["#4caf50", "#f44336"],
        },
      ],
    };
  };

  const prepareCategoryExpensesData = () => {
    const filteredTransactions = getFilteredTransactions();
    const categoryTotals = {};

    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        categoryTotals[t.category] =
          (categoryTotals[t.category] || 0) + t.amount;
      });

    return {
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          label: "Expenses by Category",
          data: Object.values(categoryTotals),
          backgroundColor: [
            "#2196f3",
            "#4caf50",
            "#ff9800",
            "#f44336",
            "#9c27b0",
            "#00bcd4",
          ],
        },
      ],
    };
  };

  const prepareDailyTransactionsData = () => {
    const { start, end } = getDateRange();
    const days = eachDayOfInterval({ start, end });
    const dailyData = {};

    days.forEach((day) => {
      dailyData[format(day, "yyyy-MM-dd")] = {
        income: 0,
        expenses: 0,
      };
    });

    getFilteredTransactions().forEach((t) => {
      const date = format(new Date(t.date), "yyyy-MM-dd");
      if (dailyData[date]) {
        if (t.type === "income") {
          dailyData[date].income += t.amount;
        } else {
          dailyData[date].expenses += t.amount;
        }
      }
    });

    return {
      labels: Object.keys(dailyData).map((date) =>
        format(new Date(date), "MMM dd")
      ),
      datasets: [
        {
          label: "Income",
          data: Object.values(dailyData).map((d) => d.income),
          borderColor: "#4caf50",
          tension: 0.1,
        },
        {
          label: "Expenses",
          data: Object.values(dailyData).map((d) => d.expenses),
          borderColor: "#f44336",
          tension: 0.1,
        },
      ],
    };
  };

  if (transactionsLoading || budgetsLoading) {
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
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h5">Financial Reports</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="lastMonth">Last Month</MenuItem>
            <MenuItem value="month">This Month</MenuItem>
            <MenuItem value="year">This Year</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Income vs Expenses
            </Typography>
            <Box sx={{ height: 300 }}>
              <Pie
                data={prepareIncomeVsExpensesData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Expenses by Category
            </Typography>
            <Box sx={{ height: 300 }}>
              <Bar
                data={prepareCategoryExpensesData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Daily Transactions
            </Typography>
            <Box sx={{ height: 400 }}>
              <Line
                data={prepareDailyTransactionsData()}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Reports;
