import { getAdminDb } from "./lib/firebaseAdmin.ts";
import { readFileSync } from "fs";

try {
  const envFile = readFileSync(".env.local", "utf8");
  envFile.split("\n").forEach(line => {
    if (line.includes("=")) {
      const [key, ...rest] = line.split("=");
      process.env[key.trim()] = rest.join("=").trim().replace(/['"]/g, '');
    }
  });
} catch(e) {}

async function fetchTags() {
  try {
    const db = getAdminDb();
    const snapshot = await db.collection("tags").get();
    const tags = snapshot.docs.map(doc => doc.data().name);
    console.log("TAGS_JSON:", JSON.stringify(tags));
    process.exit(0);
  } catch (error) {
    console.error("Error fetching tags:", error);
    process.exit(1);
  }
}

fetchTags();
