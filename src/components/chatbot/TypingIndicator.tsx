import { Box, Typography } from '@mui/material';
import { keyframes } from '@mui/system';

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.45; }
  40% { transform: translateY(-4px); opacity: 1; }
`;

export default function TypingIndicator() {
  return (
    <Box
      sx={{
        alignSelf: 'flex-start',
        maxWidth: '80%',
        px: 1.5,
        py: 1,
        borderRadius: 2,
        bgcolor: '#1f2937',
        border: '1px solid #374151',
      }}
    >
      <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mb: 0.25 }}>
        TopHeights is typing...
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.4 }}>
        {[0, 1, 2].map((dot) => (
          <Box
            key={dot}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: '#9ca3af',
              animation: `${bounce} 1.2s infinite ease-in-out`,
              animationDelay: `${dot * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
