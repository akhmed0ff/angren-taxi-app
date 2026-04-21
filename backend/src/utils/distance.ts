export interface Coordinates {
  lat: number;
  lng: number;
}

export function calculateDistance(from: Coordinates, to: Coordinates): number {
  const earthRadiusKm = 6371;
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2
    + Math.cos((from.lat * Math.PI) / 180)
      * Math.cos((to.lat * Math.PI) / 180)
      * Math.sin(dLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return calculateDistance(
    { lat: lat1, lng: lon1 },
    { lat: lat2, lng: lon2 },
  );
}
