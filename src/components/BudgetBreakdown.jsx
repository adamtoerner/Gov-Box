import { useEffect, useState } from "react";

function BudgetBreakdown() {
  const [budgetData, setBudgetData] = useState(null);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const res = await fetch("/data/chicago_budget_2024.json");
        const data = await res.json();
        setBudgetData(data);
      } catch (err) {
        console.error("Error loading budget data:", err);
      }
    };

    fetchBudget();
  }, []);

  if (!budgetData || !budgetData.categories) {
    return <p>Loading budget data...</p>;
  }

  return (
    <div>
      <h2>Chicago Budget {budgetData.year}</h2>
      <ul>
        {budgetData.categories.map((item, i) => (
          <li key={i}>
            {item.category}: ${item.amount.toLocaleString()}
          </li>
        ))}
      </ul>
      {budgetData.source && <p>Source: {budgetData.source}</p>}
    </div>
  );
}

export default BudgetBreakdown;

