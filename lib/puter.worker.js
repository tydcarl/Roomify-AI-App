const PROJECT_PREFIX = "roomify_project_";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const jsonError = (status, message, extra = {}) => {
  return new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
};

const jsonResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
};

addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const method = request.method;

  if (method === "OPTIONS") {
    event.respondWith(
      new Response(null, { status: 204, headers: corsHeaders }),
    );
    return;
  }

  event.respondWith(
    (async () => {
      try {
        const id = url.searchParams.get("id");

        // 1. GET PROJECT (Matches /api/projects/get, /get, or /)
        if (
          method === "GET" &&
          id &&
          (url.pathname.endsWith("/get") || url.pathname === "/")
        ) {
          const project = await puter.kv.get(`${PROJECT_PREFIX}${id}`);
          if (!project) return jsonError(404, "Project not found");

          const data =
            typeof project === "string" ? JSON.parse(project) : project;
          return jsonResponse(data);
        }

        // 2. LIST PROJECTS (Matches /api/projects/list or /list)
        if (method === "GET" && url.pathname.endsWith("/list")) {
          const keys = await puter.kv.list(PROJECT_PREFIX);
          const projects = await Promise.all(
            keys.map(async (key) => {
              const value = await puter.kv.get(key);
              return typeof value === "string" ? JSON.parse(value) : value;
            }),
          );
          return jsonResponse({ projects });
        }

        // 3. SAVE PROJECT (Matches /api/projects/save, /save, or /)
        if (
          method === "POST" &&
          (url.pathname.endsWith("/save") || url.pathname === "/")
        ) {
          let body;
          try {
            body = await request.json();
          } catch (e) {
            return jsonError(400, "Malformed JSON body payload");
          }

          const project = body?.project;
          if (!project?.id || !project?.sourceImage) {
            return jsonError(400, "Invalid project data structure received");
          }

          const payload = { ...project, updatedAt: new Date().toISOString() };
          await puter.kv.set(`${PROJECT_PREFIX}${project.id}`, payload);

          return jsonResponse({
            saved: true,
            id: project.id,
            project: payload,
          });
        }

        return jsonError(404, `Route not found: ${url.pathname}`);
      } catch (err) {
        console.error("Worker Error:", err);
        return jsonError(500, "Internal Server Error", {
          message: err.message,
        });
      }
    })(),
  );
});
