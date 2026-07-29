import { handleSuggestions } from "../../src/server/handlers.mjs";
export const config = { runtime: "nodejs", maxDuration: 15 };
export async function POST(request) { return handleSuggestions(request); }
export async function GET(request) { return handleSuggestions(request); }
export default handleSuggestions;
