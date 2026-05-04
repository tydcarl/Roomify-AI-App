const PROJECT_PREFIX = "roomify_project_";

/**
 * Standardized JSON Error Helper
 */
const jsonError = (status, message, extra = {}) => {
  return new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

/**
 * Standardized JSON Success Helper
 */
const jsonResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const method = request.method;

    // 1. Global Authentication Check
    const isSignedIn = await puter.auth.isSignedIn();
    if (!isSignedIn) {
      return jsonError(401, "Unauthorized: Please sign in to continue");
    }

    try {
      // --- SAVE PROJECT: POST /api/projects/save ---
      if (url.pathname === "/api/projects/save" && method === "POST") {
        const body = await request.json();
        const project = body?.project;

        // Validation
        if (!project?.id || !project?.sourceImage) {
          return jsonError(
            400,
            "Invalid project data: id and sourceImage are required",
          );
        }

        const payload = {
          ...project,
          updatedAt: new Date().toISOString(),
        };

        const key = `${PROJECT_PREFIX}${project.id}`;
        await puter.kv.set(key, payload);

        return jsonResponse({ saved: true, id: project.id, project: payload });
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

      // --- GET PROJECT: GET /api/projects/get ---
      if (url.pathname === "/api/projects/get" && method === "GET") {
        const id = url.searchParams.get("id");
        if (!id) return jsonError(400, "Project ID is required");

        const key = `${PROJECT_PREFIX}${id}`;
        const project = await puter.kv.get(key);

        if (!project) return jsonError(404, "Project not found");

        const data =
          typeof project === "string" ? JSON.parse(project) : project;
        return jsonResponse(data);
      }

      // 404 Fallback
      return jsonError(404, "Route not found");
    } catch (err) {
      console.error("Worker Error:", err);
      return jsonError(500, "Internal Server Error", { message: err.message });
    }
  },
};
