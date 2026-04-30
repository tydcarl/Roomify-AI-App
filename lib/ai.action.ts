import puter from "@heyputer/puter.js";
import { ROOMIFY_RENDER_PROMPT } from "./constants";

/**
 * Fetches an image from a URL and converts it to a base64 Data URL.
 * @param url - The remote URL of the image to fetch.
 * @returns A promise that resolves to the data URL string.
 */
export async function fetchAsDataURL(url: string): Promise<string> {
  // 1. Fetch the image
  const response = await fetch(url);

  // 2. Throw an error if the response fails (e.g., 404 or 500)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch image: ${response.status} ${response.statusText}`,
    );
  }

  // 3. Convert the response into a blob
  const blob = await response.blob();

  // 4. Create a new promise to handle the FileReader
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to Data URL."));
      }
    };

    reader.onerror = () => {
      reject(new Error("FileReader encountered an error."));
    };

    reader.readAsDataURL(blob);
  });
}
export const generate3Dview = async ({ sourceImage }: Generate3DViewParams) => {
  const dataUrl = sourceImage.startsWith("data:")
    ? sourceImage
    : await fetchAsDataURL(sourceImage);

  const base64Data = dataUrl.split(",")[1];
  const mimeType = dataUrl.split(";")[0].split(":")[1];

  if (!mimeType || !base64Data) throw new Error("Invalid source image payload");

  const response = await puter.ai.txt2img(ROOMIFY_RENDER_PROMPT, {
    provider: "gemini",
    model: "gemini-2.5-flash-image-preview",
    input_image: base64Data,
    input_image_mime_type: mimeType,
    ratio: { w: 1024, h: 1024 },
  });

  const rawImageUrl = (response as HTMLImageElement).src ?? null;

  if (!rawImageUrl) return { renderedImage: null, renderedPath: undefined };

  const renderedImage = rawImageUrl.startsWith("data:")
    ? rawImageUrl
    : await fetchAsDataURL(rawImageUrl);

  return { renderedImage, renderedPath: undefined };
};
