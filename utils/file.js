const fs = require("fs");
const path = require("path");

const dataFile = path.join(__dirname, "../data/meta.json");

// Ensures that a directory exists.
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Reads and parses the JSON data file.
function readJSON() {
  if (!fs.existsSync(dataFile)) {
    return {};
  }
  const content = fs.readFileSync(dataFile, "utf-8");
  return JSON.parse(content || "{}");
}

// Writes data to the JSON file.
function writeJSON(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = { ensureDir, readJSON, writeJSON };
