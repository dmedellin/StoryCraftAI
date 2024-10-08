import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

function MenuBar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">
          Story-CraftAI
        </Typography>
      </Toolbar>
    </AppBar>
  );
}

export default MenuBar;
