import { motion } from "framer-motion";
import { Users, Clock, BarChart3 } from "lucide-react";
import heroImg from "../assets/hero.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white text-slate-800">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 border-b border-blue-100 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-blue-700">
          Office Queue Management
        </h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl px-5 py-2 transition">
          Get Started
        </button>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row justify-between items-center px-8 py-20 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-xl"
        >
          <h2 className="text-5xl font-bold text-slate-900 mb-4 leading-tight">
            Manage Queues. <br /> Serve Smarter.
          </h2>
          <p className="text-slate-600 mb-6 text-lg">
            Streamline your office workflow, reduce wait times, and keep every
            counter efficient and organized — all in one system.
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-6 py-3 rounded-xl transition">
            Explore Dashboard
          </button>
        </motion.div>

        <motion.img
          src={heroImg}
          alt="Queue Management Illustration"
          className="w-[400px] mt-10 md:mt-0 rounded-2xl shadow-xl"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        />
      </section>

      {/* Features Section */}
      <section className="py-16 bg-blue-50 border-t border-b border-blue-100">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h3 className="text-3xl font-bold mb-10 text-blue-700">
            Why Choose OQMS?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-10 h-10 text-blue-600 mx-auto" />,
                title: "Smart Queue Management",
                desc: "Automatically assign tickets based on service type and counter availability.",
              },
              {
                icon: <Clock className="w-10 h-10 text-blue-600 mx-auto" />,
                title: "Real-Time Wait Estimates",
                desc: "Show customers accurate waiting times using predictive algorithms.",
              },
              {
                icon: <BarChart3 className="w-10 h-10 text-blue-600 mx-auto" />,
                title: "Insightful Analytics",
                desc: "Monitor daily, weekly, and monthly service statistics effortlessly.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md p-8 hover:shadow-lg transition text-center"
              >
                {feature.icon}
                <h4 className="text-xl font-semibold mt-4 mb-2">
                  {feature.title}
                </h4>
                <p className="text-slate-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="text-center py-6 border-t border-blue-100 text-slate-500 text-sm">
        Office Queue Management System — Version 2.2.0 © 2025
      </footer>
    </div>
  );
}
