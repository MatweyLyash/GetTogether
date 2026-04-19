import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { FaMapMarkerAlt, FaExpand, FaCompress } from 'react-icons/fa';
import { Event } from '../../types/event';
import { ResizeHandler } from './ResizeHandler';
import styles from './Map.module.scss';

const DEFAULT_ZOOM = 14;

const eventDotIcon = L.divIcon({
  className: styles.eventMarker,
  html: '<div class="' + styles.eventDot + '"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8],
});

interface EventMapProps {
  event: Event;
}

export function EventMap({ event }: EventMapProps) {
  const lat = event.latitude != null ? Number(event.latitude) : null;
  const lng = event.longitude != null ? Number(event.longitude) : null;

  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
    return null;
  }

  return (
    <div className={`${styles.eventMapWrapper} ${isFullscreen ? styles.fullscreen : ''}`}>
      <div className={styles.eventMapHeader}>
        <span><FaMapMarkerAlt className={styles.headerIcon} /> Место на карте</span>
        <button
          className={styles.iconBtn}
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Свернуть' : 'На весь экран'}
        >
          {isFullscreen ? <FaCompress /> : <FaExpand />}
        </button>
      </div>
      <MapContainer
        center={[lat, lng]}
        zoom={DEFAULT_ZOOM}
        className={styles.eventMapContainer}
        zoomControl={true}
        scrollWheelZoom={true}
        attributionControl={false}
      >
        <TileLayer
          attribution=''
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        />
        <ResizeHandler isFullscreen={isFullscreen} center={[lat, lng]} zoom={DEFAULT_ZOOM} />
        <Marker position={[lat, lng]} icon={eventDotIcon}>
          <Popup className={styles.customPopup} maxWidth={240}>
            <div className={styles.popupCard}>
              <div className={styles.popupTitle}>{event.title}</div>
              <div className={styles.popupMeta}>
                <div className={styles.popupRow}>
                  <FaMapMarkerAlt className={styles.popupIcon} /> {event.location}
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
