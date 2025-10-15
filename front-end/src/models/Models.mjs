export class Ticket {
  constructor(id, code, issuedAt, serviceId) {
    this.id = id;
    this.code = code;
    this.issuedAt = issuedAt;
    this.serviceId = serviceId;
  }
}

export class Counter {
  constructor(id, number) {
    this.id = id;
    this.number = number;
  }
}

export class Service {
  constructor(id, name, avg_service_time, description = null) {
    this.id = id;
    this.name = name;
    this.avg_service_time = avg_service_time;
    this.description = description;
  }
}
