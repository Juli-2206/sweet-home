require('dotenv').config();
const app = require('./src/app');
const { validateEnv } = require('./src/config/env');

validateEnv();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🏡 Sweet Home API corriendo en http://localhost:${PORT}`);
});
