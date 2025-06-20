// src/utilities/schoolDistrictLookup.js
export async function fetchSchoolDistrictByCoords(lat, lon) {
  const url = `https://services1.arcgis.com/0MSEUqKaxRlEPjAJ/arcgis/rest/services/School_District_Boundaries_Current/FeatureServer/0/query?where=1%3D1&geometry=${lon}%2C${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=NAME&returnGeometry=false&f=json`;

  try {
    const response = await fetch(url);
    const json = await response.json();
    const district = json?.features?.[0]?.attributes?.NAME || "Unknown District";

    return {
      districtName: district,
    };
  } catch (err) {
    console.error("Error fetching school district info:", err);
    return null;
  }
}
