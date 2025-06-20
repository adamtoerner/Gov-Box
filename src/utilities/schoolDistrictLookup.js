export async function getSchoolDistrict(lat, lon) {
  const geometry = encodeURIComponent(JSON.stringify({ x: lon, y: lat }));
  const url = `https://services1.arcgis.com/0MSEUqKaxRlEPjAJ/arcgis/rest/services/School_District_Boundaries_Current/FeatureServer/0/query?f=json&geometry=${geometry}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=NAME&returnGeometry=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch school district data");
    const result = await response.json();

    return {
      districtName: result?.features?.[0]?.attributes?.NAME || "Unknown District",
    };
  } catch (err) {
    console.error("Error fetching school district info:", err);
    return null;
  }
}
