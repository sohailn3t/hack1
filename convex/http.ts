import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

http.route({
  path: "/api/lst",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: corsHeaders })),
});

http.route({
  path: "/api/lst",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const latitude = Number(url.searchParams.get("lat"));
    const longitude = Number(url.searchParams.get("lng"));

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return jsonResponse({ error: "lat and lng must be finite numbers." }, 400);
    }

    try {
      const result = await ctx.runAction(api.lst.fetch, {
        latitude,
        longitude,
      });
      return jsonResponse(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Earth Engine LST request failed.";
      const status = message.includes("Earth Engine is not configured") ||
        message.includes("EE_SERVICE_ACCOUNT_KEY_JSON")
        ? 503
        : 502;
      return jsonResponse({ error: message }, status);
    }
  }),
});

export default http;
