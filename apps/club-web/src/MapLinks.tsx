// The club hall. Google's short link is the one the club gave us; Apple Maps uses the same pin's coordinates
// (taken from the resolved Google Maps place) so both apps open the same location.
const HALL = {
  name: "James Kenneally Sports Hall",
  googleUrl: "https://maps.app.goo.gl/PmYo8e33BFuLS6Mo7",
  lat: 51.9031185,
  lng: -8.50394,
};

export const mapLinks = {
  google: HALL.googleUrl,
  apple: `https://maps.apple.com/?ll=${HALL.lat},${HALL.lng}&q=${encodeURIComponent(HALL.name)}`,
};

export function MapLinks() {
  return (
    <p className="map-links">
      <a href={mapLinks.google} target="_blank" rel="noopener">Open in Google Maps →</a>
      {" · "}
      <a href={mapLinks.apple} target="_blank" rel="noopener">Open in Apple Maps →</a>
    </p>
  );
}
