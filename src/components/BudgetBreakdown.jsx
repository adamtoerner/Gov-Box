import { useEffect, useState } from "react";

function BudgetBreakdown() {
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    fetch("/data/chicago_budget_2024.json")
      .then((res) => res.json())
      .then(setBudget)
      .catch(console.error);
  }, []);

  if (!budget) return <p>Loading budget data...</p>;

  const { revenue, expenditures } = budget;

  return (
    <div>
      <h2>City of Chicago Budget – FY {budget.fiscal_year}</h2>
      <h3>Revenue Sources</h3>
      <ul>
        {Object.entries(revenue.sources).map(([source, amount]) => (
          <li key={source}>
            {source}: ${(amount / 1e9).toFixed(2)}B
          </li>
        ))}
      </ul>

      <h3>Expenditures by Department</h3>
      <ul>
        {Object.entries(expenditures.departments).map(([dept, amount]) => (
          <li key={dept}>
            {dept}: ${(amount / 1e9).toFixed(2)}B
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BudgetBreakdown;
