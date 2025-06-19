// App.jsx
import { useState, useEffect } from "react";
import BudgetBreakdown from "./components/BudgetBreakdown.jsx";

function App() {
  const [fullAddress, setFullAddress] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");
  const [groupedCivicData, setGroupedCivicData] = useState({});

  useEffect(() => {
    if (!submittedAddress) return;

    const fetchOfficials = async () => {
      try {
        const response = await fetch("/data/officials.json");
        const data = await response.json();

        const jurisdiction = submittedAddress.toLowerCase().includes("chicago")
          ? "chicago"
          : "federal";

        const filtered = data.filter(
          (item) => item.jurisdiction.toLowerCase() === jurisdiction
        );

        const grouped = {};
        filtered.forEach((item) => {
          if (!grouped[item.level]) grouped[item.level] = [];
          grouped[item.level].push(item);
        });

        setGroupedCivicData(grouped);
      } catch (err) {
        console.error("Error fetching officials:", err);
      }
    };

    fetchOfficials();
  }, [submittedAddress]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fullAddress) {
      setGroupedCivicData({});
      setSubmittedAddress(fullAddress);
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
        {Object.entries(groupedCivicData).map(([level, officials]) => (
          <div key={level}>
            <h2>{level.toUpperCase()}</h2>
            <ul>
              {officials.map((official, index) => (
                <li key={index}>
                  <strong>{official.title}</strong>: {official.name} ({official.party})
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <BudgetBreakdown />
    </div>
  );
}

export default App;
