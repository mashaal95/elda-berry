import React from 'react';

interface ScoreCardPanelProps {
  onClose: () => void;
}

// --- Styles ---
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  padding: '20px 0',
  zIndex: 1000,
  fontFamily: 'sans-serif',
  boxSizing: 'border-box',
};

const panelStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '8px',
  boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  width: '60%',
  maxWidth: '1000px',
  height: '100%',
  margin: '0 auto',
  overflowY: 'hidden',
  position: 'relative',
  border: '1px dashed #ccc',
  boxSizing: 'border-box',
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '15px',
  right: '15px',
  background: 'none',
  border: 'none',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  color: '#666',
};


const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '10px',
};

const cardStyle: React.CSSProperties = {
  border: '1px dashed #ccc',
  borderRadius: '5px',
  padding: '10px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  minHeight: '90px',
  textAlign: 'center',
};

const cardHeaderStyle: React.CSSProperties = {
  fontSize: '0.8em',
  fontWeight: 'bold',
  marginBottom: '8px',
  textAlign: 'left',
};

const cardValueStyle: React.CSSProperties = {
  fontSize: '1.6em',
  fontWeight: 'bold',
  margin: 'auto 0',
};

const cardSubTextStyle: React.CSSProperties = {
  fontSize: '0.7em',
  color: '#666',
  marginTop: '5px',
};

const largeCardStyle: React.CSSProperties = {
  ...cardStyle,
  gridColumn: 'span 2',
  minHeight: '150px',
};

const ScoreCardPanel: React.FC<ScoreCardPanelProps> = ({ onClose }) => {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeButtonStyle} onClick={onClose}>&times;</button>

        <div style={gridStyle}>
          <div style={{ ...cardStyle, gridRow: 'span 2', alignSelf: 'start' }}>
            <div style={cardHeaderStyle}>Favourability Score</div>
            <div style={cardValueStyle}>74</div>
            <div style={cardSubTextStyle}>Composite of growth, gap, dual-income & income</div>
          </div>

          <div style={largeCardStyle}>
            <div style={cardHeaderStyle}>Catchment Map & Existing Centres</div>
            <div>Map placeholder</div>
            <div>• Size = approved places</div>
            <div>• Colour: Family / Centre-based</div>
            <div style={cardSubTextStyle}>Source: ACECQA • Why: competition view</div>
          </div>

          <div style={largeCardStyle}>
            <div style={cardHeaderStyle}>New Residential Dwellings (Next 5 Yrs)</div>
            <div>Development map placeholder</div>
            <div style={cardSubTextStyle}>Source: State pipeline • Why: future demand</div>
          </div>

          <div style={cardStyle}>
            <div style={cardHeaderStyle}>0-4 Pop (2025)</div>
            <div style={cardValueStyle}>570</div>
            <div style={cardSubTextStyle}>ABS ERP 2024 • Why: base demand</div>
          </div>

          <div style={cardStyle}>
            <div style={cardHeaderStyle}>0-4 Pop (2030)</div>
            <div style={cardValueStyle}>595</div>
            <div style={cardSubTextStyle}>Id forecasts • Why: growth</div>
          </div>

          <div style={cardStyle}>
            <div style={cardHeaderStyle}>Approved Places</div>
            <div style={cardValueStyle}>1326</div>
            <div style={cardSubTextStyle}>ACECQA • Why: supply cap</div>
          </div>

          <div style={cardStyle}>
            <div style={cardHeaderStyle}>Market-Share Assumption</div>
             <div style={{...cardValueStyle, fontSize: '1.5em', border: '1px solid #ccc', padding: '5px 10px', display: 'inline-block', margin: 'auto'}}>0.8</div>
            <div style={cardSubTextStyle}>User input • converts kids → places</div>
          </div>

          <div style={cardStyle}>
            <div style={cardHeaderStyle}>Child-Care Demand Gap</div>
            <div style={cardValueStyle}>155</div>
            <div style={{...cardSubTextStyle, fontWeight: 'bold' }}>Undersupply</div>
            <div style={cardSubTextStyle}>Calculated • key trigger</div>
          </div>

           <div style={cardStyle}>
            <div style={cardHeaderStyle}>Median Household Income</div>
            <div style={cardValueStyle}>$98,000</div>
            <div style={cardSubTextStyle}>ABS Census • Why: fee affordability</div>
          </div>

          <div style={cardStyle}>
            <div style={cardHeaderStyle}>Dual-Income Families %</div>
            <div style={cardValueStyle}>73%</div>
            <div style={cardSubTextStyle}>ABS labour-force • Why: hours & fees</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ScoreCardPanel; 