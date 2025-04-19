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
  FormControl,
  InputLabel,
  Select,
  Chip,
  Divider,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  Switch,
  FormControlLabel,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  CircularProgress,
  Stack,
  Badge,
  Avatar,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon,
  Savings as SavingsIcon,
  CreditCard as CreditCardIcon,
  ShowChart as ShowChartIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Flag as FlagIcon,
  Timeline as TimelineIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  EmojiEvents as TrophyIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import { format, differenceInDays, isAfter, isBefore } from "date-fns";
import {
  fetchGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  addGoalMilestone,
  deleteAllGoals,
} from "../redux/slices/goalSlice";

const validationSchema = yup.object({
  name: yup.string().required("Name is required"),
  type: yup.string().required("Type is required"),
  targetAmount: yup
    .number()
    .required("Target amount is required")
    .positive("Amount must be positive"),
  currentAmount: yup
    .number()
    .required("Current amount is required")
    .min(0, "Amount cannot be negative"),
  startDate: yup.date().required("Start date is required"),
  targetDate: yup
    .date()
    .required("Target date is required")
    .test(
      "is-after-start",
      "Target date must be after start date",
      function (value) {
        const { startDate } = this.parent;
        return !startDate || !value || isAfter(value, new Date(startDate));
      }
    ),
  status: yup.string().required("Status is required"),
  priority: yup.string().required("Priority is required"),
  description: yup.string(),
  notifications: yup.object({
    enabled: yup.boolean(),
    frequency: yup.string().when("enabled", {
      is: true,
      then: (schema) =>
        schema.required(
          "Notification frequency is required when notifications are enabled"
        ),
      otherwise: (schema) => schema.nullable(),
    }),
  }),
});

const goalTypes = ["savings", "debt", "purchase", "investment"];
const statuses = ["active", "completed", "cancelled"];
const priorities = ["low", "medium", "high"];
const notificationFrequencies = ["daily", "weekly", "monthly"];

function Goals() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { goals, loading } = useSelector((state) => state.goals);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [expandedGoal, setExpandedGoal] = useState(null);
  const [milestoneDialog, setMilestoneDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [progressAmount, setProgressAmount] = useState("");
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      name: "",
      type: "savings",
      targetAmount: "",
      currentAmount: "0",
      startDate: new Date().toISOString().split("T")[0],
      targetDate: new Date(new Date().setMonth(new Date().getMonth() + 1))
        .toISOString()
        .split("T")[0],
      status: "active",
      priority: "medium",
      description: "",
      notifications: {
        enabled: true,
        frequency: "weekly",
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Convert date strings to Date objects
        const goalData = {
          ...values,
          startDate: new Date(values.startDate).toISOString(),
          targetDate: new Date(values.targetDate).toISOString(),
        };

        if (editingGoal) {
          await dispatch(updateGoal({ id: editingGoal._id, goalData }));
        } else {
          await dispatch(addGoal(goalData));
        }
        setSuccess(true);
        setError(null);
        setTimeout(() => setSuccess(false), 3000);
        handleCloseDialog();
      } catch (error) {
        console.error("Failed to save goal:", error);
        setError(error.message || "Failed to save goal");
        setSuccess(false);
      }
    },
  });

  const milestoneFormik = useFormik({
    initialValues: {
      amount: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    },
    validationSchema: yup.object({
      amount: yup
        .number()
        .required("Amount is required")
        .positive("Amount must be positive"),
      date: yup.date().required("Date is required"),
      description: yup.string().required("Description is required"),
    }),
    onSubmit: async (values) => {
      try {
        const milestoneData = {
          ...values,
          date: new Date(values.date).toISOString(),
        };

        await dispatch(
          addGoalMilestone({
            id: selectedGoal._id,
            milestoneData,
          })
        );

        setMilestoneDialog(false);
        setSuccess(true);
        setError(null);
        setTimeout(() => setSuccess(false), 3000);
      } catch (error) {
        console.error("Failed to add milestone:", error);
        setError(error.message || "Failed to add milestone");
        setSuccess(false);
      }
    },
  });

  const handleOpenDialog = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      formik.setValues({
        name: goal.name,
        type: goal.type,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        startDate: new Date(goal.startDate).toISOString().split("T")[0],
        targetDate: new Date(goal.targetDate).toISOString().split("T")[0],
        status: goal.status,
        priority: goal.priority,
        description: goal.description || "",
        notifications: goal.notifications || {
          enabled: true,
          frequency: "weekly",
        },
      });
    } else {
      setEditingGoal(null);
      formik.resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGoal(null);
    formik.resetForm();
    setError(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await dispatch(deleteGoal(id));
        setSuccess(true);
        setError(null);
        setTimeout(() => setSuccess(false), 3000);
      } catch (error) {
        console.error("Failed to delete goal:", error);
        setError(error.message || "Failed to delete goal");
        setSuccess(false);
      }
    }
  };

  const handleUpdateProgress = async (goalId, amount) => {
    try {
      await dispatch(
        updateGoalProgress({ id: goalId, amount: parseFloat(amount) })
      );
      setProgressAmount("");
      setSuccess(true);
      setError(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update progress:", error);
      setError(error.message || "Failed to update progress");
      setSuccess(false);
    }
  };

  const handleOpenMilestoneDialog = (goal) => {
    setSelectedGoal(goal);
    milestoneFormik.resetForm();
    setMilestoneDialog(true);
  };

  const handleCloseMilestoneDialog = () => {
    setMilestoneDialog(false);
    setSelectedGoal(null);
    milestoneFormik.resetForm();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return theme.palette.success.main;
      case "completed":
        return theme.palette.info.main;
      case "cancelled":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return theme.palette.error.main;
      case "medium":
        return theme.palette.warning.main;
      case "low":
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case "savings":
        return <MoneyIcon fontSize="small" />;
      case "debt":
        return <TrendingDownIcon fontSize="small" />;
      case "purchase":
        return <ShoppingCartIcon fontSize="small" />;
      case "investment":
        return <TrendingUpIcon fontSize="small" />;
      default:
        return <MoneyIcon fontSize="small" />;
    }
  };

  const calculateProgress = (goal) => {
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  const calculateDaysRemaining = (goal) => {
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    return differenceInDays(targetDate, today);
  };

  const isOnTrack = (goal) => {
    const today = new Date();
    const startDate = new Date(goal.startDate);
    const targetDate = new Date(goal.targetDate);

    const totalDays = differenceInDays(targetDate, startDate);
    const daysElapsed = differenceInDays(today, startDate);

    if (totalDays <= 0 || daysElapsed <= 0) return true;

    const expectedProgress = (daysElapsed / totalDays) * 100;
    const actualProgress = calculateProgress(goal);

    return actualProgress >= expectedProgress;
  };

  const toggleExpand = (goalId) => {
    setExpandedGoal(expandedGoal === goalId ? null : goalId);
  };

  const handleDeleteAll = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete all goals? This action cannot be undone."
      )
    ) {
      try {
        await dispatch(deleteAllGoals()).unwrap();
        setAlert({
          open: true,
          message: "All goals deleted successfully",
          severity: "success",
        });
      } catch (error) {
        setAlert({
          open: true,
          message: error.message || "Failed to delete all goals",
          severity: "error",
        });
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Financial Goals
        </Typography>
        <Box>
          <Button
            variant="outlined"
            color="error"
            onClick={handleDeleteAll}
            sx={{ mr: 2 }}
          >
            Delete All Goals
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2 }}
          >
            Add New Goal
          </Button>
        </Box>
      </Stack>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {editingGoal
            ? "Goal updated successfully!"
            : "Goal added successfully!"}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {goals.map((goal) => {
            const progress = calculateProgress(goal);
            const onTrack = isOnTrack(goal);
            const isExpanded = expandedGoal === goal._id;

            return (
              <Grid item xs={12} md={6} key={goal._id}>
                <Card
                  elevation={3}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: alpha(getStatusColor(goal.status), 0.1),
                            color: getStatusColor(goal.status),
                          }}
                        >
                          {getTypeIcon(goal.type)}
                        </Avatar>
                        <Typography variant="h6" component="h2">
                          {goal.name}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(goal)}
                            sx={{ color: theme.palette.primary.main }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(goal._id)}
                            sx={{ color: theme.palette.error.main }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={isExpanded ? "Show Less" : "Show More"}>
                          <IconButton
                            size="small"
                            onClick={() => toggleExpand(goal._id)}
                          >
                            {isExpanded ? (
                              <ExpandLessIcon />
                            ) : (
                              <ExpandMoreIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1} mb={2}>
                      <Chip
                        label={goal.type}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(goal.status), 0.1),
                          color: getStatusColor(goal.status),
                        }}
                      />
                      <Chip
                        label={goal.status}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(goal.status), 0.1),
                          color: getStatusColor(goal.status),
                        }}
                      />
                      <Chip
                        icon={<FlagIcon />}
                        label={goal.priority}
                        size="small"
                        sx={{
                          bgcolor: alpha(getPriorityColor(goal.priority), 0.1),
                          color: getPriorityColor(goal.priority),
                        }}
                      />
                      {onTrack ? (
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="On Track"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          icon={<WarningIcon />}
                          label="Off Track"
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      )}
                    </Stack>

                    <Box mb={2}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        mb={1}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {progress.toFixed(1)}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(progress, 100)}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>

                    <Stack direction="row" spacing={2} mb={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Target
                        </Typography>
                        <Typography variant="h6">
                        ₹{goal.targetAmount.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Current
                        </Typography>
                        <Typography variant="h6">
                        ₹{goal.currentAmount.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Remaining
                        </Typography>
                        <Typography variant="h6">
                        ₹
                          {(
                            goal.targetAmount - goal.currentAmount
                          ).toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>

                    <Collapse in={isExpanded}>
                      <Divider sx={{ my: 2 }} />

                      {goal.description && (
                        <Typography variant="body2" paragraph>
                          {goal.description}
                        </Typography>
                      )}

                      <Box mb={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Update Progress
                        </Typography>
                        <Stack direction="row" spacing={1}>
                          <TextField
                            size="small"
                            label="Amount"
                            type="number"
                            value={progressAmount}
                            onChange={(e) => setProgressAmount(e.target.value)}
                            sx={{ flexGrow: 1 }}
                          />
                          <Button
                            variant="contained"
                            onClick={() =>
                              handleUpdateProgress(goal._id, progressAmount)
                            }
                            disabled={!progressAmount}
                          >
                            Update
                          </Button>
                        </Stack>
                      </Box>

                      <Box mb={2}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1}
                        >
                          <Typography variant="subtitle2">
                            Milestones
                          </Typography>
                          <Button
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenMilestoneDialog(goal)}
                          >
                            Add Milestone
                          </Button>
                        </Stack>

                        {goal.milestones && goal.milestones.length > 0 ? (
                          <List dense>
                            {goal.milestones.map((milestone, index) => (
                              <ListItem key={index}>
                                <ListItemText
                                  primary={`₹${milestone.amount.toLocaleString()} - ${
                                    milestone.description
                                  }`}
                                  secondary={format(
                                    new Date(milestone.date),
                                    "MMM dd, yyyy"
                                  )}
                                />
                                <ListItemSecondaryAction>
                                  <Checkbox
                                    edge="end"
                                    checked={milestone.achieved}
                                    onChange={() =>
                                      handleToggleMilestone(goal._id, index)
                                    }
                                  />
                                </ListItemSecondaryAction>
                              </ListItem>
                            ))}
                          </List>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No milestones added yet
                          </Typography>
                        )}
                      </Box>

                      {/* <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Notifications
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={goal.notifications?.enabled || false}
                              onChange={() => handleToggleNotifications(goal)}
                            />
                          }
                          label="Enable notifications"
                        />

                        {goal.notifications?.enabled && (
                          <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                            <InputLabel>Frequency</InputLabel>
                            <Select
                              value={goal.notifications?.frequency || "weekly"}
                              label="Frequency"
                              onChange={(e) =>
                                handleUpdateNotificationFrequency(
                                  goal,
                                  e.target.value
                                )
                              }
                            >
                              {notificationFrequencies.map((freq) => (
                                <MenuItem key={freq} value={freq}>
                                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        )}
                      </Box> */}
                    </Collapse>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      startIcon={<TimelineIcon />}
                      onClick={() => toggleExpand(goal._id)}
                    >
                      {isExpanded ? "Show Less" : "Show More"}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Goal Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>{editingGoal ? "Edit Goal" : "Add New Goal"}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Goal Name"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    name="type"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                    label="Type"
                  >
                    {goalTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    name="priority"
                    value={formik.values.priority}
                    onChange={formik.handleChange}
                    label="Priority"
                  >
                    {priorities.map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Amount"
                  name="targetAmount"
                  type="number"
                  value={formik.values.targetAmount}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.targetAmount &&
                    Boolean(formik.errors.targetAmount)
                  }
                  helperText={
                    formik.touched.targetAmount && formik.errors.targetAmount
                  }
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Current Amount"
                  name="currentAmount"
                  type="number"
                  value={formik.values.currentAmount}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.currentAmount &&
                    Boolean(formik.errors.currentAmount)
                  }
                  helperText={
                    formik.touched.currentAmount && formik.errors.currentAmount
                  }
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formik.values.startDate}
                  onChange={formik.handleChange}
                  InputLabelProps={{ shrink: true }}
                  error={
                    formik.touched.startDate && Boolean(formik.errors.startDate)
                  }
                  helperText={
                    formik.touched.startDate && formik.errors.startDate
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Date"
                  name="targetDate"
                  type="date"
                  value={formik.values.targetDate}
                  onChange={formik.handleChange}
                  InputLabelProps={{ shrink: true }}
                  error={
                    formik.touched.targetDate &&
                    Boolean(formik.errors.targetDate)
                  }
                  helperText={
                    formik.touched.targetDate && formik.errors.targetDate
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={3}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                />
              </Grid>

              {/* <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Notifications
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.notifications.enabled}
                      onChange={(e) => {
                        formik.setFieldValue(
                          "notifications.enabled",
                          e.target.checked
                        );
                      }}
                    />
                  }
                  label="Enable notifications"
                />

                {formik.values.notifications.enabled && (
                  <FormControl fullWidth sx={{ mt: 1 }}>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      name="notifications.frequency"
                      value={formik.values.notifications.frequency}
                      onChange={formik.handleChange}
                      label="Frequency"
                    >
                      {notificationFrequencies.map((freq) => (
                        <MenuItem key={freq} value={freq}>
                          {freq.charAt(0).toUpperCase() + freq.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Grid> */}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={formik.handleSubmit}
            disabled={formik.isSubmitting}
          >
            {editingGoal ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Milestone Dialog */}
      <Dialog
        open={milestoneDialog}
        onClose={handleCloseMilestoneDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle>Add Milestone</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={milestoneFormik.handleSubmit}
            sx={{ mt: 2 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={milestoneFormik.values.amount}
                  onChange={milestoneFormik.handleChange}
                  error={
                    milestoneFormik.touched.amount &&
                    Boolean(milestoneFormik.errors.amount)
                  }
                  helperText={
                    milestoneFormik.touched.amount &&
                    milestoneFormik.errors.amount
                  }
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Date"
                  name="date"
                  type="date"
                  value={milestoneFormik.values.date}
                  onChange={milestoneFormik.handleChange}
                  InputLabelProps={{ shrink: true }}
                  error={
                    milestoneFormik.touched.date &&
                    Boolean(milestoneFormik.errors.date)
                  }
                  helperText={
                    milestoneFormik.touched.date && milestoneFormik.errors.date
                  }
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={milestoneFormik.values.description}
                  onChange={milestoneFormik.handleChange}
                  error={
                    milestoneFormik.touched.description &&
                    Boolean(milestoneFormik.errors.description)
                  }
                  helperText={
                    milestoneFormik.touched.description &&
                    milestoneFormik.errors.description
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMilestoneDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={milestoneFormik.handleSubmit}
            disabled={milestoneFormik.isSubmitting}
          >
            Add Milestone
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Goals;