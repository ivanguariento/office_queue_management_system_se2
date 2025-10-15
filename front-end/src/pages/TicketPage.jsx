import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Package, DollarSign, ClipboardCheck, CheckCircle } from "lucide-react";

export default function TicketPage() {
  const [ticket, setTicket] = useState(null);

  const services = [
    {
      id: 1,
      icon: <Mail className="w-10 h-10 text-blue-600" />,
      name: "Mail & Delivery",
      desc: "Send or receive packages quickly and securely.",
    },
    {
      id: 2,
      icon: <DollarSign className="w-10 h-10 text-blue-600" />,
      name: "Payments & Accounts",
      desc: "Manage deposits, bills, or account inquiries.",
    },
    {
      id: 3,
      icon: <ClipboardCheck className="w-10 h-10 text-blue-600" />,
      name: "Information & Support",
      desc: "Ask questions and get help from our staff.",
    },
  ];

  const handleGetTicket = (service) => {
    const ticketCode = `${service.name[0]}${Math.floor(100 + Math.random() * 900)}`;
    setTicket({ code: ticketCode, service: service.name });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white text-slate-800 flex flex-col">
      {/* Header */}
      <header className="text-center py-10 border-b border-blue-100">
        <h1 className="text-4xl font-bold text-blue-700 mb-2">Get Your Ticket</h1>
        <p className="text-slate-600">Select a service to get your queue number</p>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-lg transition"
            >
              {service.icon}
              <h3 className="text-xl font-semibold mt-4">{service.name}</h3>
              <p className="text-slate-600 text-sm mt-2 mb-4">{service.desc}</p>
              <button
                onClick={() => handleGetTicket(service)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2 transition"
              >
                Get Ticket
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Ticket confirmation */}
      {ticket && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-blue-700 mb-2">Ticket Issued!</h2>
            <p className="text-slate-600 mb-4">
              You selected <span className="font-semibold">{ticket.service}</span>
            </p>
            <div className="bg-blue-50 border border-blue-200 text-blue-800 text-3xl font-bold rounded-xl py-3 mb-6">
              {ticket.code}
            </div>
            <button
              onClick={() => setTicket(null)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2"
            >
              Done
            </button>
          </div>
        </motion.div>
      )}

      {/* Footer */}
      <footer className="text-center py-4 border-t border-blue-100 text-slate-500 text-sm">
        Office Queue Management System © 2025
      </footer>
    </div>
  );
}
