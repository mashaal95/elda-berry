// ScoreCardModal.tsx
import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  useTheme,
  Button
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import StarIcon from '@mui/icons-material/Star'
import CircleIcon from '@mui/icons-material/Circle'
import HomeIcon from '@mui/icons-material/Home'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'

interface ChartDataRow {
  Year: number
  Supply: number
  Demand: number
}

interface AgeCohortRow {
  year: number
  a0_2: number
  a3_4: number
  total: number
}

interface ScoreCardModalProps {
  open: boolean
  onClose: () => void
  resultsScore: number            // 0–100
  mapImageUrl: string
  chartData?: ChartDataRow[]      // optional, defaults below
  ageCohortData?: AgeCohortRow[]  // optional, defaults below
}

// --- dummy default data for 5-year increments ---
// Export default data
export const defaultChartData: ChartDataRow[] = [
  { Year: 2025, Supply: 100, Demand: 120 },
  { Year: 2030, Supply: 115, Demand: 130 },
  { Year: 2035, Supply: 130, Demand: 145 },
]

export const defaultAgeCohortData: AgeCohortRow[] = [
  { year: 2025, a0_2: 399, a3_4: 272, total: 671 },
  { year: 2030, a0_2: 1109, a3_4: 815, total: 1924 },
  { year: 2035, a0_2: 3082, a3_4: 1695, total: 4777 },
]

export default function ScoreCardModal({
  open,
  onClose,
  resultsScore,
  mapImageUrl,
  chartData = defaultChartData,
}: ScoreCardModalProps) {
  const theme = useTheme()
  const [viewMode, setViewMode] = useState<'absolute' | 'percent'>('absolute')

  // --- Hardcoded Table Data (Extended) --- 
  const tableYears = ['2025', '2030', '2035', '2040', '2045'];
  const tableRows = [
    { label: '0–2 yrs', data: [399, 1109, 3082, 4500, 5800] },
    { label: '3–4 yrs', data: [272, 815, 1695, 2400, 3000] },
    { label: 'Total 0–4 yrs', data: [671, 1924, 4777, 6900, 8800] }
  ];
  // --- End Hardcoded Table Data --- 

  // .id palette accents
  const orange = '#ff4511'
  const teal = '#00a59b'
  const darkGray = '#323232'
  const lightGray = '#eeeeee'

  const metrics = [
    {
      icon: <StarIcon sx={{ color: orange }} />,
      title: 'Favourability score',
      value: `${Math.ceil(resultsScore / 20)} / 5`,
      caption: 'Critical undersupply'
    },
    {
      icon: <CircleIcon sx={{ color: orange }} />,
      title: 'SEIFA (IRSAD) score',
      value: '962'
    },
    {
      icon: <CircleIcon sx={{ color: orange }} />,
      title: 'Median HH income',
      value: '$1,594 pw'
    },
    {
      icon: <HomeIcon sx={{ color: orange }} />,
      title: 'Dual-income HHs',
      value: 'TBC'
    }
  ]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      scroll="paper"
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <Typography variant="h4">Location Scorecard</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Headline metrics */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader
                title={<Typography variant="h5">Headline metrics</Typography>}
                sx={{ pb: 0 }}
              />
              <CardContent>
                <Grid container spacing={1}>
                  {metrics.map((m, i) => (
                    <Grid item xs={12} key={i}>
                      <Card
                        variant="outlined"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 1,
                          bgcolor: lightGray
                        }}
                      >
                        <Box sx={{ mr: 2 }}>{m.icon}</Box>
                        <Box>
                          <Typography variant="subtitle2">
                            {m.title}
                          </Typography>
                          <Typography variant="h6">{m.value}</Typography>
                          {m.caption && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {m.caption}
                            </Typography>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Map */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader
                avatar={<LocationOnIcon sx={{ color: teal }} />}
                action={
                  <IconButton size="small">
                    <FullscreenIcon fontSize="small" />
                  </IconButton>
                }
                title={
                  <Typography variant="h5">
                    Approved childcare centres
                  </Typography>
                }
              />
              <CardContent sx={{ p: 0 }}>
                <Box
                  component="img"
                  src={mapImageUrl}
                  alt="approved centres map"
                  sx={{
                    width: '100%',
                    height: 256,
                    objectFit: 'cover',
                    bgcolor: lightGray
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Supply vs Demand */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Typography variant="h5">
                    Supply vs Demand (0–4 yrs)
                  </Typography>
                }
                action={
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={viewMode}
                    onChange={(_, v) => v && setViewMode(v)}
                  >
                    <ToggleButton value="absolute">Absolute</ToggleButton>
                    <ToggleButton value="percent">Percent</ToggleButton>
                  </ToggleButtonGroup>
                }
              />
              <CardContent sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke={lightGray} />
                    <XAxis dataKey="Year" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(val: number) =>
                        new Intl.NumberFormat().format(val)
                      }
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Line
                      type="monotone"
                      dataKey="Demand"
                      name="Demand"
                      stroke={darkGray}
                      strokeDasharray="4 2"
                      strokeWidth={2}
                      dot={false}
                      opacity={viewMode === 'percent' ? 0.6 : 1}
                    />
                    <Line
                      type="monotone"
                      dataKey="Supply"
                      name="Supply"
                      stroke={teal}
                      strokeWidth={2}
                      dot={false}
                      opacity={viewMode === 'percent' ? 0.6 : 1}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Forecast */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardHeader
                title={
                  <Typography variant="h5">
                    Forecast – Children by Age Cohort
                  </Typography>
                }
              />
              <CardContent>
                <TableContainer
                  component={Paper}
                  variant="outlined"
                  sx={{ /* maxHeight: 300 */ }}
                >
                  <Table size="small" stickyHeader>
                    <TableHead sx={{ bgcolor: lightGray }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          Age group
                        </TableCell>
                        {/* Header: Use hardcoded years */}
                        {tableYears.map(year => (
                          <TableCell
                            key={year}
                            align="right"
                            sx={{ fontWeight: 'bold' }}
                          >
                            {year}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {/* Body: Use hardcoded rows and data */}
                      {tableRows.map(ageRow => (
                        <TableRow 
                          key={ageRow.label}
                          sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell component="th" scope="row" sx={{ fontWeight: 'medium' }}>
                            {ageRow.label}
                          </TableCell>
                          {ageRow.data.map((value, index) => (
                            <TableCell key={index} align="right">
                              {value.toLocaleString() ?? '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
