import { useState, useEffect } from "react";

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY; // Stored securely in environment variables
const GOOGLE_CIVIC_API_KEY = "AIzaSyD-jR0TAlvrFHJv8fC3_01lS5F6m2FCuWw"; // Updated hardcoded key — remove before publishing

function App() {
  const [fullAddress, setFullAddress] = useState("");
  const [groupedCivicData, setGroupedCivicData] = useState({});

  const fetchCivicData = async (address) => {
    if (typeof window === "undefined") return;

    try {
      const civicResponse = await fetch(
        `https://www.googleapis.com/civicinfo/v2/representatives?key=${GOOGLE_CIVIC_API_KEY}&address=${encodeURIComponent(address)}&alt=json`
      );
      const civicJson = await civicResponse.json();
      console.log("Google Civic API response:", civicJson);

      if (civicJson.error) {
        console.error("Civic API error:", civicJson.error);
        return;
      }

      const grouped = {};
      if (civicJson.offices && civicJson.officials) {
        civicJson.offices.forEach((office) => {
          const level = office.levels ? office.levels[0] : "other";
          const officials = office.officialIndices.map((i) => civicJson.officials[i]);
          if (!grouped[level]) grouped[level] = [];
          grouped[level].push({ name: office.name, officials });
        });
      } else {
        console.warn("Civic API returned no offices or officials.");
      }

      setGroupedCivicData(grouped);
    } catch (err) {
      console.error("Error fetching Civic API data:", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fullAddress) {
      fetchCivicData(fullAddress);
    }
  };

  return (
    <div>
      <h1>Gov Guide</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your full address"
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
        />
        <button type="submit">Lookup Officials</button>
      </form>

      <div>
        {Object.entries(groupedCivicData).map(([level, offices]) => (
          <div key={level}>
            <h2>{level.toUpperCase()}</h2>
            {offices.map((office, index) => (
              <div key={index}>
                <h3>{office.name}</h3>
                <ul>
                  {office.officials.map((official, i) => (
                    <li key={i}>
                      {official.name} – {official.party || "No party listed"}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;


