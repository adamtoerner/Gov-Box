import { useState, useEffect } from "react";

const GOOGLE_CIVIC_API_KEY = "AIzaSyD-jR0TAlvrFHJv8fC3_01lS5F6m2FCuWw";

function App() {
  const [address, setAddress] = useState("");
  const [officials, setOfficials] = useState([]);

  useEffect(() => {
    if (!address) return;

    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://www.googleapis.com/civicinfo/v2/representatives?key=${GOOGLE_CIVIC_API_KEY}&address=${encodeURIComponent(address)}`
        );
        const data = await response.json();
        if (data.officials) {
          setOfficials(data.officials);
        } else {
          setOfficials([]);
        }
      } catch (error) {
        console.error("Error fetching officials:", error);
        setOfficials([]);
      }
    };

    fetchData();
  }, [address]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setAddress(address); // Triggers useEffect
  };

  return (
    <div>
      <h1>Gov Guide</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>
      <ul>
        {officials.map((official, i) => (
          <li key={i}>{official.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
