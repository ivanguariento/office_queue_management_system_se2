import { Router } from "express";
import { createTicket } from "../controllers/ticketController";

const router = Router();

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