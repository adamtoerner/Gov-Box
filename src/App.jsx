import { useState } from "react";

function App() {
  const [address, setAddress] = useState("");
  const [groupedOfficials, setGroupedOfficials] = useState({});

  const handleLookup = async (e) => {
    e.preventDefault();

    // Simulate division filtering based on address input
    let divisionMatch = "place:chicago";
    if (address.toLowerCase().includes("illinois")) divisionMatch = "state:il";
    if (address.toLowerCase().includes("united states")) divisionMatch = "country:us";

    const res = await fetch("/data/officials.json");
    const data = await res.json();
    const relevant = data.filter(o => o.division_id.includes(divisionMatch));

    const grouped = {};
    for (const official of relevant) {
      if (!grouped[official.level]) grouped[official.level] = [];
      grouped[official.level].push(official);
    }

    setGroupedOfficials(grouped);
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "sans-serif" }}>
      <h1>Gov Guide</h1>
      <form onSubmit={handleLookup}>
        <input
          type="text"
          placeholder="Enter your address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ width: "300px", marginRight: "8px" }}
        />
        <button type="submit">Lookup</button>
      </form>

      <div style={{ marginTop: "2rem" }}>
        {Object.entries(groupedOfficials).map(([level, officials]) => (
          <div key={level}>
            <h2>{level.toUpperCase()}</h2>
            {officials.map((o, i) => (
              <p key={i}>
                <strong>{o.office}</strong>: {o.incumbent} ({o.party})
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
