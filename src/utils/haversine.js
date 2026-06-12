export function hitungJarakMeter(lat1, lng1, lat2, lng2) {
  const R = 6371000;

  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatJarak(meter) {
  if (!meter && meter !== 0) return "-";
  if (meter < 1000) return `${meter} meter`;
  return `${(meter / 1000).toFixed(2)} km`;
}