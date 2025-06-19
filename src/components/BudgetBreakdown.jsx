// BudgetBreakdown.jsx
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560"];

function BudgetSection({ source }) {
  const [data, setData] = useState([]);
  const [perCapita, setPerCapita] = useState([]);

  useEffect(() => {
    fetch(source)
      .then((res) => res.json())
      .then((budgetData) => {
        setData(budgetData);
        const population = budgetData.population || 2700000; // default to Chicago population
        const perPerson = budgetData.categories.map((cat) => ({
          name: cat.name,
          value: (cat.amount / population).toFixed(2),
        }));
        setPerCapita(perPerson);
      })
      .catch((err) => console.error("Error loading budget data:", err));
  }, [source]);

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h3>Spending Breakdown</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data.categories}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {data.categories?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(val) => `$${parseFloat(val).toLocaleString()}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <h3>Per Capita Spending</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={perCapita}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(val) => `$${parseFloat(val).toLocaleString()}`} />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BudgetBreakdown() {
  const [selectedLevel, setSelectedLevel] = useState("city");

  const sources = {
    city: "/data/chicago_budget_2024.json",
    county: "/data/cook_county_budget_2024.json",
    state: "/data/illinois_budget_2024.json",
    federal: "/data/federal_budget_2024.json",
  };

  return (
    <div>
      <h2>Budget Insights</h2>
      <div style={{ marginBottom: "1rem" }}>
        {Object.keys(sources).map((level) => (
          <button
            key={level}
            onClick={() => setSelectedLevel(level)}
            style={{
              padding: "0.5rem 1rem",
              marginRight: "0.5rem",
              backgroundColor: selectedLevel === level ? "#222" : "#ddd",
              color: selectedLevel === level ? "#fff" : "#000",
              border: "none",
              borderRadius: "5px",
            }}
          >
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>
      <BudgetSection source={sources[selectedLevel]} />
    </div>
  );
}

export default BudgetBreakdown;
