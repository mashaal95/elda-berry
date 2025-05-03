// ControlPanel.tsx
import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  useTheme,
  Chip,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import CheckIcon from '@mui/icons-material/Check';

const ACCENT     = '#FF9800';   // softened Material orange
const LIGHT_GRAY = '#BDBBBB';   // Cool Gray 4 C
const BLACK      = '#000000';   // Process Black

const PRESETS = [1, 2, 3, 5];
const PRESETS_MINUTES = [5, 10, 15, 20]; // Add minute presets

interface ControlPanelProps {
  radius: number;
  setRadius: (v: number) => void;
  driveTime: number;
  setDriveTime: (v: number) => void;
  mode: 'radius' | 'driveTime';
  setMode: (m: 'radius' | 'driveTime') => void;
  onCreateCatchment: () => void;
}

export default function ControlPanel({
  radius,
  setRadius,
  driveTime,
  setDriveTime,
  mode,
  setMode,
  onCreateCatchment,
}: ControlPanelProps) {
  const theme = useTheme();
  const isRadiusMode = mode === 'radius';

  const toggleMode = () => {
    setMode(isRadiusMode ? 'driveTime' : 'radius');
  };

  const handleSliderChange = (_: Event, value: number | number[]) => {
    const numValue = value as number;
    if (isRadiusMode) {
      setRadius(numValue);
    } else {
      setDriveTime(numValue);
    }
  };

  const sliderValue = isRadiusMode ? radius : driveTime;
  const sliderMin = isRadiusMode ? 0.5 : 1;
  const sliderMax = isRadiusMode ? 5 : 20;
  const sliderStep = isRadiusMode ? 0.5 : 1;
  const unit = isRadiusMode ? 'km' : 'minutes';

  return (
    <Card
      elevation={3}
      sx={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 320,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ pt: 3, px: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <LocationOnIcon sx={{ color: ACCENT }} />
          <Typography variant="h4" sx={{ color: BLACK }}>
            Catchment
          </Typography>
        </Box>

        {/* Combined Value Display and Slider */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom sx={{ textAlign: 'center' }}>
             {sliderValue} {unit}
          </Typography>
          <Slider
            value={sliderValue}
            onChange={handleSliderChange}
            min={sliderMin}
            max={sliderMax}
            step={sliderStep}
            valueLabelDisplay="auto"
            sx={{
              '& .MuiSlider-thumb': {
                bgcolor: ACCENT,
                '&:hover, &.Mui-focusVisible': {
                  boxShadow: 'none',
                },
              },
              '& .MuiSlider-track': { bgcolor: ACCENT },
              '& .MuiSlider-rail':  { bgcolor: LIGHT_GRAY },
            }}
          />
        </Box>

        {/* Dynamic Preset Chips */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(${isRadiusMode ? PRESETS.length : PRESETS_MINUTES.length}, 1fr)`,
            gap: 1,
            mb: 2,
          }}
        >
          {(isRadiusMode ? PRESETS : PRESETS_MINUTES).map((p) => {
            const isActive = isRadiusMode ? radius === p : driveTime === p;
            const label = isRadiusMode ? `${p} km` : `${p} m`;

            return (
              <Chip
                key={p}
                label={label}
                clickable
                onClick={() => {
                  if (isRadiusMode) {
                    setRadius(p);
                  } else {
                    setDriveTime(p);
                  }
                }}
                sx={{
                  bgcolor: isActive ? ACCENT : 'transparent',
                  color: isActive ? '#fff' : BLACK,
                  border: `1px solid ${LIGHT_GRAY}`,
                  '&.MuiChip-clickable:hover': {
                    borderColor: ACCENT,
                  },
                }}
              />
            );
          })}
        </Box>

        {/* Drive Time Toggle (moved to the end) */}
        <FormControlLabel
          control={
            <Switch
              checked={!isRadiusMode}
              onChange={toggleMode}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: ACCENT,
                },
                '& .MuiSwitch-track': {
                  backgroundColor: LIGHT_GRAY,
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: ACCENT,
                },
              }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <DriveEtaIcon sx={{ fontSize: 20, color: !isRadiusMode ? ACCENT : BLACK }} />
              <Typography variant="subtitle1" sx={{ color: !isRadiusMode ? BLACK : BLACK }}>
                Drive time
              </Typography>
            </Box>
          }
          labelPlacement="start"
          sx={{
            mb: 0, ml: 0, justifyContent: 'space-between', width: '100%',
            bgcolor: !isRadiusMode ? `${ACCENT}22` : '#f5f5f5',
            borderRadius: 1,
            px: 1,
            py: 0.5,
            transition: 'background-color 0.2s ease-in-out',
          }}
        />
      </CardContent>

      <CardActions sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onCreateCatchment}
          startIcon={<CheckIcon />}
          sx={{
            bgcolor: ACCENT,
            color: '#fff',
            '&:hover': { bgcolor: theme.palette.primary.dark },
            fontSize: '0.9rem',
          }}
        >
          Create Catchment
        </Button>
      </CardActions>
    </Card>
  );
}
