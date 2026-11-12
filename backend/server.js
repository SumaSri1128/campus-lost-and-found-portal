const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");
const claimRoutes = require("./routes/claimRoutes");
app.use(cors());
app.use(express.json());
app.use("/api/items", itemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/claims", claimRoutes);
connectDB();

app.get("/", (req, res) => {
    res.send("Campus Lost and Found API is running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});