import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Card,
  CardContent,
  Fab,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  CheckCircle,
  RadioButtonUnchecked,
  Assignment,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/todos');
      setTodos(response.data);
    } catch (error) {
      toast.error('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTodo = async () => {
    if (!formData.title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    try {
      const response = await api.post('/todos', formData);
      setTodos([...todos, response.data]);
      toast.success('Tarea creada exitosamente');
      handleCloseDialog();
    } catch (error) {
      toast.error('Error al crear la tarea');
    }
  };

  const handleUpdateTodo = async () => {
    if (!formData.title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    try {
      const response = await api.put(`/todos/${editingTodo.id}`, formData);
      setTodos(todos.map(todo => 
        todo.id === editingTodo.id ? response.data : todo
      ));
      toast.success('Tarea actualizada exitosamente');
      handleCloseDialog();
    } catch (error) {
      toast.error('Error al actualizar la tarea');
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      const response = await api.put(`/todos/${todo.id}`, {
        ...todo,
        completed: !todo.completed
      });
      setTodos(todos.map(t => t.id === todo.id ? response.data : t));
      toast.success(
        response.data.completed ? 'Tarea completada' : 'Tarea marcada como pendiente'
      );
    } catch (error) {
      toast.error('Error al actualizar la tarea');
    }
  };

  const handleDeleteTodo = async (todoId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      return;
    }

    try {
      await api.delete(`/todos/${todoId}`);
      setTodos(todos.filter(todo => todo.id !== todoId));
      toast.success('Tarea eliminada exitosamente');
    } catch (error) {
      toast.error('Error al eliminar la tarea');
    }
  };

  const handleOpenDialog = (todo = null) => {
    setEditingTodo(todo);
    setFormData({
      title: todo?.title || '',
      description: todo?.description || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTodo(null);
    setFormData({ title: '', description: '' });
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         todo.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'completed') return matchesSearch && todo.completed;
    if (filter === 'pending') return matchesSearch && !todo.completed;
    return matchesSearch;
  });

  const completedCount = todos.filter(todo => todo.completed).length;
  const pendingCount = todos.filter(todo => !todo.completed).length;

  if (loading) {
    return <LoadingSpinner message="Cargando tareas..." />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
          Mis Tareas
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Organiza y gestiona tus tareas de manera eficiente
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assignment sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {todos.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total de Tareas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {completedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completadas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <RadioButtonUnchecked sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {pendingCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pendientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar tareas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por</InputLabel>
              <Select
                value={filter}
                label="Filtrar por"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">Todas</MenuItem>
                <MenuItem value="pending">Pendientes</MenuItem>
                <MenuItem value="completed">Completadas</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleOpenDialog()}
              startIcon={<Add />}
            >
              Nueva Tarea
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Todo List */}
      <Paper>
        {filteredTodos.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Assignment sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {todos.length === 0 ? 'No tienes tareas aún' : 'No se encontraron tareas'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {todos.length === 0 ? 'Crea tu primera tarea para comenzar' : 'Intenta cambiar los filtros de búsqueda'}
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredTodos.map((todo, index) => (
              <ListItem
                key={todo.id}
                divider={index !== filteredTodos.length - 1}
                sx={{
                  py: 2,
                  backgroundColor: todo.completed ? 'action.hover' : 'transparent',
                }}
              >
                <Checkbox
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo)}
                  sx={{ mr: 2 }}
                />
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {todo.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={todo.completed ? 'Completada' : 'Pendiente'}
                        color={todo.completed ? 'success' : 'warning'}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      {todo.description && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: todo.completed ? 'text.disabled' : 'text.secondary',
                            mt: 0.5,
                          }}
                        >
                          {todo.description}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.disabled">
                        Creada: {new Date(todo.createdAt).toLocaleDateString('es-ES')}
                      </Typography>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => handleOpenDialog(todo)}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteTodo(todo.id)}
                      size="small"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <Add />
      </Fab>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTodo ? 'Editar Tarea' : 'Nueva Tarea'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Título"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            margin="normal"
            autoFocus
          />
          <TextField
            fullWidth
            label="Descripción (opcional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancelar
          </Button>
          <Button
            onClick={editingTodo ? handleUpdateTodo : handleCreateTodo}
            variant="contained"
          >
            {editingTodo ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;

