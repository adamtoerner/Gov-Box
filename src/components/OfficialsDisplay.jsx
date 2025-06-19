function OfficialsDisplay({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return <p>No officials to display. Enter an address above.</p>;
  }

  return (
    <div>
      {Object.entries(data).map(([level, officials]) => (
        <div key={level} style={{ marginBottom: "2rem" }}>
          <h2>{level.toUpperCase()}</h2>
          {officials.map((entry, index) => (
            <div key={index} style={{ padding: "0.25rem 0" }}>
              <strong>{entry.office}</strong>: {entry.official}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default OfficialsDisplay;
