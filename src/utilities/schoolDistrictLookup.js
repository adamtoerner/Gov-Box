export async function getSchoolDistrict(lat, lon) {
  const url = `https://services1.arcgis.com/1vZUdTgWZxyjU1r4/arcgis/rest/services/School_District_Boundaries/FeatureServer/0/query?where=1=1&geometry=${lon},${lat}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=LEAID,NAME&returnGeometry=false&f=json`;

  try {
    const response = await fetch(url);
    const result = await response.json();
    const feature = result.features?.[0]?.attributes;

    if (feature) {
      return {
        districtName: feature.NAME,
        leaid: feature.LEAID,
      };
    } else {
      return null;
    }
  } catch (err) {
    console.error("Error fetching school district data:", err);
    return null;
  }
}
