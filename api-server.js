// PATCH START - api-server.js (Updated port to 3000)
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3000; // changed to port 3000 for permissions

app.use(cors());

// Mock sales data endpoints
app.get("/agg/product", (req, res) => {
  const { dt } = req.query;
  res.json({ message: "Sales data aggregated by product", dt });
});

app.get("/agg/company", (req, res) => {
  const { dt } = req.query;
  res.json({ message: "Sales data aggregated by company", dt });
});

app.get("/agg/date", (req, res) => {
  const { dt } = req.query;
  res.json({ message: "Sales data aggregated by date", dt });
});

app.listen(port, () => {
  console.log(`Mock REST API server running at http://localhost:${port}`);
});
// PATCH END - api-server.js
