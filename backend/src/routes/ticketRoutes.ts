import { Router } from "express";
import { createTicket } from "../controllers/ticketController";
import { nextTicket, getTicket } from "@controllers/ticketController";

import { throwBadRequestIfMissing } from "@utils";
import { logInfo, logError } from "@services/loggingService";

const router = Router();

// Get ticket by ID
// GET /:id
router.get("/:id", async (req, res, next) => {
  try {
    const counterId = req.params.id;
    res.status(200).json(await getTicket(counterId as string));
  } catch (error) {
    next(error);
  }
});

// Get the next ticket in the queue
// GET /next?counterId={counterId}
router.get("/next", async (req, res, next) => {
  try {
    const counterId = req.query.counterId;

    throwBadRequestIfMissing(
      [counterId],
      (x) => !x,
      () => "counterId query parameter is required"
    );

    res.status(200).json(await nextTicket(counterId as string));
  } catch (error) {
    next(error);
  }
});

//POST /api/tickets/new with { serviceTypeId: string } in body
router.post("/new", async (req, res, next) => {
     try {
        const { serviceTypeId } = req.body;
      res.status(200).json(await createTicket(serviceTypeId));
    } catch (error) {
      next(error);
    }
});

export default router;
