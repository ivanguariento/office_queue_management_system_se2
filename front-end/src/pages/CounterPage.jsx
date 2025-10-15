import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { motion } from "framer-motion";
import { Mail, DollarSign, ClipboardCheck } from "lucide-react";

import API from "../services/API.mjs";

function CounterPage() {
  const [counter, setCounter] = useState(null);
  const [ticket, setTicket] = useState(null);
  const [services, setServices] = useState([]);
  const { id } = useParams(); // Get the id from the URL

  useEffect(() => {
    async function fetchCounter(counterId) {
      try {
        /* 
        const counter = await API.getCounter(counterId);
        setCounter(counter);
        
        const services = await API.getCounterServices(counterId);
        setServices(services);
        */
        // Simulate fetching counter and their services
        // /*
        setCounter({
          id: id,
          number: 1,
        });

        setServices([
          {
            id: 1,
            name: "Mail & Delivery",
            avg_service_time: 15,
            description: "Send or receive packages quickly and securely.",
            icon: <Mail className="w-10 h-10 text-blue-600 mx-auto" />,
          },
          {
            id: 2,
            name: "Payments & Accounts",
            description: "Manage deposits, bills, or account inquiries.",
            icon: <DollarSign className="w-10 h-10 text-blue-600 mx-auto" />,
          },
        ]);
        // */
      } catch (err) {
        console.debug(`Error fetching counter ${counterId}:`, err);
      }
    }

    fetchCounter(id);
  }, [id]);

  const nextCustomer = async () => {
    try {
      // const ticket = await API.getNextClient(counter.id);
      // setTicket(ticket);

      setTicket({
        id: 1,
        code: "A001",
        issuedAt: new Date().toISOString(),
        serviceId: 1,
      });
    } catch (err) {
      console.debug(`Error fetching next customer:`, err);
    }
  };

  const finishService = async () => {
    setTicket(null);
  };

  const serviceName =
    ticket && services.find((s) => s.id === ticket.serviceId)?.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white text-slate-800 flex flex-col">
      <header className="text-center py-10 border-b border-blue-100">
        <h1 className="text-4xl font-bold text-blue-700 mb-2">
          Counter {counter?.number}
        </h1>
        <p className="text-slate-600">
          This counter serves the following services:
        </p>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-12 text-center">
        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-fr mb-6">
          {services.map((service, i) => {
            const isActive = ticket && ticket.serviceId === service.id;
            return (
              <div
                key={i}
                className={`bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition text-center ${
                  isActive ? "ring-4 ring-blue-600" : ""
                  // isActive ? "border-4 border-blue-600" : "opacity-60"
                } `}
              >
                <div>
                  {service.icon}
                  <h4 className="text-xl font-semibold mt-4 mb-2">
                    {service.name}
                  </h4>
                  <p className="text-slate-600 text-sm">
                    {service.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Customer Button */}
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-xl transition"
          onClick={nextCustomer}
          disabled={ticket}
        >
          Next Customer
        </button>
      </main>
      {/* Footer */}
      <footer className="text-center py-4 border-t border-blue-100 text-slate-500 text-sm">
        Office Queue Management System © 2025
      </footer>

      {/* Display Ticket Information */}
      {ticket && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in duration-300">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <span className="text-2xl">👤</span>
              </div>
              <h3 className="text-2xl font-bold text-blue-700 mb-2">
                Serving Ticket:{" "}
                <span className="text-blue-900">{ticket.code}</span>
              </h3>
              <div className="mt-4 space-y-2">
                <p className="text-slate-600">
                  Service: <span className="font-semibold">{serviceName}</span>
                </p>
                <p className="text-slate-500 text-sm">
                  Issued at: {new Date(ticket.issuedAt).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={finishService}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 rounded-xl transition"
              >
                Complete Service
                {/* Done */}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CounterPage;
