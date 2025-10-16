import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, DollarSign, ClipboardCheck, CheckCircle } from "lucide-react";
import API from "../services/API.mjs";

const iconForService = (s) => {
  const key = (s.tag_name || s.name || "").toLowerCase();
  if (key.includes("mail")) return <Mail className="w-10 h-10 text-blue-600" />;
  if (key.includes("pay") || key.includes("account"))
    return <DollarSign className="w-10 h-10 text-blue-600" />;
  return <ClipboardCheck className="w-10 h-10 text-blue-600" />;
};

export default function TicketPage() {
  const [ticket, setTicket] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        // const list = await API.getServices(); // [{ service_id, tag_name, description, ... }]
        // setServices(list);
        setServices([
          {
            service_id: 1,
            tag_name: "Mail & Delivery",
            description: "Send or receive packages quickly and securely.",
          },
          {
            service_id: 2,
            tag_name: "Payments & Accounts",
            description: "Manage deposits, bills, or account inquiries.",
          },
          {
            service_id: 3,
            tag_name: "Information & Support",
            description: "Ask questions and get help from our staff.",
          },
        ]);
      } catch (e) {
        setErr(
          e?.response?.data?.message || e?.message || "Failed to load services"
        );
      }
    })();
  }, []);

  const handleGetTicket = async (service) => {
    try {
      setLoading(true);
      setErr(null);
      const created = await API.createTicket(service.service_id); // serviceTypeId

      setTicket({
        id: created.ticket_id,
        code: created.ticket_code,
        issuedAt: created.issued_at,
        serviceId: created.service_id,
      });
    } catch (e) {
      setErr(
        e?.response?.data?.message || e?.message || "Failed to create ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white text-slate-800 flex flex-col">
      <header className="text-center py-10 border-b border-blue-100">
        <h1 className="text-4xl font-bold text-blue-700 mb-2">
          Get Your Ticket
        </h1>
        <p className="text-slate-600">
          Select a service to get your queue number
        </p>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-8 py-12">
        {err && <div className="mb-4 text-red-600">{err}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service) => (
            <motion.div
              key={service.service_id}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center text-center hover:shadow-lg transition"
            >
              {iconForService(service)}
              <h3 className="text-xl font-semibold mt-4">{service.tag_name}</h3>
              <p className="text-slate-600 text-sm mt-2 mb-4">
                {service.description || " "}
              </p>
              <button
                onClick={() => handleGetTicket(service)}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-5 py-2 transition disabled:opacity-60"
              >
                {loading ? "Generating..." : "Get Ticket"}
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      {ticket && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-blue-700 mb-2">
              Ticket Issued!
            </h2>
            <p className="text-slate-600 mb-4">
              You selected{" "}
              <span className="font-semibold">
                {
                  services.find((s) => s.service_id === ticket.serviceId)
                    ?.tag_name
                }
              </span>
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

      <footer className="text-center py-4 border-t border-blue-100 text-slate-500 text-sm">
        Office Queue Management System © 2025
      </footer>
    </div>
  );
}
