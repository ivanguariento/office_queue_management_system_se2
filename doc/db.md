# Office Queue Management System

## Class Diagram

``` mermaid
classDiagram

    Counter "*" --> "1..*" ServiceType : handles
    Counter "1" --> "*" ServedTicket : serves
    QueueService "1" --> "*" Ticket : contains
    ServiceType "1" --> "*" Ticket : requested_by
    Ticket "1" --> "0..1" ServedTicket : fulfilled_by

    class Counter {
        int counter_id
        int counter_number
    }

    class ServiceType {
        int service_id
        string tag_name
        int average_service_time
        string description
    }
    
    class Ticket {
        int ticket_id
        string ticket_code
        string status "Open Close TODO: discuss"
        datetime issued_at
        int service_id
    }

    %% class QueueService {
    %%     int service_id
    %%     int ticket_id
    %%     int queue_length
    %%     datetime last_updated
    %% }"

    class ServedTicket {
        int served_ticket_id
        int ticket_id
        int counter_id
        datetime served_at
        datetime ended_at
    }
```

## ER Diagram

``` mermaid
erDiagram
    COUNTER }|--o{ COUNTERSERVICE : handles
    COUNTERSERVICE }|--o{ SERVICETYPE : handles
    COUNTER ||--o{ SERVEDTICKET : serves
    SERVICETYPE ||--o{ TICKET : requested_by
    TICKET ||--o| SERVEDTICKET : fulfilled_by

    COUNTER {
        int counter_id
        int counter_number
    }
    
    COUNTERSERVICE {
        int counter_id
        int service_id
    }

    SERVICETYPE {
        int service_id
        string tag_name
        int average_service_time
        string description
    }

    TICKET {
        int ticket_id
        string ticket_code
        datetime issued_at
        int service_id
    }

    SERVEDTICKET {
        int served_ticket_id
        int ticket_id
        int counter_id
        datetime served_at
        datetime ended_at
    }

```
# Configuration PostGreSQL + Prisma 

#### 1. Start Database with Docker
```
docker-compose up -d
```
#### 2. Generate Prisma Client
```
npx prisma generate
```

#### 3. Apply migrations
```
npx prisma migrate dev --name init
```
#### 2. View tables of Database
```
npx prisma studio
```
- `http://localhost:5555`.
