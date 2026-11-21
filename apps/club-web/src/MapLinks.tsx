/** Opens the address in Google Maps or Apple Maps. Both are web links that open the maps app when installed. */
export function mapLinks(address: string) {
  const query = encodeURIComponent(address);
  return {
    google: `https://www.google.com/maps/search/?api=1&query=${query}`,
    apple: `https://maps.apple.com/?q=${query}`,
  };
}

export function MapLinks({ address }: { address: string }) {
  const links = mapLinks(address);
  return (
    <p className="map-links">
      <a href={links.google} target="_blank" rel="noopener">Open in Google Maps →</a>
      {" · "}
      <a href={links.apple} target="_blank" rel="noopener">Open in Apple Maps →</a>
    </p>
  );
}
