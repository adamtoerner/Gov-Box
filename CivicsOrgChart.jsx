import { useState, useEffect } from "react";

const GEOAPIFY_API_KEY = "0dfe17cf57894182abea3017d2fd6aad";
const GOOGLE_CIVIC_API_KEY = "AIzaSyAcacGR8f6sJ0IqOC11OsY6_7yLBKcK-mM";

const officialsData = { /* existing hardcoded officials data remains unchanged */ };

function OrgChartSection({ level, data }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border p-3 rounded-xl mb-2">
      <h2 className="text-lg font-semibold cursor-pointer" onClick={() => setOpen(!open)}>
        {level} - {data.name} {open ? "▲" : "▼"}
      </h2>
      {open && (
        <ul className="ml-4 mt-2 list-disc">
          {data.offices.map((office, index) => (
            <li key={index}>
              {office.title}
              {office.suboffices && (
                <ul className="ml-6 list-circle">
                  {office.suboffices.map((sub, subIndex) => (
                    <li key={subIndex}>{sub.title}</li>
                  ))}
                </ul>
              )}
              {!office.elected && office.appointedBy && (
                <span className="text-sm text-gray-600"> (Appointed by {office.appointedBy})</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CivicGroup({ level, offices }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border p-3 rounded-xl mb-2">
      <h2 className="text-lg font-semibold cursor-pointer" onClick={() => setOpen(!open)}>
        {level} {open ? "▲" : "▼"}
      </h2>
      {open && (
        <ul className="ml-4 mt-2 list-disc">
          {offices.map((office, idx) => (
            <li key={idx}>
              {office.name}
              {office.officials.map((off, i) => (
                <div key={i} className="ml-4 text-sm text-gray-800">
                  - {off.name} ({off.party})
                </div>
              ))}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CivicsOrgChart() {
  const [address, setAddress] = useState("");
  const [savedLocation, setSavedLocation] = useState("");
  const [geoResult, setGeoResult] = useState(null);
  const [civicData, setCivicData] = useState(null);
  const [groupedCivicData, setGroupedCivicData] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("savedAddress");
    if (stored) setSavedLocation(stored);
  }, []);

  const handleSave = async () => {
    localStorage.setItem("savedAddress", address);
    setSavedLocation(address);

    const geoResponse = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        address
      )}&apiKey=${GEOAPIFY_API_KEY}`
    );
    const geoData = await geoResponse.json();
    if (geoData.features && geoData.features.length > 0) {
      const result = geoData.features[0];
      setGeoResult(result);
      console.log("Geocoded Location:", result);

      const civicResponse = await fetch(
        `https://civicinfo.googleapis.com/civicinfo/v2/representatives?key=${GOOGLE_CIVIC_API_KEY}&address=${encodeURIComponent(address)}`
      );
      const civicJson = await civicResponse.json();
      setCivicData(civicJson);

      const grouped = {};
      if (civicJson.offices && civicJson.officials) {
        civicJson.offices.forEach((office) => {
          const level = office.levels ? office.levels[0] : "other";
          const officials = office.officialIndices.map((i) => civicJson.officials[i]);
          if (!grouped[level]) grouped[level] = [];
          grouped[level].push({ name: office.name, officials });
        });
      }
      setGroupedCivicData(grouped);
    } else {
      console.warn("No geocoding result found");
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Your Elected Officials</h1>

      <div className="mb-6">
        <input
          type="text"
          className="border p-2 w-full rounded"
          placeholder="Enter your address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button
          onClick={handleSave}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save Location
        </button>
        {savedLocation && (
          <p className="mt-2 text-sm text-gray-700">Saved address: {savedLocation}</p>
        )}
        {geoResult && (
          <div className="mt-2 text-sm text-green-700">
            Location found: {geoResult.properties.formatted}
          </div>
        )}
      </div>

      {Object.entries(groupedCivicData).map(([level, offices]) => (
        <CivicGroup key={level} level={level} offices={offices} />
      ))}

      {Object.entries(officialsData).map(([level, data]) => (
        <OrgChartSection key={level} level={level} data={data} />
      ))}
    </div>
  );
}
