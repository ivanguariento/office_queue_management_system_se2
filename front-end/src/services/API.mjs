// src/services/API.mjs
import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  timeout: 10000,
  headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

export default {
  async getServices() {
    const { data } = await http.get("/services");         // GET /api/services
    return data;                                           // [{ service_id, tag_name, ... }]
  },
  async createTicket(serviceTypeId) {
    const { data } = await http.post("/tickets/new", {     // POST /api/tickets/new
      "serviceTypeId": serviceTypeId,                                       // body { serviceTypeId: string }
    });
    console.log(data);
    return data;                                           // created ticket
  },
  async getNextForCounter(counterId) {
    const { data } = await http.get("/tickets/next", { params: { counterId } });
    return data;
  },
  async getTicketById(id) {
    const { data } = await http.get(`/tickets/${id}`);
    return data;
  },
};
