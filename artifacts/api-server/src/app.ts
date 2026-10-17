import express, { type Express } from "express";
import type { RequestHandler } from "express";
import cors from "cors";
import { clerkClient, clerkMiddleware, getAuth } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  createProxyMiddleware,
  fixRequestBody,
} from "http-proxy-middleware";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";

const app: Express = express();
const requireClerkUser: RequestHandler = async (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await clerkClient.users.getUser(userId);
    const email = user.primaryEmailAddress?.emailAddress?.trim();
    if (!email) {
      res.status(403).json({ error: "Your account needs a primary email." });
      return;
    }

    const upstreamUrl = new URL(req.url, "http://localhost");
    const path = upstreamUrl.pathname;
    const isCartCollection = path === "/cart";
    const isCartItem = /^\/cart\/[^/]+$/.test(path);
    const isAllowedRequest =
      (path === "/health" && req.method === "GET") ||
      (path === "/ai/scan-label" && req.method === "POST") ||
      (isCartCollection && ["GET", "POST"].includes(req.method)) ||
      (isCartItem && ["GET", "PUT", "DELETE"].includes(req.method));

    if (!isAllowedRequest) {
      res.status(404).json({ error: "NutriGo endpoint not found." });
      return;
    }

    if (isCartCollection && req.method === "GET") {
      upstreamUrl.searchParams.set("user_email", email);
    }
    if (isCartCollection && req.method === "POST") {
      req.body = { ...req.body, user_email: email };
    }

    if (isCartItem) {
      const itemResponse = await fetch(
        `https://nutrigo-ai-backend.onrender.com/api${path}`,
        { headers: { Accept: "application/json" } },
      );
      if (itemResponse.status === 404) {
        res.status(404).json({ error: "Cart item not found." });
        return;
      }
      if (!itemResponse.ok) {
        res.status(502).json({ error: "Unable to verify cart item ownership." });
        return;
      }
      const item = (await itemResponse.json()) as { user_email?: unknown };
      if (
        typeof item.user_email !== "string" ||
        item.user_email.toLowerCase() !== email.toLowerCase()
      ) {
        res.status(404).json({ error: "Cart item not found." });
        return;
      }
    }

    req.url = `${upstreamUrl.pathname}${upstreamUrl.search}`;
    next();
  } catch (error) {
    req.log.error({ err: error }, "Unable to verify NutriGo account");
    res.status(502).json({ error: "Unable to verify your NutriGo account." });
  }
};

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use(
  "/api/nutrigo",
  requireClerkUser,
  createProxyMiddleware({
    target: "https://nutrigo-ai-backend.onrender.com",
    changeOrigin: true,
    on: { proxyReq: fixRequestBody },
    pathRewrite: (path) => {
      if (path === "/health") {
        return "/";
      }
      return `/api${path}`;
    },
  }),
);

app.use("/api", router);

export default app;
