// components/BudgetBreakdown.jsx
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";
import { getSchoolDistrict } from "../utilities/schoolDistrictLookup"; // Import the school district lookup utility

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF", "#FF4444"];

function BudgetBreakdown({ address }) {
  const [source, setSource] = useState("/data/budget_data/chicago_budget_2024.json");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState("City");
  const [jurisdictionName, setJurisdictionName] = useState("");
  const [data, setData] = useState([]);
  const [perCapita, setPerCapita] = useState([]);
  const [income, setIncome] = useState(60000);
  const [homeValue, setHomeValue] = useState(300000);
  const [ownsHome, setOwnsHome] = useState(false);
  const [individualShare, setIndividualShare] = useState([]);
  const [taxBrackets, setTaxBrackets] = useState([]);
  const [propertyTaxRate, setPropertyTaxRate] = useState(0);
  const [schoolDistrictName, setSchoolDistrictName] = useState(""); // New state for school district name

  const getJurisdictionLevel = (filename) => {
    if (filename.includes("chicago_public_schools")) return "school_district";
    if (filename.includes("township")) return "township";
    if (filename.includes("special_district")) return "special_district";
    if (filename.includes("chicago")) return "municipal";
    if (filename.includes("cook_county")) return "county";
    if (filename.includes("illinois")) return "state";
    if (filename.includes("federal")) return "federal";
    return "municipal";
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
    fetch(`/data/tax_data/${level}_tax_brackets.json`)
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
        setJurisdictionName(budgetData.jurisdiction || selectedJurisdiction);
        const population = budgetData.population || 2700000;

        const perPerson = budgetData.categories.map((cat) => ({
          name: cat.name,
          value: Math.round(cat.amount / population)
        }));
        setPerCapita(perPerson);

        const totalRevenue = budgetData.categories.reduce((sum, cat) => sum + cat.amount, 0);
        const incomeTax = calculateMarginalTax(taxBrackets, income);
        const propertyTax = ownsHome ? homeValue * propertyTaxRate : 0;
        const totalTax = incomeTax + propertyTax;

        const personalShare = budgetData.categories.map((cat) => {
          const proportion = cat.amount / totalRevenue;
          return {
            name: cat.name,
            incomeTax: Math.round(proportion * incomeTax),
            propertyTax: Math.round(proportion * propertyTax)
          };
        });
        setIndividualShare(personalShare);
      })
      .catch((err) => console.error("Error loading budget data:", err));
  }, [source, income, ownsHome, homeValue, taxBrackets, propertyTaxRate]);

  useEffect(() => {
    if (address && selectedJurisdiction === "School District") {
      const geocodeUrl = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(address)}&apiKey=YOUR_GEOAPIFY_KEY_HERE`;

      fetch(geocodeUrl)
        .then(res => res.json())
        .then(result => {
          const { lat, lon } = result.features?.[0]?.properties || {};
          if (lat && lon) {
            return getSchoolDistrict(lat, lon);
          }
        })
        .then(district => {
          if (district?.districtName) {
            setSchoolDistrictName(district.districtName);
          }
        })
        .catch(err => console.error("Error resolving school district:", err));
    }
  }, [address, selectedJurisdiction]);

  const handleClick = (filename, label) => {
    setSource(`/data/budget_data/${filename}`);
    setSelectedJurisdiction(label);
  };

  const formatCurrency = (value) => `$${Number(value).toLocaleString()}`;

  const isActive = (filename) =>
    source.endsWith(filename)
      ? "bg-green-600 hover:bg-green-700"
      : "bg-blue-500 hover:bg-blue-600";

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Public Money: {jurisdictionName}</h2>

      <div className="space-x-2 mb-4 flex flex-wrap gap-2">
        <button onClick={() => handleClick("chicago_public_schools_budget_2024.json", "School District")} className={`${isActive("chicago_public_schools_budget_2024.json")} text-white px-3 py-1 rounded`}>School District</button>
        <button onClick={() => handleClick("special_district_budget_2024.json", "Special District")} className={`${isActive("special_district_budget_2024.json")} text-white px-3 py-1 rounded`}>Special District</button>
        <button onClick={() => handleClick("township_budget_2024.json", "Township")} className={`${isActive("township_budget_2024.json")} text-white px-3 py-1 rounded`}>Township</button>
        <button onClick={() => handleClick("chicago_budget_2024.json", "Municipal")} className={`${isActive("chicago_budget_2024.json")} text-white px-3 py-1 rounded`}>Municipal</button>
        <button onClick={() => handleClick("cook_county_budget_2024.json", "County")} className={`${isActive("cook_county_budget_2024.json")} text-white px-3 py-1 rounded`}>County</button>
        <button onClick={() => handleClick("illinois_budget_2024.json", "State")} className={`${isActive("illinois_budget_2024.json")} text-white px-3 py-1 rounded`}>State</button>
        <button onClick={() => handleClick("federal_budget_2024.json", "Federal")} className={`${isActive("federal_budget_2024.json")} text-white px-3 py-1 rounded`}>Federal</button>
      </div>

      {selectedJurisdiction === "School District" && schoolDistrictName && (
        <p className="mb-4 text-sm text-gray-700">Identified District: <strong>{schoolDistrictName}</strong></p>
      )}

      <div className="mb-4">
        <label className="mr-2">Annual Income:</label>
        <input
          type="number"
          value={income}
          onChange={(e) => setIncome(Number(e.target.value))}
          className="border px-2 py-1 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="mr-2">Do you own a home?</label>
        <input
          type="checkbox"
          checked={ownsHome}
          onChange={() => setOwnsHome(!ownsHome)}
          className="mr-2"
        />
        {ownsHome && (
          <>
            <label className="mr-2">Estimated Home Value:</label>
            <input
              type="number"
              value={homeValue}
              onChange={(e) => setHomeValue(Number(e.target.value))}
              className="border px-2 py-1 rounded"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-medium mb-2">Overall Public Budget</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.categories || []}
                dataKey="amount"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({ name, amount }) => `${name}: ${formatCurrency(amount)}`}
              >
                {(data.categories || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Individual Public Contribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={individualShare}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="incomeTax" stackId="a" fill="#8884d8" name="Income Tax" />
              <Bar dataKey="propertyTax" stackId="a" fill="#82ca9d" name="Property Tax" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default BudgetBreakdown;
