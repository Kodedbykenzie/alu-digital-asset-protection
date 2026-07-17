const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const logoPath = path.join(__dirname, "..", "alu-logo.png");

if (!fs.existsSync(logoPath)) {
  throw new Error("alu-logo.png not found. Put the official ALU logo in the project root first.");
}

const fileBuffer = fs.readFileSync(logoPath);
const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

console.log("SHA-256 hash of alu-logo.png:");
console.log(`0x${hash}`);
