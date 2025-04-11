//@ts-expect-error: Will be resolved by wrangler build
import { runWithCloudflareRequestContext } from "./cloudflare/init.js";

// export { DOQueueHandler } from "./.build/durable-objects/queue.js";
// export { DOShardedTagCache } from "./.build/durable-objects/sharded-tag-cache.js";

export default {
  async fetch(event: FetchEvent, env: any, ctx: any) {
    ctx = {
      ...ctx,
      waitUntil: event.waitUntil.bind(event),
    };
    env = {
      ...env,
      ASSETS: {
        fetch: getStorageAsset,
      },
    };
    return runWithCloudflareRequestContext(event.request, env, ctx, async () => {
      const url = new URL(event.request.url);

      // Serve images in development.
      // Note: "/cdn-cgi/image/..." requests do not reach production workers.
      if (url.pathname.startsWith("/cdn-cgi/image/")) {
        const m = url.pathname.match(/\/cdn-cgi\/image\/.+?\/(?<url>.+)$/);
        if (m === null) {
          return new Response("Not Found!", { status: 404 });
        }
        const imageUrl = m.groups!.url!;
        return imageUrl.match(/^https?:\/\//)
          ? fetch(imageUrl, { cf: { cacheEverything: true } })
          : env.ASSETS?.fetch(new URL(`/${imageUrl}`, url));
      }

      // Fallback for the Next default image loader.
      if (url.pathname === "/_next/image") {
        const imageUrl = url.searchParams.get("url") ?? "";
        return imageUrl.startsWith("/")
          ? env.ASSETS?.fetch(new URL(imageUrl, event.request.url))
          : fetch(imageUrl, { cf: { cacheEverything: true } });
      }

      if (url.pathname.startsWith("/_next/")) {
        return env.ASSETS?.fetch(event.request);
      }

      // @ts-expect-error: resolved by wrangler build
      const { handler } = await import("./server-functions/default/handler.mjs");

      return handler(event.request, env, {
        waitUntil: ctx.waitUntil.bind(ctx),
      });
    });
  },
};

const getStorageAsset = async (request: Request) => {
  try {
    const requestPath = decodeURIComponent(new URL(request.url).pathname); // Decodifica o caminho
    const assetUrl = new URL(requestPath === "/" ? "index.html" : requestPath, "file://");
    return fetch(assetUrl);
  } catch (e) {
    return new Response((e as Error).message || (e as Error).toString(), { status: 500 });
  }
};
