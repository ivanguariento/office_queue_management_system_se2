import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Briefcase, BarChart3 } from "lucide-react";

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 1,
      icon: <User className="w-12 h-12 text-blue-600" />,
      name: "Customer",
      desc: "Get a queue ticket and wait for your turn.",
      path: "/ticket",
    },
    {
      id: 2,
      icon: <Briefcase className="w-12 h-12 text-blue-600" />,
      name: "Officer",
      desc: "Manage counters and serve waiting customers.",
      path: "/counter/1", // TEMP: Default to counter 1 for demo purposes
    },
    {
      id: 3,
      icon: <BarChart3 className="w-12 h-12 text-blue-600" />,
      name: "Manager",
      desc: "View analytics and daily queue performance.",
      path: "/manager",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col text-slate-800">
      {/* Header */}
      <header className="text-center py-10 border-b border-blue-100">
        <h1 className="text-4xl font-bold text-blue-700 mb-2">
          Select Your Role
        </h1>
        <p className="text-slate-600">
          Choose how you’d like to use the Office Queue Management System
        </p>
      </header>

      {/* Role cards */}
      <main className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl w-full">
          {roles.map((role) => (
            <motion.div
              key={role.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 200 }}
              onClick={() => navigate(role.path)}
              className="cursor-pointer bg-white rounded-2xl shadow-md hover:shadow-lg p-10 flex flex-col items-center text-center transition"
            >
              {role.icon}
              <h3 className="text-2xl font-semibold mt-5 text-slate-900">
                {role.name}
              </h3>
              <p className="text-slate-600 mt-3 text-sm mb-4">{role.desc}</p>
              <motion.button
                whileHover={{ scale: 1.08 }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 mt-4 font-medium"
              >
                Continue
              </motion.button>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 border-t border-blue-100 text-slate-500 text-sm">
        Office Queue Management System © 2025
      </footer>
    </div>
  );
}
