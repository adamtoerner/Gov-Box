// components/BudgetBreakdown.jsx
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28AE5", "#FF6699"];

function BudgetBreakdown({ address }) {
  const [budgetData, setBudgetData] = useState(null);
  const [personalizedEstimate, setPersonalizedEstimate] = useState(null);

  useEffect(() => {
    fetch("/data/chicago_budget_2024.json")
      .then((res) => res.json())
      .then((data) => {
        setBudgetData(data);
        const personal = Object.entries(data).map(([category, value]) => ({
          name: category,
          value: value / 2700000 // assume 2.7 million Chicagoans for personalization
        }));
        setPersonalizedEstimate(personal);
      });
  }, [address]);

  if (!budgetData) return <p>Loading budget data...</p>;

  const formattedData = Object.entries(budgetData).map(([key, value]) => ({
    name: key,
    value
  }));

  return (
    <div>
      <h2>City of Chicago Budget 2024</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <h3>Your Estimated Share</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={personalizedEstimate} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={70} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BudgetBreakdown;

