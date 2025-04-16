import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { fetchTransactions } from "../redux/slices/transactionSlice";
import { fetchBudgets } from "../redux/slices/budgetSlice";
import { fetchGoals } from "../redux/slices/goalSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { transactions, loading: transactionsLoading } = useSelector(
    (state) => state.transactions
  );
  const { budgets, loading: budgetsLoading } = useSelector(
    (state) => state.budgets
  );
  const { goals, loading: goalsLoading } = useSelector((state) => state.goals);

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchBudgets());
    dispatch(fetchGoals());
  }, [dispatch]);

  const calculateTotalIncome = () => {
    return transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateTotalExpenses = () => {
    return transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const calculateBalance = () => {
    return calculateTotalIncome() - calculateTotalExpenses();
  };

  const getRecentTransactions = () => {
    return [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  };

  const getBudgetStatus = (budget) => {
    // Check if budget has categories array
    if (!budget.categories || !Array.isArray(budget.categories)) {
      return {
        spent: 0,
        percentage: 0,
        isOverBudget: false,
      };
    }

    // Calculate total spent for all categories in this budget
    const totalSpent = budget.totalSpent || 0;
    const totalBudget = budget.totalBudget || 0;

    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      spent: totalSpent,
      percentage: Math.min(percentage, 100),
      isOverBudget: percentage > 100,
    };
  };

  if (transactionsLoading || budgetsLoading || goalsLoading) {
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
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Income</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                ${calculateTotalIncome().toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Total Expenses</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                ${calculateTotalExpenses().toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={1}>
                <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Balance</Typography>
              </Box>
              <Typography
                variant="h4"
                color={calculateBalance() >= 0 ? "success.main" : "error.main"}
              >
                ${calculateBalance().toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <List>
              {getRecentTransactions().map((transaction) => (
                <React.Fragment key={transaction._id}>
                  <ListItem>
                    <ListItemIcon>
                      {transaction.type === "income" ? (
                        <TrendingUpIcon color="success" />
                      ) : (
                        <TrendingDownIcon color="error" />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={transaction.description || "No description"}
                      secondary={format(
                        new Date(transaction.date),
                        "MMM dd, yyyy"
                      )}
                    />
                    <Typography
                      variant="body1"
                      color={
                        transaction.type === "income"
                          ? "success.main"
                          : "error.main"
                      }
                    >
                      ${transaction.amount.toFixed(2)}
                    </Typography>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Budget Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Budget Overview
            </Typography>
            <List>
              {budgets && budgets.length > 0 ? (
                budgets.map((budget) => {
                  const status = getBudgetStatus(budget);
                  return (
                    <React.Fragment key={budget._id}>
                      <ListItem>
                        <ListItemText
                          primary={budget.name || "Unnamed Budget"}
                          secondary={
                            <Box component="span">
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                component="span"
                              >
                                ${status.spent.toFixed(2)} of $
                                {budget.totalBudget
                                  ? budget.totalBudget.toFixed(2)
                                  : "0.00"}
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={status.percentage}
                                color={
                                  status.isOverBudget ? "error" : "primary"
                                }
                                sx={{ mt: 1 }}
                              />
                            </Box>
                          }
                        />
                        {status.isOverBudget && (
                          <Tooltip title="Over Budget">
                            <IconButton color="error" size="small">
                              <WarningIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  );
                })
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ p: 2 }}
                >
                  No budgets found. Create a budget to track your spending.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Goals Overview */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Financial Goals
            </Typography>
            <Grid container spacing={2}>
              {goals && goals.length > 0 ? (
                goals.map((goal) => {
                  const progress =
                    goal.targetAmount > 0
                      ? (goal.currentAmount / goal.targetAmount) * 100
                      : 0;
                  return (
                    <Grid item xs={12} md={4} key={goal._id}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {goal.name}
                          </Typography>
                          <Box display="flex" alignItems="center" mb={1}>
                            <AttachMoneyIcon color="primary" sx={{ mr: 1 }} />
                            <Typography>
                              ${goal.currentAmount.toFixed(2)} of $
                              {goal.targetAmount.toFixed(2)}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ p: 2 }}
                >
                  No financial goals found. Create a goal to track your
                  progress.
                </Typography>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
