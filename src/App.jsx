import React, { useState, useEffect } from "react";
import BudgetBreakdown from "./components/BudgetBreakdown";

function App() {
  const [address, setAddress] = useState("");
  const [officials, setOfficials] = useState([]);

  useEffect(() => {
    if (!address) return;

    const fetchOfficials = async () => {
      try {
        const response = await fetch("/officials.json"); // Using static placeholder for now
        const data = await response.json();
        const filteredOfficials = data.filter((official) =>
          official.jurisdiction.toLowerCase().includes("chicago")
        );
        setOfficials(filteredOfficials);
      } catch (error) {
        console.error("Error fetching officials:", error);
      }
    };

    fetchOfficials();
  }, [address]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address.trim()) {
      setOfficials([]);
      setAddress(address);
    }
  };

  return (
    <div>
      <h1>Gov Guide</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your full address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button type="submit">Lookup Officials</button>
      </form>

      {officials.length > 0 && (
        <div>
          <h2>Your Officials</h2>
          {officials.map((official, i) => (
            <div key={i}>
              <h3>{official.office}</h3>
              <p>
                {official.name} – {official.party || "No party listed"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Always show budget insights for now */}
      <BudgetBreakdown />
    </div>
  );
}

export default App;
