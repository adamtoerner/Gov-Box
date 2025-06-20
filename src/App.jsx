// App.jsx
import { useState } from "react";
import BudgetBreakdown from "./components/BudgetBreakdown.jsx";
import OfficialsDisplay from "./components/OfficialsDisplay.jsx";

import { getSchoolDistrict } from "./utilities/schoolDistrictLookup";
// After you get `lat` and `lon` from Geoapify:
const result = await getSchoolDistrict(lat, lon);
console.log("School district:", result?.districtName);

function App() {
  const [fullAddress, setFullAddress] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");
  const [activeTab, setActiveTab] = useState("officials");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fullAddress) {
      setSubmittedAddress(fullAddress);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Gov Guide</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Enter your full address"
          value={fullAddress}
          onChange={(e) => setFullAddress(e.target.value)}
          style={{ padding: "0.5rem", width: "300px", marginRight: "1rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem" }}>Lookup</button>
      </form>

      {submittedAddress && (
        <div>
          <div style={{ marginBottom: "1rem" }}>
            <button
              onClick={() => setActiveTab("officials")}
              style={{
                padding: "0.5rem 1rem",
                marginRight: "0.5rem",
                backgroundColor: activeTab === "officials" ? "#333" : "#eee",
                color: activeTab === "officials" ? "#fff" : "#000",
                border: "none",
                borderRadius: "5px"
              }}
            >
              Public Officials
            </button>
            <button
              onClick={() => setActiveTab("budget")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: activeTab === "budget" ? "#333" : "#eee",
                color: activeTab === "budget" ? "#fff" : "#000",
                border: "none",
                borderRadius: "5px"
              }}
            >
              Public Money
            </button>
          </div>

          {activeTab === "officials" && (
            <OfficialsDisplay address={submittedAddress} />
          )}

          {activeTab === "budget" && (
            <BudgetBreakdown address={submittedAddress} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;


