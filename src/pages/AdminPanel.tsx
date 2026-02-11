// src/pages/AdminPanel.tsx
import React from 'react';
import { Box, Typography, Button, TextField, Paper } from '@mui/material';

export default function AdminPanel() {
  // In a real application, you would have state management for these forms
  // and logic to interact with your backend (Firebase).

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Section for Product Management */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Manage Products
        </Typography>
        <Box component="form" noValidate autoComplete="off" sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' } }}>
          <div>
            <TextField required id="product-title" label="Product Title" />
            <TextField required id="product-price" label="Price (KES)" type="number" />
            <TextField required id="product-stock" label="Stock Quantity" type="number" />
            <TextField id="product-image" label="Image URL (Placeholder)" />
          </div>
          <Button variant="contained" sx={{ mt: 2 }}>
            Add New Product
          </Button>
        </Box>
      </Paper>

      {/* Section for News Updates */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Manage News
        </Typography>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            required
            id="news-title"
            label="News Title"
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            required
            id="news-content"
            label="News Content"
            multiline
            rows={4}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button variant="contained">
            Post News Update
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
