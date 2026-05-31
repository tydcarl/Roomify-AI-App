const PROJECT_PREFIX = "roomify_project_";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Standardized JSON Error Helper with CORS
 */
const jsonError = (status, message, extra = {}) => {
  return new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
};

/**
 * Standardized JSON Success Helper with CORS
 */
const jsonResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
};

// Use addEventListener to avoid the 'export' syntax error you had earlier
addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const method = request.method;

  // 1. HANDLE CORS PREFLIGHT (This stops the red 'CORS Policy' errors)
  if (method === "OPTIONS") {
    event.respondWith(
      new Response(null, {
        status: 204,
        headers: corsHeaders,
      }),
    );
    return;
  }

  event.respondWith(
    (async () => {
      // 2. AUTHENTICATION CHECK
      const isSignedIn = await puter.auth.isSignedIn();
      if (!isSignedIn) {
        return jsonError(401, "Unauthorized: Please sign in to continue");
      }

      try {
        // --- GET PROJECT: GET /api/projects/get ---
        if (url.pathname === "/api/projects/get" && method === "GET") {
          const id = url.searchParams.get("id");
          if (!id) return jsonError(400, "Project ID is required");

          const project = await puter.kv.get(`${PROJECT_PREFIX}${id}`);
          if (!project) return jsonError(404, "Project not found");

          const data =
            typeof project === "string" ? JSON.parse(project) : project;
          return jsonResponse(data);
        }

        // --- LIST PROJECTS: GET /api/projects/list ---
        if (url.pathname === "/api/projects/list" && method === "GET") {
          const keys = await puter.kv.list(PROJECT_PREFIX);
          const projects = await Promise.all(
            keys.map(async (key) => {
              const value = await puter.kv.get(key);
              return typeof value === "string" ? JSON.parse(value) : value;
            }),
          );
          return jsonResponse({ projects });
        }

        // --- SAVE PROJECT: POST /api/projects/save ---
        if (url.pathname === "/api/projects/save" && method === "POST") {
          const body = await request.json();
          const project = body?.project;
          if (!project?.id || !project?.sourceImage) {
            return jsonError(400, "Invalid project data");
          }

          const payload = { ...project, updatedAt: new Date().toISOString() };
          await puter.kv.set(`${PROJECT_PREFIX}${project.id}`, payload);
          return jsonResponse({
            saved: true,
            id: project.id,
            project: payload,
          });
        }

        return jsonError(404, "Route not found");
      } catch (err) {
        console.error("Worker Error:", err);
        return jsonError(500, "Internal Server Error", {
          message: err.message,
        });
      }
    })(),
  );
});
