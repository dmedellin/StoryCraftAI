import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

function AzureDevOpsPushDialog({
  open,
  onClose,
  pat,
  setPat,
  organization,
  setOrganization,
  project,
  setProject,
  handleSubmitPush,
  isPushing,
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Push to Azure DevOps</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Personal Access Token"
          type="password"
          fullWidth
          value={pat}
          onChange={(e) => setPat(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Organization"
          type="text"
          fullWidth
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Project"
          type="text"
          fullWidth
          value={project}
          onChange={(e) => setProject(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPushing}>Cancel</Button>
        <Button onClick={handleSubmitPush} variant="contained" color="primary" disabled={isPushing}>
          {isPushing ? 'Pushing...' : 'Push'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AzureDevOpsPushDialog;
