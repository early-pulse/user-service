const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// Utility to fetch coordinates from Nominatim API
import fetch from "node-fetch";

export async function getCoordinatesFromAddress(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "EarlyPulse/1.0 (early.pulse.app@gmail.com)",
    },
  });
  if (!response.ok) throw new Error("Failed to fetch coordinates");
  const data = await response.json();
  if (data.length === 0) throw new Error("No coordinates found for address");
  return [parseFloat(data[0].lon), parseFloat(data[0].lat)]; // [longitude, latitude]
}
