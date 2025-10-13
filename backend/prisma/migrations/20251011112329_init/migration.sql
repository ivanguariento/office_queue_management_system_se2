-- CreateTable
CREATE TABLE "Counter" (
    "counter_id" UUID NOT NULL,
    "counter_number" INTEGER NOT NULL,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("counter_id")
);

-- CreateTable
CREATE TABLE "CounterService" (
    "counter_service_id" UUID NOT NULL,
    "counter_id" UUID NOT NULL,
    "service_id" UUID NOT NULL,

    CONSTRAINT "CounterService_pkey" PRIMARY KEY ("counter_service_id")
);

-- CreateTable
CREATE TABLE "ServiceType" (
    "service_id" UUID NOT NULL,
    "tag_name" TEXT NOT NULL,
    "average_service_time" INTEGER NOT NULL,
    "description" TEXT,

    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "ticket_id" UUID NOT NULL,
    "ticket_code" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "service_id" UUID NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("ticket_id")
);

-- CreateTable
CREATE TABLE "ServedTicket" (
    "served_ticket_id" UUID NOT NULL,
    "ticket_id" UUID NOT NULL,
    "counter_id" UUID NOT NULL,
    "served_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "ServedTicket_pkey" PRIMARY KEY ("served_ticket_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Counter_counter_number_key" ON "Counter"("counter_number");

-- CreateIndex
CREATE UNIQUE INDEX "CounterService_counter_id_service_id_key" ON "CounterService"("counter_id", "service_id");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceType_tag_name_key" ON "ServiceType"("tag_name");

-- AddForeignKey
ALTER TABLE "CounterService" ADD CONSTRAINT "CounterService_counter_id_fkey" FOREIGN KEY ("counter_id") REFERENCES "Counter"("counter_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CounterService" ADD CONSTRAINT "CounterService_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "ServiceType"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "ServiceType"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServedTicket" ADD CONSTRAINT "ServedTicket_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "Ticket"("ticket_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServedTicket" ADD CONSTRAINT "ServedTicket_counter_id_fkey" FOREIGN KEY ("counter_id") REFERENCES "Counter"("counter_id") ON DELETE CASCADE ON UPDATE CASCADE;
