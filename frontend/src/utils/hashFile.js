export async function generateFileHash(file) {
  if (!file) {
    throw new Error("Please select an image file first.");
  }

  const fileBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", fileBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return `0x${hashHex}`;
}

export function isValidBytes32Hash(hash) {
  return /^0x[a-fA-F0-9]{64}$/.test(hash.trim());
}
