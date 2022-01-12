require("dotenv").config();
const express = require("express");
const router = require("./src/routes");
const app = express();
require("./src/modules/redis");
const port = 5000;

app.use(express.json());
app.use("/api/v1/", router);

app.listen(port, () => console.log(`listen on port ${port}`));
