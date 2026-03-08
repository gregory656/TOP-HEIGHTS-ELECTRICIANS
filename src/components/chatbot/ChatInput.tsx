import { IconButton, InputAdornment, TextField } from '@mui/material';
import SendRounded from '@mui/icons-material/SendRounded';
import type { KeyboardEvent } from 'react';

interface ChatInputProps {
  value: string;
  disabled?: boolean;
  onChange: (next: string) => void;
  onSend: () => void;
}

export default function ChatInput({ value, disabled, onChange, onSend }: ChatInputProps) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
    >
      <TextField
        fullWidth
        size="small"
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask something about TopHeights..."
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  color="primary"
                  type="submit"
                  disabled={disabled || !value.trim()}
                  aria-label="Send message"
                >
                  <SendRounded fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 3,
            bgcolor: '#111827',
            color: '#f9fafb',
            '& fieldset': {
              borderColor: '#374151',
            },
            '&:hover fieldset': {
              borderColor: '#4b5563',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
            },
          },
          '& .MuiInputBase-input::placeholder': {
            color: '#9ca3af',
            opacity: 1,
          },
        }}
      />
    </form>
  );
}
