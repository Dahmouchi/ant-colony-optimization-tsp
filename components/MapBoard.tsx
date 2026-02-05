import { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { City } from "@/utils/aco";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface MapBoardProps {
  cities: City[];
  onCityAdd: (lat: number, lng: number) => void;
  onCityRemove: (id: string) => void;
  bestPath: number[];
  isRunning: boolean;
}

// Custom numbered marker icon
function createNumberedIcon(number: number, isFirst: boolean): L.DivIcon {
  const bgColor = isFirst ? "hsl(142, 71%, 45%)" : "hsl(173, 58%, 39%)";

  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <div style="
        background: ${bgColor};
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 14px;
        font-family: 'Inter', sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        border: 2px solid white;
      ">
        ${number}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export function MapBoard({
  cities,
  onCityAdd,
  onCityRemove,
  bestPath,
  isRunning,
}: MapBoardProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylineRef = useRef<L.Polyline | null>(null);

  // Morocco center coordinates
  const moroccoCenter: L.LatLngTuple = [31.7917, -7.0926];

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current).setView(moroccoCenter, 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Click handler for adding cities
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (!isRunning) {
        onCityAdd(e.latlng.lat, e.latlng.lng);
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // Only run once on mount

  // Update click handler when isRunning changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old handler and add new one
    map.off("click");
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (!isRunning) {
        onCityAdd(e.latlng.lat, e.latlng.lng);
      }
    });
  }, [isRunning, onCityAdd]);

  // Update markers when cities change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentMarkerIds = new Set(cities.map((c) => c.id));

    // Remove markers for deleted cities
    markersRef.current.forEach((marker, id) => {
      if (!currentMarkerIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers for current cities
    cities.forEach((city, index) => {
      let marker = markersRef.current.get(city.id);

      if (!marker) {
        // Create new marker
        marker = L.marker([city.lat, city.lng], {
          icon: createNumberedIcon(index + 1, index === 0),
        }).addTo(map);

        markersRef.current.set(city.id, marker);
      } else {
        // Update existing marker position and icon
        marker.setLatLng([city.lat, city.lng]);
        marker.setIcon(createNumberedIcon(index + 1, index === 0));
      }

      // Update popup
      marker.bindPopup(`
        <div style="text-align: center; font-family: 'Inter', sans-serif;">
          <p style="font-weight: 600; margin: 0 0 4px 0;">${city.name}</p>
          <p style="color: #666; font-size: 12px; margin: 0 0 8px 0;">
            ${city.lat.toFixed(4)}, ${city.lng.toFixed(4)}
          </p>
          ${
            !isRunning
              ? `<button 
                  onclick="window.dispatchEvent(new CustomEvent('removeCity', { detail: '${city.id}' }))"
                  style="color: #dc2626; font-size: 12px; background: none; border: none; cursor: pointer; text-decoration: underline;">
                  Remove city
                </button>`
              : ""
          }
        </div>
      `);
    });

    // Fit bounds if we have multiple cities
    if (cities.length >= 2) {
      const bounds = L.latLngBounds(cities.map((c) => [c.lat, c.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [cities, isRunning]);

  // Handle remove city events from popups
  useEffect(() => {
    const handler = (e: CustomEvent<string>) => {
      onCityRemove(e.detail);
    };

    window.addEventListener("removeCity" as any, handler);
    return () => window.removeEventListener("removeCity" as any, handler);
  }, [onCityRemove]);

  // Convert bestPath indices to coordinates for the polyline
  const pathCoordinates = useMemo(() => {
    if (bestPath.length < 2 || cities.length < 2) return [];

    const coords = bestPath
      .map((index) => {
        const city = cities[index];
        return city ? ([city.lat, city.lng] as L.LatLngTuple) : null;
      })
      .filter((c): c is L.LatLngTuple => c !== null);

    // Close the loop - return to start
    if (coords.length > 1) {
      coords.push(coords[0]);
    }

    return coords;
  }, [bestPath, cities]);

  // Update polyline when path changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old polyline
    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    // Add new polyline if we have coordinates
    if (pathCoordinates.length > 1) {
      polylineRef.current = L.polyline(pathCoordinates, {
        color: "hsl(173, 80%, 45%)",
        weight: 4,
        opacity: 0.9,
        dashArray: isRunning ? "10, 5" : undefined,
      }).addTo(map);
    }
  }, [pathCoordinates, isRunning]);

  return (
    <div className="map-container h-full w-full">
      <div
        ref={mapContainerRef}
        className="h-full w-full rounded-xl"
        style={{ minHeight: "500px" }}
      />
    </div>
  );
}
