import { useState } from "react";
import AddressForm from "./components/AddressForm";
import OfficialsDisplay from "./components/OfficialsDisplay";

function App() {
  const [address, setAddress] = useState("");
  const [groupedOfficials, setGroupedOfficials] = useState({});

  const handleAddressSubmit = async (fullAddress) => {
    setAddress(fullAddress);

    // TODO: Replace with CTCL data fetch and transform
    try {
      const res = await fetch("/placeholder-officials.json");
      const data = await res.json();

      const grouped = {};
      data.forEach((entry) => {
        const level = entry.level || "other";
        if (!grouped[level]) grouped[level] = [];
        grouped[level].push(entry);
      });

      setGroupedOfficials(grouped);
    } catch (err) {
      console.error("Failed to load placeholder data", err);
    }
  };

  return (
    <div style={{ padding: "1rem", fontFamily: "Arial" }}>
      <h1>Gov Guide</h1>
      <AddressForm onSubmit={handleAddressSubmit} />
      <OfficialsDisplay data={groupedOfficials} />
    </div>
  );
}

export default App;

