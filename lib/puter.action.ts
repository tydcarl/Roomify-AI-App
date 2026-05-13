import puter from "@heyputer/puter.js";
import {
  getOrCreateHostingConfig,
  uploadImageToHosting,
} from "./puter.hosting";
import { isHostedUrl } from "./utils";
import { PUTER_WORKER_URL } from "./constants";

export const signIn = async () => await puter.auth.signIn();

export const signOut = () => puter.auth.signOut();

export const getCurrentUser = async () => {
  try {
    return await puter.auth.getUser();
  } catch {
    return null;
  }
};

export const createProject = async ({
  item,
  visibility = "private",
}: CreateProjectParams): Promise<DesignItem | null | undefined> => {
  if (!PUTER_WORKER_URL) {
    console.warn("Puter worker URL not configured.");
    return null;
  }

  const projectId = item.id;
  const hosting = await getOrCreateHostingConfig();

  // 1. Host the images
  const hostedSource = projectId
    ? await uploadImageToHosting({
        hosting,
        url: item.sourceImage,
        projectId,
        label: "source",
      })
    : null;

  const hostedRender =
    projectId && item.renderedImage
      ? await uploadImageToHosting({
          hosting,
          url: item.renderedImage,
          projectId,
          label: "rendered",
        })
      : null;

  const resolvedSource =
    hostedSource?.url ||
    (isHostedUrl(item.sourceImage) ? item.sourceImage : "");

  if (!resolvedSource) {
    console.warn("Failed to host source image, skipping save.");
    return null;
  }

  const resolvedRender =
    hostedRender?.url ||
    (item.renderedImage && isHostedUrl(item.renderedImage)
      ? item.renderedImage
      : undefined);

  const { sourcePath, renderedPath, publicPath, ...rest } = item;

  const payload = {
    ...rest,
    sourceImage: resolvedSource,
    renderedImage: resolvedRender,
  };

  try {
    const baseUrl = PUTER_WORKER_URL.startsWith("http")
      ? PUTER_WORKER_URL
      : `https://${PUTER_WORKER_URL}`;

    const response = await fetch(`${baseUrl}/api/projects/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project: payload,
        visibility,
      }),
    });

    if (!response.ok) {
      console.error("Failed to save project", await response.text());
      return null;
    }

    const data = await response.json();
    return data?.project ?? data;
  } catch (e) {
    console.log("Failed to save project", e);
    return null;
  }
};

export const getProjects = async () => {
  if (!PUTER_WORKER_URL) {
    console.warn("Puter worker URL not configured. Cannot fetch projects;");
    return [];
  }

  const baseUrl = PUTER_WORKER_URL.startsWith("http")
    ? PUTER_WORKER_URL
    : `https://${PUTER_WORKER_URL}`;

  try {
    const response = await fetch(`${baseUrl}/api/projects/list`, {
      method: "GET",
    });

    if (!response.ok) {
      console.error("Failed to fetch projects", await response.text());
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data?.projects || [];
  } catch (e) {
    console.error("Failed to fetch projects", e);
    return [];
  }
};
export const getProjectById = async ({ id }: { id: string }) => {
  if (!PUTER_WORKER_URL) {
    console.warn("Missing VITE_PUTER_WORKER_URL; skipping project fetch.");
    return null;
  }

  const baseUrl = PUTER_WORKER_URL.startsWith("http")
    ? PUTER_WORKER_URL
    : `https://${PUTER_WORKER_URL}`;

  try {
    const response = await fetch(
      `${baseUrl}/api/projects/get?id=${encodeURIComponent(id)}`,
      { method: "GET" },
    );

    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch project:", error);
    return null;
  }
};
