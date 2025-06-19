// src/data/taxBrackets.js

const TAX_BRACKETS = {
  city: [
    { rate: 0, incomeCap: Infinity } // Chicago has no income tax
  ],
  county: [
    { rate: 0, incomeCap: Infinity } // Cook County has no income tax
  ],
  state: [
    { rate: 0.0495, incomeCap: Infinity } // Illinois flat rate
  ],
  federal: [
    { rate: 0.1, incomeCap: 11600 },
    { rate: 0.12, incomeCap: 47150 },
    { rate: 0.22, incomeCap: 100525 },
    { rate: 0.24, incomeCap: 191950 },
    { rate: 0.32, incomeCap: 243725 },
    { rate: 0.35, incomeCap: 609350 },
    { rate: 0.37, incomeCap: Infinity }
  ]
};

export default TAX_BRACKETS;
