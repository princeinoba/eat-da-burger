import { handleHealth } from "../src/server/handlers.mjs";
export const config = { runtime: "nodejs", maxDuration: 10 };
export async function GET(request) { return handleHealth(request); }
export async function POST(request) { return handleHealth(request); }
export default handleHealth;
