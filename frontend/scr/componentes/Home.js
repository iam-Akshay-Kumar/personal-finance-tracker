import React from "react";
import { Link } from "react-router-dom";
import { Wallet, TrendingUp, Shield, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 relative overflow-hidden">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob top-0 -left-20"></div>
        <div className="absolute w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 top-0 right-20"></div>
        <div className="absolute w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 bottom-20 left-1/2"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-2 text-white">
            <Wallet size={32} />
            <span className="text-2xl font-bold">FinanceFlow</span>
          </div>
          <div className="flex gap-4">
            <Link 
              to="/login" 
              className="text-white hover:text-purple-200 transition px-4 py-2"
            >
              Login
            </Link>
            <Link 
              to="/register" 
              className="bg-white text-purple-700 hover:bg-purple-50 transition px-6 py-2 rounded-lg font-medium"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
          <div className="mb-8 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
            <Zap size={16} className="text-yellow-300" />
            Track. Analyze. Grow.
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Take Control of
            <br />
            <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
              Your Finances
            </span>
          </h1>

          <p className="text-xl text-purple-100 mb-12 max-w-2xl">
            A modern, intuitive expense tracker that helps you understand your spending habits and achieve your financial goals.
          </p>

          <div className="flex gap-4">
            <Link 
              to="/register" 
              className="group bg-white text-purple-700 hover:bg-purple-50 transition-all px-8 py-4 rounded-xl font-semibold text-lg flex items-center gap-2 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              Start Free Today
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </Link>
            <Link 
              to="/login" 
              className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-all px-8 py-4 rounded-xl font-semibold text-lg border border-white/20"
            >
              Sign In
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-8 mt-20 max-w-4xl">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="text-white" size={24} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Smart Insights</h3>
              <p className="text-purple-200 text-sm">
                Get intelligent analytics on your spending patterns and income trends
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Shield className="text-white" size={24} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Secure & Private</h3>
              <p className="text-purple-200 text-sm">
                Bank-level encryption keeps your financial data safe and secure
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mb-4">
                <Wallet className="text-white" size={24} />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Easy Tracking</h3>
              <p className="text-purple-200 text-sm">
                Effortlessly track income and expenses with our intuitive interface
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}