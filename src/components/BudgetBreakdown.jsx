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

function BudgetBreakdown({ address }) {
  const [source, setSource] = useState("/data/chicago_budget_2024.json");
  const [data, setData] = useState([]);
  const [perCapita, setPerCapita] = useState([]);
  const [income, setIncome] = useState(60000);
  const [homeValue, setHomeValue] = useState(300000);
  const [ownsHome, setOwnsHome] = useState(false);
  const [individualShare, setIndividualShare] = useState([]);
  const [taxBrackets, setTaxBrackets] = useState([]);
  const [propertyTaxRate, setPropertyTaxRate] = useState(0);

  const getJurisdictionLevel = (filename) => {
    if (filename.includes("chicago_public_schools")) return "schools";
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
      const cap = incomeCap === "Infinity" ? Infinity : incomeCap;
      const taxable = Math.min(income, cap) - prevCap;
      if (taxable > 0) {
        tax += taxable * rate;
        prevCap = cap;
      } else {
        break;
      }
    }
    return tax;
  };

  useEffect(() => {
    const level = getJurisdictionLevel(source);
    fetch(`/data/${level}_tax_brackets.json`)
      .then((res) => res.json())
      .then((data) => {
        setTaxBrackets(data.brackets || []);
        setPropertyTaxRate(data.propertyTaxRate || 0);
      })
      .catch((err) => console.error("Error loading tax bracket data:", err));
  }, [source]);

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

        const totalRevenue = budgetData.categories.reduce((sum, cat) => sum + cat.amount, 0);
        const incomeTax = calculateMarginalTax(taxBrackets, income);

        const propertyTax = ownsHome ? homeValue * propertyTaxRate : 0;
        const totalTax = incomeTax + propertyTax;

        const personalShare = budgetData.categories.map((cat) => ({
          name: cat.name,
          incomeTax: ((cat.amount / totalRevenue) * incomeTax).toFixed(2),
          propertyTax: ((cat.amount / totalRevenue) * propertyTax).toFixed(2)
        }));
        setIndividualShare(personalShare);
      })
      .catch((err) => console.error("Error loading budget data:", err));
  }, [source, income, ownsHome, homeValue, taxBrackets, propertyTaxRate]);

  const handleClick = (filename) => {
    setSource(`/data/${filename}`);
  };

  const formatCurrency = (value) => `$${Number(value).toLocaleString()}`;

  return (
    <div>
      {/* Add rendering logic here as needed */}
    </div>
  );
}

export default BudgetBreakdown;


