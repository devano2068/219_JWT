require("dotenv").config();
const connectDatabase = require("./config/db");
const app = require("./app");
const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
startServer();