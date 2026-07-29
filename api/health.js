import { handleHealth } from "../src/server/handlers.mjs";
import { handleVercelNodeRequest } from "../src/server/vercel-adapter.mjs";

export const config = { runtime: "nodejs", maxDuration: 10 };

export default function health(request, response) {
  return handleVercelNodeRequest(request, response, handleHealth);
}
