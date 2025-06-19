import { useState } from "react";

function AddressForm({ onSubmit }) {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input) onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        placeholder="Enter your address"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: "300px", padding: "0.5rem" }}
      />
      <button type="submit" style={{ marginLeft: "1rem", padding: "0.5rem" }}>
        Lookup
      </button>
    </form>
  );
}

export default AddressForm;
