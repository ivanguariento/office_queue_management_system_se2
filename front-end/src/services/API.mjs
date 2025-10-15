import { Ticket } from "../models/Models.mjs";

const API_URL = "http://localhost";
const API_PORT = 3000;
const BASE_URL = "/api/v1";
const SERVER_URL = `${API_URL}:${API_PORT}${BASE_URL}`;

// Tickets

const getTicket = async (ticketId) => {
  const response = await fetch(`${SERVER_URL}/tickets/${ticketId}`, {
    method: "GET",
  });
  const { ticket } = await response.json();

  if (!response.ok) throw ticket;
  return new Ticket(ticket.id, ticket.code, ticket.issuedAt, ticket.serviceId);
};

const createTicket = async (data) => {
  const response = await fetch(`${SERVER_URL}/tickets/new`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const res = await response.json();

  if (!response.ok) throw res;
  return new Ticket(res.ticketId, res.ticketCode, res.issuedAt, res.serviceId);
};

// Services

const getServices = async () => {
  const response = await fetch(`${SERVER_URL}/services`, {
    method: "GET",
  });
  const { length } = await response.json();

  if (!response.ok) throw length;
  return length;
};

const getQueueLength = async (serviceId) => {
  const response = await fetch(
    // `${SERVER_URL}/services/${serviceId}/queue_length`, // TODO: change API
    `${SERVER_URL}/services/${serviceId}`,
    {
      method: "GET",
    }
  );
  const { length } = await response.json();

  if (!response.ok) throw length;
  return length;
};

// Counters

// TODO: create this new API
/*
const getCounter = async (counterId) => {
  const response = await fetch(`${SERVER_URL}/counters/${counterId}`, {
    method: "GET",
  });
  const { services } = await response.json();

  if (!response.ok) throw services;
  return services.map((service) => new Service(service.id, service.name));
};

const getCounterServices = async (counterId) => {
  const response = await fetch(`${SERVER_URL}/counters/${counterId}/services`, {
    method: "GET",
  });
  const { services } = await response.json();

  if (!response.ok) throw services;
  return services.map((service) => new Service(service.id, service.name));
};
*/

// TODO: use this new API
/*
const getNextClient = async (counterId) => {
  const response = await fetch(
    `${SERVER_URL}/counters/${counterId}/next_client`,
    { method: "GET" }
  );
  const { ticket } = await response.json();

  if (!response.ok) throw ticket;
  return new Ticket(ticket.id, ticket.code, ticket.issuedAt, ticket.serviceId);
};
*/

const API = {
  // Tickets
  getTicket,
  createTicket,
  // Services
  getServices,
  getQueueLength,
  // Counters
  /*
  getCounter,
  getCounterServices,
  getNextClient,
  */
};
export default API;
