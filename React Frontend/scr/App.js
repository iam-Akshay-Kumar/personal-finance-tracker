import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Income from "./components/Income";
import Expenses from "./components/Expenses";
import BudgetManager from "./components/BudgetManager";
import Goals from "./components/Goals";
import Sidebar from "./components/Sidebar";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({
        token,
        username: localStorage.getItem("username"),
        email: localStorage.getItem("email"),
        profile_pic: localStorage.getItem("profile_pic")
      });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />}
        />

        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" /> : <Register setUser={setUser} />}
        />

        <Route
          path="/dashboard"
          element={
            user ? (
              <div className="flex h-screen">
                <Sidebar user={user} setUser={setUser}/>
                <div className="flex-1 p-6 overflow-auto">
                  <Dashboard />
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/income"
          element={
            user ? (
              <div className="flex h-screen">
                <Sidebar user={user} setUser={setUser} />
                <div className="flex-1 p-6 overflow-auto">
                  <Income />
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/expenses"
          element={
            user ? (
              <div className="flex h-screen">
                <Sidebar user={user} setUser={setUser}/>
                <div className="flex-1 p-6 overflow-auto">
                  <Expenses />
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/budget"
          element={
            user ? (
              <div className="flex h-screen">
                <Sidebar user={user} setUser={setUser}/>
                <div className="flex-1 overflow-auto">
                  <BudgetManager />
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/goals"
          element={
            user ? (
              <div className="flex h-screen">
                <Sidebar user={user} setUser={setUser}/>
                <div className="flex-1 overflow-auto">
                  <Goals />
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;