const mongoose = require("mongoose");
const mongoUri = process.env.MONGO_URI;
const database = process.env.DATABASE;
const url = `${mongoUri}${database}`;
function connect() {
  mongoose
    .connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("connection successful");
    })
    .catch((err) => console.log("no connection"));
}
module.exports = { connect };
