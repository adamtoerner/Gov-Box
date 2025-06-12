const officialsData = {
  "Ward 2": {
    name: "Ward 2",
    offices: [
      { title: "Alderperson" },
      { title: "Committeeperson (D)" },
      { title: "Committeeperson (R)" }
    ]
  },
  "City of Chicago": {
    name: "City of Chicago",
    offices: [
      { title: "Mayor" },
      { title: "City Clerk" },
      { title: "City Treasurer" },
      {
        title: "Board of Education",
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
      { title: "President, Board of Commissioners" },
      { title: "County Commissioner (District 10)" },
      { title: "Board of Election Commissioner" },
      { title: "Board of Review Commissioner" },
      { title: "County Assessor" },
      { title: "County Clerk" },
      { title: "Clerk of the Circuit Court" },
      { title: "Chief Judge of the Circuit Court" },
      { title: "Public Administrator" },
      { title: "Sheriff" },
      { title: "Treasurer" },
      { title: "State Attorney" }
    ]
  },
  "State of Illinois": {
    name: "State of Illinois",
    offices: [
      { title: "State Senator" },
      { title: "State Representative" },
      { title: "Secretary of State" },
      { title: "Comptroller" },
      { title: "State Treasurer" },
      { title: "Attorney General" },
      { title: "Governor" }
    ]
  },
  "United States": {
    name: "United States",
    offices: [
      { title: "US Senator #1" },
      { title: "US Senator #2" },
      { title: "US Representative" },
      { title: "Vice President" },
      { title: "President" }
    ]
  }
};

function OrgChartSection({ level, data, civicOfficials }) {
  const [open, setOpen] = useState(false);

  const findOfficial = (title) => {
    if (!civicOfficials) return null;
    const matches = civicOfficials.filter((o) =>
      o.name.toLowerCase().includes(title.toLowerCase())
    );
    return matches;
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
              {findOfficial(office.title)?.map((off, i) => (
                <div key={i} className="ml-4 text-sm text-gray-800">
                  - {off.name} ({off.party || "Party N/A"})
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


import { useState, useEffect } from "react";

const GEOAPIFY_API_KEY = "0dfe17cf57894182abea3017d2fd6aad";
const GOOGLE_CIVIC_API_KEY = "AIzaSyAcacGR8f6sJ0IqOC11OsY6_7yLBKcK-mM";

// ...officialsData and other components remain unchanged...

export default function CivicsOrgChart() {
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [savedLocation, setSavedLocation] = useState("");
  const [geoResult, setGeoResult] = useState(null);
  const [civicData, setCivicData] = useState(null);
  const [groupedCivicData, setGroupedCivicData] = useState({});

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

  const civicOfficials = civicData?.officials || [];

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
          civicOfficials={civicData?.officials || []}
        />
      ))}
    </div>
  );
}
