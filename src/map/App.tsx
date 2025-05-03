import Map, {Source, Layer, Popup, MapMouseEvent, Marker} from 'react-map-gl/mapbox';
import type { Feature, Polygon, FeatureCollection } from 'geojson';
import 'mapbox-gl/dist/mapbox-gl.css';
import {useEffect, useState, useCallback} from 'react';
import ControlPanel from './ControlPanel';
import FavourabilityPanel from './FavourabilityPanel';
import * as turf from '@turf/turf';
import { motion, AnimatePresence } from 'framer-motion';

const MAPBOX_TOKEN = "pk.eyJ1IjoibWFzaGFhbC1pZCIsImEiOiJjbTlodHZramwwNHF6MmpwcHltMjl4dm5lIn0.hSL2Z0xRLMz-hBKhv2aLHA";

// Define the style for the SA2 GeoJSON layer (Purple Outline)
const layerStyle = {
  id: 'sa2-data',
  type: 'line' as const,
  paint: {
    'line-color': '#800080', // Purple color
    'line-width': 3
  }
};

// Define the fill style for SA2 hover interaction (Transparent Fill)
const sa2FillStyle = {
  id: 'sa2-fill',
  type: 'fill' as const,
  paint: {
    'fill-color': 'transparent'
  }
};

// Define the style for the SA1 GeoJSON layer (Red Outline)
const sa1LayerStyle = {
  id: 'sa1-data',
  type: 'line' as const,
  paint: {
    'line-color': '#ff0000',
    'line-width': 0.75,
    'line-opacity': 0.2
  }
};

// Style for Childcare Services (Red Book Icons)
const childcareLayerStyle = {
  id: 'childcare-data',
  type: 'symbol' as const,
  layout: {
    'icon-image': 'library-15',
    'icon-allow-overlap': true,
    'icon-size': 1.5
  },
  paint: {
    'icon-color': '#ff0000',
    'icon-opacity': 1 
  }
};

// Style for the catchment circle (Translucent Blue Fill)
const catchmentLayerStyle = {
  id: 'catchment-circle',
  type: 'fill' as const,
  paint: {
    'fill-color': '#007cbf',
    'fill-opacity': 0.3
  }
};

// Style for highlighted SA1 areas (Yellow Fill)
const highlightedSa1LayerStyle = {
  id: 'sa1-highlighted',
  type: 'fill' as const,
  paint: {
    'fill-color': '#ffff00', // Yellow color
    'fill-opacity': 0.4
  }
};

// Style for the drive time isochrone (Translucent Orange Fill)
const driveTimeLayerStyle = {
  id: 'drive-time-isochrone',
  type: 'fill' as const,
  paint: {
    'fill-color': '#FFA500', // Orange color
    'fill-opacity': 0.3
  }
};


function App() {
  const [sa2Data, setSa2Data] = useState<FeatureCollection | null>(null);
  const [sa1Data, setSa1Data] = useState<FeatureCollection | null>(null);
  const [childcareData, setChildcareData] = useState<FeatureCollection | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ longitude: number; latitude: number; name: string } | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ longitude: number; latitude: number } | null>(null);
  const [catchmentRadius, setCatchmentRadius] = useState<number>(1); // Default radius
  const [driveTime, setDriveTime] = useState<number>(5); // Default drive time
  const [catchmentMode, setCatchmentMode] = useState<'radius' | 'driveTime'>('radius'); // Mode state
  const [catchmentCircle, setCatchmentCircle] = useState<Feature<Polygon> | null>(null);
  const [driveTimePolygon, setDriveTimePolygon] = useState<Feature<Polygon> | null>(null); // State for drive time polygon
  const [selectedSa1Ids, setSelectedSa1Ids] = useState<(string | number)[]>([]);
  const [isLoadingIsochrone, setIsLoadingIsochrone] = useState(false); // Loading state for API call

  // State for layer visibility
  const [showSa1] = useState(true);
  const [showSa2] = useState(true);
  const [showChildcare] = useState(true);

  useEffect(() => {
    // Fetch SA2 GeoJSON data
    fetch('/data/SA2.geojson')
      .then(resp => resp.json())
      .then(json => setSa2Data(json as GeoJSON.FeatureCollection))
      .catch(err => console.error("Could not load SA2 data:", err));

    // Fetch SA1 GeoJSON data
    fetch('/data/SA1.geojson')
      .then(resp => resp.json())
      .then(json => {
          if (json && json.features) {
            json.features = json.features.map((f: any) => ({ ...f, properties: f.properties || {} }));
          }
          setSa1Data(json as GeoJSON.FeatureCollection);
      })
      .catch(err => console.error("Could not load SA1 data:", err));

    // Fetch Childcare GeoJSON data
    fetch('/data/childcare_services.geojson')
      .then(resp => resp.json())
      .then(json => setChildcareData(json as GeoJSON.FeatureCollection))
      .catch(err => console.error("Could not load childcare data:", err));

  }, []);

  const onHover = useCallback((event: MapMouseEvent) => {
    const features = event.features;
    // Only show hover info if the corresponding layer is visible
    if (features && features.length > 0 && !isLoadingIsochrone) {
      const feature = features[0];
      let name = null;
      let showTooltip = false;

      if (feature.layer && feature.layer.id === 'sa2-fill' && feature.properties && showSa2) {
        name = feature.properties.SA2_NAME21;
        showTooltip = true;
      } else if (feature.layer && feature.layer.id === 'childcare-data' && feature.properties && showChildcare) {
        name = feature.properties.name;
        showTooltip = true;
      }

      if (showTooltip && name) {
         setHoverInfo({
           longitude: event.lngLat.lng,
           latitude: event.lngLat.lat,
           name: name
         });
      } else {
         setHoverInfo(null);
      }
    } else {
      setHoverInfo(null);
    }
  }, [isLoadingIsochrone, showSa2, showChildcare]); // Add visibility states to dependency array

  const onMouseLeave = useCallback(() => {
    setHoverInfo(null);
  }, []);

  const handleMapClick = useCallback((event: MapMouseEvent) => {
    setMarkerPosition({
      longitude: event.lngLat.lng,
      latitude: event.lngLat.lat
    });
    setCatchmentCircle(null);
    setDriveTimePolygon(null);
    setSelectedSa1Ids([]);
  }, []);

  // Function to calculate intersecting SA1s
  const calculateIntersectingSa1s = useCallback((containerPolygon: Feature<Polygon>) => {
    if (!sa1Data?.features) return [];

    const intersectingIds: (string | number)[] = [];
    sa1Data.features.forEach(feature => {
      if (feature?.properties?.SA1_CODE21 && feature.geometry) {
        let intersects = false;
        try {
          // turf.booleanIntersects handles both Polygon and MultiPolygon
          // It returns true if boundaries or interiors intersect in any way.
          intersects = turf.booleanIntersects(feature, containerPolygon);
        } catch (e) {
          // Handle potential errors with geometry checks (e.g., invalid geometries)
          console.error("Error checking feature intersection:", e, feature);
        }
        if (intersects) {
          intersectingIds.push(feature.properties.SA1_CODE21);
        }
      }
    });
    return intersectingIds;
  }, [sa1Data]);

  // Function to create catchment
  const handleCreateCatchment = useCallback(async () => {
    if (!markerPosition) {
      alert('Please place a marker on the map first.');
      return;
    }

    // Clear previous selections/results
    setCatchmentCircle(null);
    setDriveTimePolygon(null);
    setSelectedSa1Ids([]);
    setHoverInfo(null);

    if (catchmentMode === 'radius') {
        const center = [markerPosition.longitude, markerPosition.latitude];
        const radius = catchmentRadius;
        const options = {steps: 64, units: 'kilometers' as const};
        const circle = turf.circle(center, radius, options) as Feature<Polygon>; // Create circle
        setCatchmentCircle(circle); // Set the circle state for rendering

        const intersectingSa1Ids = calculateIntersectingSa1s(circle); // Use the intersection function
        setSelectedSa1Ids(intersectingSa1Ids);
        console.log(`Created radius catchment (${radius}km). Found ${intersectingSa1Ids.length} intersecting SA1 areas.`);

    } else { // Drive time mode
        console.log(`Fetching drive time isochrone for ${driveTime} minutes around:`, markerPosition);
        setIsLoadingIsochrone(true);
        const lon = markerPosition.longitude;
        const lat = markerPosition.latitude;
        const profile = 'driving'; // Can be driving, walking, cycling
        const minutes = driveTime;
        const url = `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${lon},${lat}?contours_minutes=${minutes}&polygons=true&access_token=${MAPBOX_TOKEN}`;

        try {
          const response = await fetch(url);
          if (!response.ok) {
             const errorData = await response.json();
             throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.message || 'Unknown error'}`);
          }
          const data: FeatureCollection<Polygon> = await response.json();
          if (data.features && data.features.length > 0) {
             const isochronePolygon = data.features[0] as Feature<Polygon>; // Explicitly type
             setDriveTimePolygon(isochronePolygon); // Store the polygon for rendering
            
             const intersectingSa1Ids = calculateIntersectingSa1s(isochronePolygon); // Use the intersection function
             setSelectedSa1Ids(intersectingSa1Ids);
             console.log(`Drive time catchment (${minutes} min). Found ${intersectingSa1Ids.length} intersecting SA1 areas.`);

          } else {
            console.warn("No drive time polygon returned from API.");
            alert("Could not retrieve drive time data for this location.");
          }
        } catch (error) {
            console.error("Error fetching or processing isochrone data:", error);
            alert(`Failed to fetch or process drive time data: ${error}`);
        } finally {
            setIsLoadingIsochrone(false);
        }
    }
  }, [markerPosition, catchmentRadius, driveTime, catchmentMode, calculateIntersectingSa1s]);

  return (
    <div style={{ height: '90vh', width: '95vw', position: 'absolute' }}>
      {/* Wrap conditional rendering with AnimatePresence */}
      <AnimatePresence>
        {selectedSa1Ids.length > 0 && markerPosition && sa2Data && (
            <FavourabilityPanel 
              key="favourability-panel"
              selectedSa1Ids={selectedSa1Ids} 
              markerPosition={markerPosition} 
              sa2Data={sa2Data} 
            />
        )}
      </AnimatePresence>
      
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: 151.210,
          latitude: -33.865,
          zoom: 12
        }}
        style={{width: '100%', height: '100%'}}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        interactiveLayerIds={['sa2-fill', 'childcare-data']}
        onMouseMove={onHover}
        onMouseLeave={onMouseLeave}
        onClick={handleMapClick}
        cursor={isLoadingIsochrone ? 'wait' : 'pointer'} // Change cursor while loading
      >
        {/* Render catchment layers first (bottom) */} 
        {catchmentCircle && catchmentMode === 'radius' && (
          <Source id="catchment-source" type="geojson" data={catchmentCircle}>
            <Layer {...catchmentLayerStyle} />
          </Source>
        )}
        {driveTimePolygon && catchmentMode === 'driveTime' && (
          <Source id="drive-time-source" type="geojson" data={driveTimePolygon}>
            <Layer {...driveTimeLayerStyle} />
          </Source>
        )}

        {/* Render SA1 Layer (conditionally) */} 
        {sa1Data && showSa1 && (
          <Source id="sa1-source" type="geojson" data={sa1Data}>
            {/* Highlighted SA1 fill layer */} 
            <Layer {...highlightedSa1LayerStyle} filter={['in', 'SA1_CODE21', ...selectedSa1Ids]} /> 
            {/* SA1 outline layer */} 
            <Layer {...sa1LayerStyle} />
          </Source>
        )}

        {/* Render SA2 Layers (conditionally) */} 
        {sa2Data && showSa2 && (
          <Source id="sa2-source" type="geojson" data={sa2Data}>
            {/* Fill layer for interaction */} 
            <Layer {...sa2FillStyle} />
            {/* Visible line layer */} 
            <Layer {...layerStyle} />
          </Source>
        )}

        {/* Render Childcare Layer (conditionally) */} 
        {childcareData && showChildcare && (
          <Source id="childcare-source" type="geojson" data={childcareData}>
            <Layer {...childcareLayerStyle} />
          </Source>
        )}
  
        {/* Render the dropped marker */} 
        {markerPosition && (
          <Marker 
            longitude={markerPosition.longitude} 
            latitude={markerPosition.latitude} 
            anchor="bottom" 
            color="red"
            offset={[0, 0]}
          />
        )}
        
         {/* Render Popup for hover */} 
        {hoverInfo && (
          <Popup
            longitude={hoverInfo.longitude}
            latitude={hoverInfo.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={15} >
            {hoverInfo.name}
          </Popup>
        )}
      </Map>
      {/* Render Control Panel */} 
      <ControlPanel 
        radius={catchmentRadius} 
        setRadius={setCatchmentRadius} 
        driveTime={driveTime}
        setDriveTime={setDriveTime}
        mode={catchmentMode}
        setMode={(newMode) => {
             setCatchmentMode(newMode);
             // Clear the non-active catchment type when switching modes
             if (newMode === 'radius') setDriveTimePolygon(null);
             if (newMode === 'driveTime') setCatchmentCircle(null);
             setSelectedSa1Ids([]);
         }} 
        onCreateCatchment={handleCreateCatchment} 
      />

      {/* Optional: Loading indicator */} 
      {isLoadingIsochrone && (
          <div style={loadingOverlayStyle}>Loading Drive Time...</div>
      )}
    </div>
  );
}

// Simple loading overlay style
const loadingOverlayStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '10px 20px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: 'white',
    borderRadius: '5px',
    zIndex: 2
};

export default App;
