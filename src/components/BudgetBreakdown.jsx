// components/BudgetBreakdown.jsx
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF", "#FF4444"];

import TAX_BRACKETS from "../data/taxBrackets";

function BudgetBreakdown({ address }) {
  const [source, setSource] = useState("/data/chicago_budget_2024.json");
  const [data, setData] = useState([]);
  const [perCapita, setPerCapita] = useState([]);
  const [income, setIncome] = useState(60000);
  const [individualShare, setIndividualShare] = useState([]);

  const getJurisdictionLevel = (filename) => {
    if (filename.includes("chicago")) return "city";
    if (filename.includes("cook_county")) return "county";
    if (filename.includes("illinois")) return "state";
    if (filename.includes("federal")) return "federal";
    return "city";
  };

  const calculateMarginalTax = (brackets, income) => {
    let tax = 0;
    let prevCap = 0;
    for (let i = 0; i < brackets.length; i++) {
      const { rate, incomeCap } = brackets[i];
      const taxable = Math.min(income, incomeCap) - prevCap;
      if (taxable > 0) {
        tax += taxable * rate;
        prevCap = incomeCap;
      } else {
        break;
      }
    }
    return tax;
  };

  useEffect(() => {
    fetch(source)
      .then((res) => res.json())
      .then((budgetData) => {
        setData(budgetData);
        const population = budgetData.population || 2700000;
        const perPerson = budgetData.categories.map((cat) => ({
          name: cat.name,
          value: parseFloat((cat.amount / population).toFixed(2))
        }));
        setPerCapita(perPerson);

        const level = getJurisdictionLevel(source);
        const brackets = TAX_BRACKETS[level];
        const totalRevenue = budgetData.categories.reduce((sum, cat) => sum + cat.amount, 0);
        const totalTax = calculateMarginalTax(brackets, income);
        const personalShare = budgetData.categories.map((cat) => ({
          name: cat.name,
          value: parseFloat(((cat.amount / totalRevenue) * totalTax).toFixed(2))
        }));
        setIndividualShare(personalShare);
      })
      .catch((err) => console.error("Error loading budget data:", err));
  }, [source, income]);

  const handleClick = (filename) => {
    setSource(`/data/${filename}`);
  };

  const formatCurrency = (value) => {
    return `$${Number(value).toLocaleString()}`;
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

      <div style={{ marginBottom: "1rem" }}>
        <label>Annual Income: $</label>
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(Number(e.target.value))}
          style={{ width: "150px" }}
        />
      </div>

      {data && data.categories && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div>
            <h3>{data.jurisdiction} - Overall Public Budget</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="amount"
                  data={data.categories}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, amount }) => `${name}: $${amount.toLocaleString()}`}
                >
                  {data.categories.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={formatCurrency} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3>{data.jurisdiction} - Individual Public Contribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={individualShare}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={formatCurrency} />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Your Share" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default BudgetBreakdown;
