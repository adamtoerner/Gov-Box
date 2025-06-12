import { useState, useEffect } from "react";

const GEOAPIFY_API_KEY = "0dfe17cf57894182abea3017d2fd6aad";

const officialsData = {
  Ward: {
    name: "Ward 2",
    offices: [
      { title: "Alderperson", elected: true },
      { title: "Democratic Committeeperson", elected: true },
      { title: "Republican Committeeperson", elected: true }
    ]
  },
  City: {
    name: "City of Chicago",
    offices: [
      { title: "Mayor", elected: true },
      { title: "City Clerk", elected: true },
      { title: "City Treasurer", elected: true },
      {
        title: "Board of Education",
        elected: true,
        notes: "Partially elected starting 2025",
        suboffices: [
          { title: "Board President", elected: true },
          { title: "District 6a Member", elected: true }
        ]
      }
    ]
  },
  County: {
    name: "Cook County",
    offices: [
      { title: "President, Board of Commissioners", elected: true },
      { title: "County Commissioner (District 10)", elected: true },
      { title: "Board of Review Commissioner", elected: true },
      { title: "County Assessor", elected: true },
      { title: "County Clerk", elected: true },
      { title: "Clerk of the Circuit Court", elected: true },
      { title: "Sheriff", elected: true },
      { title: "Treasurer", elected: true },
      { title: "State’s Attorney", elected: true },
      { title: "Board of Election Commissioners", elected: false, appointedBy: "Judges" },
      { title: "Chief Judge of the Circuit Court", elected: false, appointedBy: "Judges" },
      { title: "Public Administrator", elected: false, appointedBy: "Governor" }
    ]
  },
  State: {
    name: "State of Illinois",
    offices: [
      { title: "State Senator", elected: true },
      { title: "State Representative", elected: true },
      { title: "Governor", elected: true },
      { title: "Lieutenant Governor", elected: true },
      { title: "Secretary of State", elected: true },
      { title: "Comptroller", elected: true },
      { title: "State Treasurer", elected: true },
      { title: "Attorney General", elected: true }
    ]
  },
  Federal: {
    name: "United States Government",
    offices: [
      { title: "President", elected: true },
      { title: "Vice President", elected: true },
      { title: "U.S. Senator (1)", elected: true },
      { title: "U.S. Senator (2)", elected: true },
      { title: "U.S. Representative", elected: true }
    ]
  }
};

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

export default function CivicsOrgChart() {
  const [address, setAddress] = useState("");
  const [savedLocation, setSavedLocation] = useState("");
  const [geoResult, setGeoResult] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("savedAddress");
    if (stored) setSavedLocation(stored);
  }, []);

  const handleSave = async () => {
    localStorage.setItem("savedAddress", address);
    setSavedLocation(address);

    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
        address
      )}&apiKey=${GEOAPIFY_API_KEY}`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const result = data.features[0];
      setGeoResult(result);
      console.log("Geocoded Location:", result);
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

      {Object.entries(officialsData).map(([level, data]) => (
        <OrgChartSection key={level} level={level} data={data} />
      ))}
    </div>
  );
}
