import { useState } from "react";

function App() {
  const [fullAddress, setFullAddress] = useState("");
  const [groupedCivicData, setGroupedCivicData] = useState({});

  const getDivisionHierarchy = () => {
    // Hardcoded division hierarchy for Chicago
    return [
      "ocd-division/country:us",
      "ocd-division/country:us/state:il",
      "ocd-division/country:us/state:il/county:cook",
      "ocd-division/country:us/state:il/place:chicago"
    ];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullAddress) return;

    try {
      const res = await fetch("/officials.json");
      const data = await res.json();

      const divisionIds = getDivisionHierarchy();
      const relevant = data.filter((entry) =>
        divisionIds.includes(entry.divisionId)
      );

      const grouped = {};
      relevant.forEach((entry) => {
        if (!grouped[entry.level]) grouped[entry.level] = [];
        grouped[entry.level].push(entry);
      });

      setGroupedCivicData(grouped);
    } catch (err) {
      console.error("Failed to fetch or parse officials.json", err);
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Gov Guide</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Enter your address"
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
          style={{ width: "300px", padding: "0.5rem" }}
        />
        <button type="submit" style={{ marginLeft: "1rem", padding: "0.5rem" }}>
          Lookup Officials
        </button>
      </form>

      {Object.keys(groupedCivicData).length === 0 && (
        <p>Enter an address to see your government officials.</p>
      )}

      {Object.entries(groupedCivicData).map(([level, offices]) => (
        <div key={level} style={{ marginBottom: "2rem" }}>
          <h2>{level.toUpperCase()}</h2>
          {offices.map((entry, index) => (
            <div key={index} style={{ padding: "0.25rem 0" }}>
              <strong>{entry.office}:</strong> {entry.official}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default App;

