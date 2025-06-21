export async function getSchoolDistrict(latitude, longitude) {
  if (!latitude || !longitude) {
    console.error("Latitude and longitude must be provided.");
    return null;
  }

  const url = `https://services1.arcgis.com/0MSEUqKaxRlEPjAJ/arcgis/rest/services/School_District_Boundaries_Current/FeatureServer/0/query?where=1%3D1&geometry=${longitude}%2C${latitude}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=NAME&returnGeometry=false&f=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch school district data");
    const result = await response.json();
    const name = result?.features?.[0]?.attributes?.NAME;

    return {
      districtName: name || "Unknown District",
    };
  } catch (err) {
    console.error("Error fetching school district info:", err);
    return null;
  }
}
