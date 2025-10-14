import { Router } from "express";
import { getQueueLength } from "@controllers/serviceController";

import { throwBadRequestIfMissing } from "@utils";
import { logInfo, logError } from "@services/loggingService";

const router = Router();

// Get queue length for a service
// GET /:id/queue_length
router.get("/:id/queue_length", async (req, res, next) => {
  try {
    const serviceId = req.params.id;
    res.status(200).json(await getQueueLength(serviceId as string));
  } catch (error) {
    next(error);
  }
});

export default router;
