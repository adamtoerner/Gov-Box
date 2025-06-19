// components/BudgetBreakdown.jsx
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF", "#FF4444"];

function BudgetBreakdown({ address }) {
  const [source, setSource] = useState("/data/chicago_budget_2024.json");
  const [data, setData] = useState([]);
  const [perCapita, setPerCapita] = useState([]);

  useEffect(() => {
    fetch(source)
      .then((res) => res.json())
      .then((budgetData) => {
        setData(budgetData);
        const population = budgetData.population || 2700000; // Default to Chicago population
        const perPerson = budgetData.categories.map((cat) => ({
          name: cat.name,
          value: parseFloat((cat.amount / population).toFixed(2))
        }));
        setPerCapita(perPerson);
      })
      .catch((err) => console.error("Error loading budget data:", err));
  }, [source]);

  const handleClick = (filename) => {
    setSource(`/data/${filename}`);
  };

  return (
    <div>
      <h2>Budget Insights</h2>

      <div style={{ marginBottom: "1rem" }}>
        <button onClick={() => handleClick("chicago_budget_2024.json")}>City</button>
        <button onClick={() => handleClick("cook_county_budget_2024.json")}>County</button>
        <button onClick={() => handleClick("illinois_budget_2024.json")}>State</button>
        <button onClick={() => handleClick("federal_budget_2024.json")}>Federal</button>
      </div>

      {data && data.categories && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div>
            <h3>{data.jurisdiction} Budget Breakdown</h3>
            <PieChart width={400} height={300}>
              <Pie
                dataKey="amount"
                data={data.categories}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.categories.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </div>

          <div>
            <h3>Estimated Per-Person Contribution</h3>
            <BarChart width={500} height={300} data={perCapita}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetBreakdown;
