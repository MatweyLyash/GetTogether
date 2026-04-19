import { useCallback, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { FaMapMarkerAlt, FaExpand, FaCompress } from 'react-icons/fa';
import { ResizeHandler } from './ResizeHandler';
import styles from './Map.module.scss';

const DEFAULT_CENTER: [number, number] = [53.9, 27.5667];
const DEFAULT_ZOOM = 12;

const locationIcon = L.divIcon({
  className: styles.locationMarker,
  html: '<div class="' + styles.locationDot + '"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

interface ClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

function ClickHandler({ onMapClick }: ClickHandlerProps) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface LocationPickerProps {
  latitude: string;
  longitude: string;
  onChange: (lat: string, lng: string) => void;
}

export function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  const hasCoords = latitude !== '' && longitude !== '' && !isNaN(Number(latitude)) && !isNaN(Number(longitude));

  const center: [number, number] = hasCoords
    ? [Number(latitude), Number(longitude)]
    : DEFAULT_CENTER;

  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      onChange(lat.toFixed(6), lng.toFixed(6));
    },
    [onChange]
  );

  const handleMarkerDrag = useCallback(
    (e: L.DragEndEvent) => {
      const { lat, lng } = e.target.getLatLng();
      onChange(lat.toFixed(6), lng.toFixed(6));
    },
    [onChange]
  );

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  return (
    <div className={`${styles.locationPickerWrapper} ${isFullscreen ? styles.fullscreen : ''}`}>
      <div className={styles.locationPickerHeader}>
        <span><FaMapMarkerAlt className={styles.headerIcon} /> Нажмите на карту, чтобы указать место</span>
        <div className={styles.locationPickerHeaderRight}>
          {hasCoords && (
            <span className={styles.locationPickerCoords}>
              {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
            </span>
          )}
          <button
            className={styles.iconBtn}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Свернуть' : 'На весь экран'}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
        </div>
      </div>
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className={styles.locationPickerMap}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          attribution=''
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        />
        <ResizeHandler isFullscreen={isFullscreen} center={hasCoords ? [Number(latitude), Number(longitude)] : undefined} zoom={DEFAULT_ZOOM} />
        <ClickHandler onMapClick={handleMapClick} />
        {hasCoords && (
          <Marker
            position={[Number(latitude), Number(longitude)]}
            icon={locationIcon}
            draggable={true}
            eventHandlers={{ dragend: handleMarkerDrag }}
          />
        )}
      </MapContainer>
    </div>
  );
}
