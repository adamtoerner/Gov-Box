// App.jsx
import { useState } from "react";
import BudgetBreakdown from "./components/BudgetBreakdown.jsx";

function App() {
  const [fullAddress, setFullAddress] = useState("");
  const [submittedAddress, setSubmittedAddress] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fullAddress) {
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
        <button type="submit">Lookup Budget</button>
      </form>

      {submittedAddress && (
        <div style={{ marginTop: "20px" }}>
          <BudgetBreakdown address={submittedAddress} />
        </div>
      )}
    </div>
  );
}

export default App;

