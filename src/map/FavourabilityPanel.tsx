import React, { useState, useEffect } from 'react'
import {
  Card,
  Typography,
  Box,
  Slider,
  Button,
  Divider,
  useTheme
} from '@mui/material'
import { styled } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Papa from 'papaparse'
import * as turf from '@turf/turf'
import type { FeatureCollection, Feature, Polygon, MultiPolygon } from 'geojson'
import ScoreCardPanel from './ScoreCardPanel'
import { motion } from 'framer-motion'

// Icons
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import BarChartIcon from '@mui/icons-material/BarChart'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import ScoreCardModal from './ScoreCardPanel'

interface ChartDataRow {
  Year: number
  Supply: number
  Demand: number
  SCORE: number
}

interface FavourabilityPanelProps {
  selectedSa1Ids: (string | number)[]
  markerPosition: { longitude: number; latitude: number } | null
  sa2Data: FeatureCollection | null
}

// Styled Card with slight elevation and rounded corners
const PanelCard = styled(Card)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(2),
  left: theme.spacing(2),
  zIndex: 10,
  width: 360,
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
  backgroundColor: '#fff'
}))

// --- Overlay Styles --- 
const loadingOverlayStyle: React.CSSProperties = {
  position: 'fixed', // Cover the whole viewport
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)', // Semi-transparent black
  display: 'flex',
  flexDirection: 'column', // Stack spinner and text vertically
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1100, // Ensure it's above other elements like the panel
  color: 'white' // Text color for the message
};

const loadingTextStyle: React.CSSProperties = {
  marginTop: '16px' // Space between spinner and text
};
// --- End Overlay Styles ---

export default function FavourabilityPanel({ selectedSa1Ids, markerPosition, sa2Data }: FavourabilityPanelProps) {
  const theme = useTheme()
  const [chartData, setChartData] = useState<ChartDataRow[]>([])
  const [resultsScore, setResultsScore] = useState(0)
  const [dataSource, setDataSource] = useState('Placeholder')
  const [selectedYear, setSelectedYear] = useState(2025)
  const [minYear, setMinYear] = useState(2025)
  const [maxYear, setMaxYear] = useState(2046)
  const [showScoreCard, setShowScoreCard] = useState(false)
  const [isSnapshotLoading, setIsSnapshotLoading] = useState(false)

  // Compute a dynamic color: red (0) to green (120) hue based on score %
  const scoreHue = (resultsScore / 100) * 120
  const scoreProgressColor = `hsl(${scoreHue}, 100%, 45%)`
  const scoreColor = '#FF9800' // keep UI elements orange
  

  const supplyColor = '#56565a'
  const demandColor = '#FF9800'

  // --- 1) Generate placeholder data if no CSV ---
  const generatePlaceholderData = (startYear: number, endYear: number): ChartDataRow[] => {
    const data: ChartDataRow[] = []
    const years = endYear - startYear + 1
    const minVal = 100, maxVal = 1000, spread = 150

    const supplyConst = Math.round(Math.random() * (maxVal - minVal) + minVal)
    const sDemand = supplyConst + (Math.random() - 0.5) * 2 * spread
    const eDemand = supplyConst + (Math.random() - 0.5) * 2 * spread
    const clamp = (v: number) => Math.max(minVal, Math.min(maxVal, v))

    for (let i = 0; i < years; i++) {
      const yr = startYear + i
      const dem = Math.round(clamp(sDemand) + (clamp(eDemand) - clamp(sDemand)) * (i / (years - 1)))
      const diff = dem - supplyConst
      const score = Math.round(Math.max(0, Math.min(100, ((diff + 110) / 210) * 100)))
      data.push({ Year: yr, Supply: supplyConst, Demand: dem, SCORE: score })
    }
    return data
  }

  // --- 2) Find which SA2 contains our marker ---
  const findContainingSa2Name = (): string | null => {
    if (!markerPosition || !sa2Data?.features) return null
    const pt = turf.point([markerPosition.longitude, markerPosition.latitude])
    for (const feat of sa2Data.features as Feature<Polygon|MultiPolygon>[]) {
      if (turf.booleanPointInPolygon(pt, feat)) {
        return feat.properties?.SA2_NAME21 ?? null
      }
    }
    return null
  }

  // --- 3) Load CSV or placeholder ---
  useEffect(() => {
    const sa2Name = findContainingSa2Name()
    let csvPath = ''
    let src = 'Placeholder'
    if (sa2Name?.toLowerCase().includes('leichhardt')) {
      csvPath = '/data/leichhart.csv'; src = 'Leichhardt'
    } else if (sa2Name?.toLowerCase().includes('wollert')) {
      csvPath = '/data/wollert.csv'; src = 'Wollert'
    }
    setDataSource(src)

    if (csvPath) {
      Papa.parse(csvPath, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (res) => {
          const mapHeader: Record<string, keyof ChartDataRow> = {
            'Year': 'Year',
            'Supply (no. approved places as at May 25)': 'Supply',
            'Demand (no. 0-4 year olds over time)': 'Demand',
            'SCORE': 'SCORE'
          }
          const cleaned = (res.data as any[])
            .map(r => {
              const out: Partial<ChartDataRow> = {}
              let ok = true
              for (const h in mapHeader) {
                const v = parseFloat(r[h])
                if (isNaN(v)) ok = false
                out[mapHeader[h]] = v
              }
              return ok ? (out as ChartDataRow) : null
            })
            .filter(Boolean) as ChartDataRow[]

          if (cleaned.length) {
            setChartData(cleaned)
            const yrs = cleaned.map(d => d.Year)
            setMinYear(Math.min(...yrs))
            setMaxYear(Math.max(...yrs))
            setSelectedYear(prev => Math.max(Math.min(...yrs), Math.min(prev, Math.max(...yrs))))
          } else {
            setChartData([])
          }
        },
        error: () => setChartData([])
      })
    } else {
      const pl = generatePlaceholderData(2025, 2046)
      setChartData(pl)
      setMinYear(2025)
      setMaxYear(2046)
      setSelectedYear(prev => Math.max(2025, Math.min(prev, 2046)))
    }
  }, [markerPosition, sa2Data])

  // --- 4) Update displayed SCORE ---
  useEffect(() => {
    const row = chartData.find(r => r.Year === selectedYear)
    setResultsScore(row?.SCORE ?? 0)
  }, [selectedYear, chartData])

  // Slider marks every 5 years
  const yearMarks: { value: number; label: string }[] = []
  for (let y = minYear; y <= maxYear; y += 5) {
    yearMarks.push({ value: y, label: String(y) })
  }

  // --- Handle Snapshot Click --- 
  const handleSnapshotClick = () => {
    setIsSnapshotLoading(true);
    setTimeout(() => {
      setShowScoreCard(true);
      setIsSnapshotLoading(false);
    }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10
      }}
    >
      <PanelCard>
        {/* Header */}
        <Box display="flex" alignItems="center" mb={1}>
          <ThumbUpIcon sx={{ color: scoreColor, mr: 1 }} />
          <Typography variant="h4">Favourability Score</Typography>
        </Box>
        <Box display="flex" alignItems="center" mb={2}>
          <LocationOnIcon sx={{ color: scoreColor, fontSize: 18, mr: 0.5 }} />
          <Typography variant="body2" color="textSecondary">
            Source: {dataSource}
          </Typography>
        </Box>

        {/* Gauge */}
        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
          <CircularProgress
            variant="determinate"
            value={resultsScore}
            size={100}
            thickness={7}
            sx={{ color: scoreProgressColor }}
          />
          <Typography
            variant="h4"
            sx={{ position: 'absolute', color: scoreColor, fontWeight: 500 }}
          >
            {resultsScore}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Chart Label */}
        <Box display="flex" alignItems="center" mb={1}>
          <BarChartIcon sx={{ color: scoreColor, mr: 1 }} />
          <Typography variant="subtitle2">Catchment Supply vs Demand</Typography>
        </Box>

        {/* Line Chart */}
        <Box sx={{ height: 180, mb: 2 }}>
          <ResponsiveContainer>
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 15 }}>
              <XAxis
                dataKey="Year"
                tickFormatter={y => String(y).slice(2)}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                interval="preserveStartEnd"
              />
              <YAxis
                tickFormatter={v => (v >= 1000 ? `${v / 1000}k` : v)}
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                width={32}
              />
              <Tooltip
                contentStyle={{ fontSize: 12 }}
                formatter={(val, name) => [
                  `${(val as number).toLocaleString()}`,
                  name === 'Supply' ? 'Approved Places' : 'Children'
                ]}
                labelFormatter={year => `Year: ${year}`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line name="Approved Places" dataKey="Supply" stroke={supplyColor} dot={false} strokeWidth={2} />
              <Line name="Children" dataKey="Demand" stroke={demandColor} dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Year Selector */}
        <Box display="flex" alignItems="center" mb={1}>
          <CalendarTodayIcon sx={{ color: scoreColor, mr: 1 }} />
          <Typography variant="body2">Year: {selectedYear}</Typography>
        </Box>
        <Slider
          min={minYear}
          max={maxYear}
          value={selectedYear}
          marks={yearMarks}
          onChange={(_, v) => setSelectedYear(v as number)}
          valueLabelDisplay="auto"
          sx={{
            color: scoreColor,
            height: 8,
            '& .MuiSlider-thumb': {
              width: 20,
              height: 20,
              backgroundColor: scoreColor,
              '&:hover, &.Mui-focusVisible': { boxShadow: 'none' }
            },
            '& .MuiSlider-track': { height: 8 },
            '& .MuiSlider-rail': { height: 8 }
          }}
        />

        {/* Snapshot Button - Reverted */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleSnapshotClick}
          sx={{ 
            mt: 3, 
            backgroundColor: scoreColor, 
            textTransform: 'none', 
            fontWeight: 600
          }}
        >
          Snapshot
        </Button>

        {showScoreCard && 
          <ScoreCardPanel
          open={showScoreCard}
          onClose={() => setShowScoreCard(false)}
          resultsScore={resultsScore}
          mapImageUrl="/data/maps/Wollert_RDF_example.png"
          chartData={chartData}
          ageCohortData={[]}
              />}
      </PanelCard>

      {/* Loading Overlay - Rendered conditionally outside PanelCard but inside motion.div wrapper */}
      {isSnapshotLoading && (
        <div style={loadingOverlayStyle}>
          <CircularProgress color="inherit" />
          <Typography 
            variant="h3"
            style={{ ...loadingTextStyle, color: 'white' }}
          >
            Calculating Snapshot...
          </Typography>
        </div>
      )}
    </motion.div>
  )
}