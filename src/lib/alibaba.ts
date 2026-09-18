import { dashscopeBaseUrl, env, hasAlibabaCredentials } from "./env";
import { logger } from "./logger";
import { AppError } from "./errors";
import { apiCopy } from "./studio-copy";

type TaskStatus = "PENDING" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "UNKNOWN";

// wan2.7-image is the fast SKU (vs wan2.7-image-pro). No flash/turbo i2i exists in Model Studio.
const IMAGE_MODELS = [
  env.WAN_IMAGE_MODEL,
  "wan2.7-image",
  "qwen-image-edit-plus",
  "qwen-image-edit",
  "wan2.6-image",
].filter((model, index, list) => model && list.indexOf(model) === index);

const VIDEO_MODELS = [
  "wan2.6-i2v-flash",
  env.WAN_VIDEO_MODEL,
  "wan2.5-i2v-preview",
].filter((model, index, list) => model && list.indexOf(model) === index);

const IMAGE_SIZE = "720*1280";

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

function providerError(status: number, body: Record<string, unknown>) {
  const code = String(body.code || "PROVIDER_ERROR");
  const message = String(body.message || apiCopy.alibabaFailed);
  if (code === "AccessDenied.Unpurchased") {
    return new AppError(403, apiCopy.alibabaFailed, "MODEL_UNPURCHASED");
  }
  if (code === "InvalidApiKey") {
    return new AppError(401, apiCopy.badKey, "INVALID_API_KEY");
  }
  if (message.toLowerCase().includes("does not support asynchronous")) {
    return new AppError(400, message, "ASYNC_UNSUPPORTED");
  }
  return new AppError(status >= 400 ? status : 502, message, code);
}

async function dashscopeFetch(path: string, init: RequestInit, asyncMode = false) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${env.DASHSCOPE_API_KEY}`,
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (asyncMode) headers["X-DashScope-Async"] = "enable";
  if (env.DASHSCOPE_WORKSPACE_ID) headers["X-DashScope-WorkSpace"] = env.DASHSCOPE_WORKSPACE_ID;

  const response = await fetch(`${dashscopeBaseUrl()}${path}`, {
    ...init,
    headers,
    signal: AbortSignal.timeout(90_000),
  });

  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    logger.error({ status: response.status, body }, "DashScope request failed");
    throw providerError(response.status, body);
  }
  return body;
}

async function pollTask(taskId: string, attempts = 48) {
  for (let i = 0; i < attempts; i += 1) {
    const data = await dashscopeFetch(`/tasks/${taskId}`, { method: "GET" });
    const output = data.output as { task_status?: TaskStatus; message?: string } | undefined;
    const status = output?.task_status;
    if (status === "SUCCEEDED") return data;
    if (status === "FAILED" || status === "CANCELED") {
      throw new AppError(502, output?.message || String(data.message || apiCopy.genFailed), "PROVIDER_FAILED");
    }
    await sleep(i < 8 ? 400 : Math.min(900 + i * 80, 1600));
  }
  throw new AppError(504, apiCopy.genTimeout, "PROVIDER_TIMEOUT");
}

function extractImageUrl(data: Record<string, unknown>) {
  const output = data.output as { choices?: Array<{ message?: { content?: Array<{ image?: string }> } }>; results?: Array<{ url?: string }> } | undefined;
  return output?.choices?.[0]?.message?.content?.find((item) => item.image)?.image || output?.results?.[0]?.url;
}

function extractVideoUrl(data: Record<string, unknown>) {
  const output = data.output as { video_url?: string; results?: Array<{ url?: string }> } | undefined;
  return output?.video_url || output?.results?.[0]?.url;
}

function isUnpurchased(error: unknown) {
  return error instanceof AppError && error.code === "MODEL_UNPURCHASED";
}

function isAsyncUnsupported(error: unknown) {
  return error instanceof AppError && error.code === "ASYNC_UNSUPPORTED";
}

async function generateOnce(path: string, body: unknown, preferAsync: boolean) {
  const modes = preferAsync ? [true, false] : [false, true];
  let lastError: unknown;
  for (const asyncMode of modes) {
    try {
      return await dashscopeFetch(path, { method: "POST", body: JSON.stringify(body) }, asyncMode);
    } catch (error) {
      lastError = error;
      if (isAsyncUnsupported(error) && asyncMode) {
        logger.warn({ path }, "Async not supported, retrying synchronously");
        continue;
      }
      throw error;
    }
  }
  throw lastError instanceof Error ? lastError : new AppError(502, apiCopy.alibabaFailed, "PROVIDER_ERROR");
}

const HEADROOM = "Keep every guest large in a portrait. Whole heads, hair, crowns, arms and the designed frame inside the picture. Never crop people, logos or borders off the edges. Waist-up in the foreground. Never a tiny figure at the bottom. IDENTITY LOCK: same people, same faces, same skin, same ethnicity, same age, same body. Never swap the person. Photographic WOW: flattering key light, bright catchlights, razor-sharp eyes, rich cinematic colour, festival/gala presence. Natural skin texture — no plastic beauty-filter, no face morph.";

export async function generateAiPhoto(imageUrl: string, prompt: string, sceneUrl?: string | null) {
  if (!hasAlibabaCredentials()) {
    return { mode: "demo" as const, url: imageUrl };
  }

  const content: Array<{ image?: string; text?: string }> = [];
  if (sceneUrl) content.push({ image: sceneUrl });
  content.push({ image: imageUrl });
  content.push({
    text: sceneUrl
      ? `${HEADROOM} The first image is the real place (background only). Copy it exactly. The last image is the guest photo — keep every person in it, one or a group, same faces. Put them large in the foreground of that place. Do not copy people from the place image. ${prompt}`
      : `${HEADROOM} The last image is the guest photo. Keep every person from it, same faces and identity. Follow the brief for clothes and background only. ${prompt}`,
  });

  let lastError: unknown;
  for (const model of IMAGE_MODELS) {
    try {
      const created = await generateOnce(
        "/services/aigc/multimodal-generation/generation",
        {
          model,
          input: {
            messages: [
              {
                role: "user",
                content,
              },
            ],
          },
          parameters: {
            size: IMAGE_SIZE,
            n: 1,
            watermark: false,
            ...(model.startsWith("wan2.7") ? { thinking_mode: false } : {}),
          },
        },
        false,
      );

      const taskId = (created.output as { task_id?: string } | undefined)?.task_id;
      const finished = taskId ? await pollTask(taskId) : created;
      const url = extractImageUrl(finished);
      if (!url) throw new AppError(502, apiCopy.noImage, "EMPTY_IMAGE");
      logger.info({ model }, "AI photo generated");
      return { mode: "alibaba" as const, url, model };
    } catch (error) {
      lastError = error;
      if (isUnpurchased(error)) {
        logger.warn({ model }, "Image model not purchased, trying next");
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof AppError
    ? lastError
    : new AppError(403, apiCopy.noImageModel, "MODEL_UNPURCHASED");
}

export async function generateAiVideo(imageUrl: string, prompt: string) {
  if (!hasAlibabaCredentials()) {
    return { mode: "demo" as const, url: null };
  }

  let lastError: unknown;
  for (const model of VIDEO_MODELS) {
    try {
      const created = await generateOnce(
        "/services/aigc/video-generation/video-synthesis",
        {
          model,
          input: {
            prompt,
            media: [{ type: "first_frame", url: imageUrl }],
          },
          parameters: { resolution: "720P", duration: 4, watermark: false },
        },
        true,
      );

      const taskId = (created.output as { task_id?: string } | undefined)?.task_id;
      const finished = taskId ? await pollTask(taskId, 40) : created;
      const url = extractVideoUrl(finished);
      if (!url) throw new AppError(502, apiCopy.noVideo, "EMPTY_VIDEO");
      logger.info({ model, resolution: "720P" }, "AI video generated");
      return { mode: "alibaba" as const, url, model };
    } catch (error) {
      lastError = error;
      if (isUnpurchased(error)) {
        logger.warn({ model }, "Video model not purchased, trying next");
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof AppError
    ? lastError
    : new AppError(403, apiCopy.noVideoModel, "MODEL_UNPURCHASED");
}

export async function downloadProviderFile(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new AppError(502, apiCopy.downloadFailed, "DOWNLOAD_FAILED");
  return Buffer.from(await response.arrayBuffer());
}
