import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import type { ChatMessage } from './types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1,
          maxWidth: '82%',
          borderRadius: 2.5,
          bgcolor: isUser ? '#2563eb' : '#1f2937',
          color: '#f9fafb',
          borderTopRightRadius: isUser ? 0.75 : 2.5,
          borderTopLeftRadius: isUser ? 2.5 : 0.75,
          border: isUser ? 'none' : '1px solid #374151',
          boxShadow: isUser
            ? '0 8px 18px rgba(37, 99, 235, 0.36)'
            : '0 8px 14px rgba(2, 6, 23, 0.45)',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            lineHeight: 1.5,
            wordBreak: 'break-word',
          }}
        >
          {message.text}
        </Typography>
      </Box>
    </Box>
  );
}
