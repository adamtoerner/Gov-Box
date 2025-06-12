import { useState, useEffect } from "react";

const GEOAPIFY_API_KEY = process.env.REACT_APP_GEOAPIFY_API_KEY; // Stored securely in environment variables
const GOOGLE_CIVIC_API_KEY = process.env.REACT_APP_GOOGLE_CIVIC_API_KEY; // Stored securely in environment variables

const officialsData = {
  "City of Chicago": {
    name: "City of Chicago",
    offices: [
      { title: "Mayor of Chicago" },
      { title: "City Clerk" },
      { title: "City Treasurer" },
      {
        title: "Chicago Board of Education",
        suboffices: [
          { title: "President" },
          { title: "Board Member (District 6a)" }
        ]
      }
    ]
  },
  "Cook County": {
    name: "Cook County",
    offices: [
      { title: "President, Cook County Board of Commissioners" },
      { title: "Cook County Commissioner District 10" },
      { title: "Cook County Assessor" },
      { title: "Cook County Clerk" },
      { title: "Clerk of the Circuit Court" },
      { title: "Cook County Sheriff" },
      { title: "Cook County Treasurer" },
      { title: "Cook County State's Attorney" }
    ]
  },
  "State of Illinois": {
    name: "State of Illinois",
    offices: [
      { title: "Governor of Illinois" },
      { title: "Lieutenant Governor of Illinois" },
      { title: "Illinois Secretary of State" },
      { title: "Illinois Attorney General" },
      { title: "Illinois State Treasurer" },
      { title: "Illinois Comptroller" },
      { title: "Illinois State Senator" },
      { title: "Illinois State Representative" }
    ]
  },
  "United States": {
    name: "United States",
    offices: [
      { title: "President of the United States" },
      { title: "Vice President of the United States" },
      { title: "United States Senator" },
      { title: "United States Representative" }
    ]
  }
};

function OrgChartSection({ level, data, officeMap }) {
  const [open, setOpen] = useState(false);

  const normalizeTitle = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, "");

const findOfficials = (title) => {
  const normTitle = normalizeTitle(title);
  const matches = Object.entries(officeMap).filter(([officeName]) =>
    normalizeTitle(officeName).includes(normTitle)
  );

  if (matches.length === 0) {
    console.warn(`No official found for title: ${title}`);
  }

  return matches.flatMap(([, officials]) => officials);
};

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
              {findOfficials(office.title).map((off, i) => (
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
              {office.suboffices && (
                <ul className="ml-6 list-circle">
                  {office.suboffices.map((sub, subIndex) => (
                    <li key={subIndex}>{sub.title}</li>
                  ))}
                </ul>
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
                  - {off.name} ({off.party || "Party N/A"})
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
  const [civicData, setCivicData] = useState(null);
  const [groupedCivicData, setGroupedCivicData] = useState({});
  const [officeMap, setOfficeMap] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("savedAddress");
    if (stored) setSavedLocation(stored);
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
      console.log("Geocoded Location:", result);

      const civicResponse = await fetch(
        `https://civicinfo.googleapis.com/civicinfo/v2/representatives?key=${GOOGLE_CIVIC_API_KEY}&address=${encodeURIComponent(fullAddress)}`
      );
      const civicJson = await civicResponse.json();
      setCivicData(civicJson);

      const grouped = {};
      const officeMap = {};
      if (civicJson.offices && civicJson.officials) {
        civicJson.offices.forEach((office) => {
          const level = office.levels ? office.levels[0] : "other";
          const officials = office.officialIndices.map((i) => civicJson.officials[i]);
          if (!grouped[level]) grouped[level] = [];
          grouped[level].push({ name: office.name, officials });

          officeMap[office.name] = officials;
        });
      }
      setGroupedCivicData(grouped);
      setOfficeMap(officeMap);
      console.log("Google Civic API response:", civicJson);
      console.log("OfficeMap keys:", Object.keys(officeMap));
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

      {Object.entries(officialsData).map(([level, data]) => (
        <OrgChartSection
          key={level}
          level={level}
          data={data}
          officeMap={officeMap}
        />
      ))}
    </div>
  );
}
