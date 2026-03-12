import { Router } from "express";
import { PLAN_CONFIG } from "../../config/plans.js";
import { features } from "../../config/env.js";

export const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.json({
    ok: true,
    features,
    plans: PLAN_CONFIG
  });
});
