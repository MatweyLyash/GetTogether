import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

interface ResizeHandlerProps {
  isFullscreen: boolean;
  center?: [number, number];
  zoom?: number;
}

export function ResizeHandler({ isFullscreen, center, zoom }: ResizeHandlerProps) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
      if (center) {
        map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.5 });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isFullscreen, map, center, zoom]);

  return null;
}
