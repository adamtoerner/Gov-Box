import { useState, useEffect } from "react";

const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const GOOGLE_CIVIC_API_KEY = "AIzaSyD-jR0TAlvrFHJv8fC3_01lS5F6m2FCuWw";

function App() {
  const [fullAddress, setFullAddress] = useState("");
  const [groupedCivicData, setGroupedCivicData] = useState({});

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!fullAddress) return;

    const fetchCivicData = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/civicinfo/v2/representatives?key=${GOOGLE_CIVIC_API_KEY}&address=${encodeURIComponent(fullAddress)}&alt=json`
        );
        const data = await response.json();
        console.log("Google Civic API response:", data);

        if (data.error) {
          console.error("Civic API error:", data.error);
          return;
        }

        const grouped = {};
        if (data.offices && data.officials) {
          data.offices.forEach((office) => {
            const level = office.levels ? office.levels[0] : "other";
            const officials = office.officialIndices.map((i) => data.officials[i]);
            if (!grouped[level]) grouped[level] = [];
            grouped[level].push({ name: office.name, officials });
          });
        } else {
          console.warn("Civic API returned no offices or officials.");
        }

        setGroupedCivicData(grouped);
      } catch (err) {
        console.error("Error fetching civic data:", err);
      }
    };

    fetchCivicData();
  }, [fullAddress]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fullAddress) {
      setGroupedCivicData({});
      setFullAddress(fullAddress);
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