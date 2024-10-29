import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';

function OpenAIDialog({
  open,
  onClose,
  openAIKey,
  setOpenAIKey,
  workloadDescription,
  setWorkloadDescription,
  useAzureOpenAI,
  setUseAzureOpenAI,
  azureOpenAIUrl,
  setAzureOpenAIUrl,
  handleGenerate,
  isGenerating,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Work Items with AI</DialogTitle>
      <DialogContent>
        <FormControlLabel
          control={
            <Switch
              checked={useAzureOpenAI}
              onChange={(e) => setUseAzureOpenAI(e.target.checked)}
              color="primary"
            />
          }
          label="Use Azure OpenAI"
        />
        <TextField
          autoFocus
          margin="dense"
          label="API Key"
          type="password"
          fullWidth
          value={openAIKey}
          onChange={(e) => setOpenAIKey(e.target.value)}
        />
        {useAzureOpenAI && (
          <TextField
            margin="dense"
            label="Azure OpenAI URL"
            type="text"
            fullWidth
            value={azureOpenAIUrl}
            onChange={(e) => setAzureOpenAIUrl(e.target.value)}
          />
        )}
        <TextField
          margin="dense"
          label="Workload Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={workloadDescription}
          onChange={(e) => setWorkloadDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isGenerating}>Cancel</Button>
        <Button onClick={handleGenerate} variant="contained" color="primary" disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default OpenAIDialog;
