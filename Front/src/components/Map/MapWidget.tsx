import { useMemo, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaTag, FaMoneyBill, FaUsers, FaCrosshairs, FaExpand, FaCompress } from 'react-icons/fa';
import { Event } from '../../types/event';
import { ResizeHandler } from './ResizeHandler';
import styles from './Map.module.scss';

const DEFAULT_CENTER: [number, number] = [53.9, 27.5667];
const DEFAULT_ZOOM = 6;
const CLUSTER_BREAK_ZOOM = 16;

const pulsingIcon = L.divIcon({
  className: styles.pulsingMarker,
  html: '<div class="' + styles.pulseDot + '"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function clusterIcon(cluster: any) {
  const count = cluster.getChildCount();
  const size = count >= 50 ? 56 : count >= 20 ? 48 : 40;
  const bg = count >= 50 ? '#ca8a04' : count >= 20 ? '#eab308' : '#facc15';

  return L.divIcon({
    html: `<div class="${styles.customCluster}" style="width:${size}px;height:${size}px;background:${bg};border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 10px rgba(140,91,14,0.2);"><span style="color:#422006;font-weight:800;font-size:${count >= 50 ? '15px' : '13px'};">${count}</span></div>`,
    className: '',
    iconSize: L.point(size, size),
    iconAnchor: L.point(size / 2, size / 2),
    popupAnchor: [0, -size / 2],
  });
}

function formatDate(dateStr: string) {
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function formatPrice(price: number) {
  return price === 0 ? 'Бесплатно' : `${price} BYN`;
}

interface EventPopupProps {
  event: Event;
}

function EventPopup({ event }: EventPopupProps) {
  return (
    <div className={styles.popupCard}>
      {event.image && (
        <img src={event.image} alt={event.title} className={styles.popupImage} />
      )}
      <div className={styles.popupTitle}>{event.title}</div>
      <div className={styles.popupMeta}>
        <div className={styles.popupRow}>
          <FaCalendarAlt className={styles.popupIcon} /> {formatDate(event.date)}
        </div>
        <div className={styles.popupRow}>
          <FaMapMarkerAlt className={styles.popupIcon} /> {event.location}
        </div>
        <div className={styles.popupRow}>
          <FaTag className={styles.popupIcon} /> {event.category.category_name}
        </div>
        <div className={styles.popupRow}>
          <FaMoneyBill className={styles.popupIcon} />
          <span className={styles.popupPrice}>{formatPrice(event.price)}</span>
        </div>
        <div className={styles.popupRow}>
          <FaUsers className={styles.popupIcon} /> Мест: {event.capacity}
        </div>
      </div>
      <div className={styles.popupOrganizer}>
        от {event.creator?.login || 'Организатор'}
      </div>
      <Link to={`/event/${event.id}`} className={styles.popupLink}>
        Подробнее
      </Link>
    </div>
  );
}

interface FlyToLocateProps {
  lat: number;
  lng: number;
}

function FlyToLocate({ lat, lng }: FlyToLocateProps) {
  const map = useMap();
  map.flyTo([lat, lng], 13, { duration: 1.2 });
  return null;
}

interface MapWidgetProps {
  events: Event[];
}

export function MapWidget({ events }: MapWidgetProps) {
  const eventsWithCoords = useMemo(
    () =>
      events.filter(
        (e) =>
          e.latitude != null &&
          e.longitude != null &&
          !isNaN(Number(e.latitude)) &&
          !isNaN(Number(e.longitude))
      ),
    [events]
  );

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [locateTarget, setLocateTarget] = useState<[number, number] | null>(null);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocateTarget([pos.coords.latitude, pos.coords.longitude]);
        setTimeout(() => setLocateTarget(null), 100);
      },
      () => {}
    );
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  if (eventsWithCoords.length === 0) {
    return (
      <div className={`${styles.mapWrapper} ${isFullscreen ? styles.fullscreen : ''}`}>
        <div className={styles.mapHeader}>
          <h2><FaMapMarkerAlt className={styles.headerIcon} /> Карта мероприятий</h2>
          <span className={styles.eventCount}>
            Нет мероприятий с координатами
          </span>
        </div>
        <div className={styles.emptyMap}>
          Когда организаторы добавят координаты, мероприятия появятся на карте
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.mapWrapper} ${isFullscreen ? styles.fullscreen : ''}`}>
      <div className={styles.mapHeader}>
        <h2><FaMapMarkerAlt className={styles.headerIcon} /> Карта мероприятий</h2>
        <div className={styles.mapHeaderRight}>
          <span className={styles.eventCount}>
            {eventsWithCoords.length} на карте
          </span>
          <button
            className={styles.iconBtn}
            onClick={handleLocate}
            title="Моё местоположение"
          >
            <FaCrosshairs />
          </button>
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
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className={styles.mapContainer}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer
          attribution=''
          url='https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
        />
        <ResizeHandler isFullscreen={isFullscreen} />
        {locateTarget && <FlyToLocate lat={locateTarget[0]} lng={locateTarget[1]} />}
        <MarkerClusterGroup
          iconCreateFunction={clusterIcon}
          maxClusterRadius={70}
          chunkedLoading
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
          disableClusteringAtZoom={CLUSTER_BREAK_ZOOM}
        >
          {eventsWithCoords.map((event) => (
            <Marker
              key={event.id}
              position={[Number(event.latitude!), Number(event.longitude!)]}
              icon={pulsingIcon}
            >
              <Popup className={styles.customPopup} maxWidth={280}>
                <EventPopup event={event} />
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
