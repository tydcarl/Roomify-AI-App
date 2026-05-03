const {
  jsonError,
} = (status, message, extra = {}) => {
  new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
};

const getUserID = async (userPuter) => {
    try {
        const userInfo = await userPuter.getUserInfo();
        return userInfo.id;
    } catch (e) {
        console.error("Failed to get user ID:", e);
        throw new Error("Unable to retrieve user information");
    }
}

router.post("api/router/save", async ({ request, response }) => {
  try {
  } catch (e) {
    return jsonError(500, "Failed to save project", {
      message: e.message || "Unknown error",
    });
  }
});
