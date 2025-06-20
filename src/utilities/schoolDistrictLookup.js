// src/utilities/schoolDistrictLookup.js

/**
 * Fetches the school district name for a given latitude and longitude.
 * @param {number} lat - Latitude of the user's address.
 * @param {number} lon - Longitude of the user's address.
 * @returns {Promise<{districtName: string} | null>} An object with districtName or null on error.
 */
export async function getSchoolDistrict(lat, lon) {
  const url = `https://services1.arcgis.com/0MSEUqKaxRlEPjAJ/arcgis/rest/services/School_District_Boundaries_Current/FeatureServer/0/query?where=1%3D1&geometry=${lon}%2C${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=NAME&returnGeometry=false&f=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch school district data");

    const result = await response.json();
    const districtName = result?.features?.[0]?.attributes?.NAME;

    return { districtName: districtName || "Unknown District" };
  } catch (err) {
    console.error("Error fetching school district info:", err);
    return null;
  }
}
