// src/utilities/schoolDistrictLookup.js

/**
 * Retrieves the school district name based on latitude and longitude coordinates.
 * This function fetches district data from a public API (replace with real NCES endpoint when available).
 *
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
    const features = result.features || [];

    return {
      districtName: features.length > 0 ? features[0].attributes.NAME : "Unknown District",
    };
  } catch (err) {
    console.error("Error fetching school district info:", err);
    return null;
  }
}

