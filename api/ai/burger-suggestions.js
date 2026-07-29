import { handleSuggestions } from "../../src/server/handlers.mjs";
import { handleVercelNodeRequest } from "../../src/server/vercel-adapter.mjs";

export const config = { runtime: "nodejs", maxDuration: 15 };

export default function burgerSuggestions(request, response) {
  return handleVercelNodeRequest(request, response, handleSuggestions);
}
