import { useState, useEffect } from "react";

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY; // Stored securely in environment variables
const GOOGLE_CIVIC_API_KEY = import.meta.env.VITE_GOOGLE_CIVIC_API_KEY; // Stored securely in environment variables

function CivicGroup({ level, offices }) {
  const [open, setOpen] = useState(false);
  const levelLabels = {
    locality: "City of Chicago",
    administrativeArea2: "Cook County",
    administrativeArea1: "State of Illinois",
    country: "United States",
    other: "Other"
  };
  return (
    <div className="border p-3 rounded-xl mb-2">
      <h2 className="text-lg font-semibold cursor-pointer" onClick={() => setOpen(!open)}>
        {levelLabels[level] || level} {open ? "▲" : "▼"}
      </h2>
      {open && (
        <ul className="ml-4 mt-2 list-disc">
          {offices.map((office, idx) => (
            <li key={idx}>
              {office.name}
              {office.officials.map((off, i) => (
                <div key={i} className="ml-4 text-sm text-gray-800">
                  - {off.name} ({off.party || "Party N/A"})<br />
                  {off.photoUrl && (
                    <img src={off.photoUrl} alt={off.name} className="w-16 h-16 rounded-full mt-1" />
                  )}
                  {off.phones && <div>📞 {off.phones[0]}</div>}
                  {off.emails && <div>✉️ {off.emails[0]}</div>}
                  {off.urls && <div>🌐 <a href={off.urls[0]} target="_blank" rel="noreferrer" className="text-blue-600 underline">Website</a></div>}
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
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [savedLocation, setSavedLocation] = useState("");
  const [geoResult, setGeoResult] = useState(null);
  const [groupedCivicData, setGroupedCivicData] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("savedAddress");
    if (stored) {
      setSavedLocation(stored);
      const [storedStreet, storedCity, storedZip] = stored.split(",").map(s => s.trim());
      setStreet(storedStreet || "");
      setCity(storedCity || "");
      setZip(storedZip || "");

      // Automatically trigger lookup if a saved address exists
      setTimeout(() => {
        document.querySelector("button").click();
      }, 100);
    }
  }, []);

  const handleSave = async () => {
    const fullAddress = `${street}, ${city}, ${zip}`;
    localStorage.setItem("savedAddress", fullAddress);
    setSavedLocation(fullAddress);

    const geoResponse = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        fullAddress
      )}&apiKey=${GEOAPIFY_API_KEY}`
    );
    const geoData = await geoResponse.json();
    if (geoData.features && geoData.features.length > 0) {
      const result = geoData.features[0];
      setGeoResult(result);

      const civicResponse = await fetch(
        `https://www.googleapis.com/civicinfo/v2/representatives?key=${GOOGLE_CIVIC_API_KEY}&address
      );
      const civicJson = await civicResponse.json();
console.log("Google Civic API response:", civicJson);
if (civicJson.error) {
  console.error("Civic API error:", civicJson.error);
  return;
}

      const grouped = {};
      if (civicJson.offices && civicJson.officials) {
  if (civicJson.offices.length === 0 || civicJson.officials.length === 0) {
    console.warn("Civic API returned no offices or officials.");
  }
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

      <div className="mb-6 space-y-2">
        <input
          type="text"
          className="border p-2 w-full rounded"
          placeholder="Street Address (e.g. 123 Main St)"
          value={street}
          onChange={(e) => setStreet(e.target.value)}
        />
        <input
          type="text"
          className="border p-2 w-full rounded"
          placeholder="City (e.g. Chicago)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <input
          type="text"
          className="border p-2 w-full rounded"
          placeholder="ZIP Code (e.g. 60614)"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
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
    </div>
  );
}
