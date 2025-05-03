// MapLayersPanel.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  FormControlLabel,
  Checkbox,
  Divider,
  useTheme,
} from '@mui/material';

interface LegendPanelProps {
  showSa1: boolean;
  setShowSa1: (show: boolean) => void;
  showSa2: boolean;
  setShowSa2: (show: boolean) => void;
  showChildcare: boolean;
  setShowChildcare: (show: boolean) => void;
}

export default function MapLayersPanel({
  showSa1,
  setShowSa1,
  showSa2,
  setShowSa2,
  showChildcare,
  setShowChildcare,
}: LegendPanelProps) {
  const theme = useTheme();

  return (
    <Card
      elevation={3}
      sx={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: 220,
        zIndex: theme.zIndex.drawer + 1,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 1 }}>
        <Typography variant="subtitle1" sx={{ px: 1, py: 0.5 }}>
          Map Layers
        </Typography>
        <Divider />

        <List dense disablePadding>
          <ListItem sx={{ py: 0 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={showSa1}
                  onChange={(e) => setShowSa1(e.target.checked)}
                />
              }
              label="SA1 Areas"
              sx={{ ml: 0 }}
            />
          </ListItem>

          <ListItem sx={{ py: 0 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={showSa2}
                  onChange={(e) => setShowSa2(e.target.checked)}
                />
              }
              label="SA2 Areas"
              sx={{ ml: 0 }}
            />
          </ListItem>

          <ListItem sx={{ py: 0 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={showChildcare}
                  onChange={(e) => setShowChildcare(e.target.checked)}
                />
              }
              label="Childcare Services"
              sx={{ ml: 0 }}
            />
          </ListItem>
        </List>
      </CardContent>
    </Card>
  );
}
