const crypto = require("crypto");

const hashId = (id) => {
  return crypto.createHash("sha256").update(id.toString()).digest("hex");
};

module.exports = { hashId };
