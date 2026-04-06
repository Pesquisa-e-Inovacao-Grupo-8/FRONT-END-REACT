import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/home/Navbar";
import Sidebar from "./components/admin/Sidebar";
import AgendamentosPage from "./pages/admin/Agendamentos";
import Home from "./pages/Home";

const LayoutNavbar = () => (
  <>
    <Navbar />
    <Outlet />
  </>
);

const LayoutSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="content-admin" style={{ flex: 1, transition: 'margin-left 0.3s' }}>
        <button 
          className="hamburger-btn" 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed', 
            top: '10px', 
            left: '10px', 
            zIndex: 2001, 
            background: '#333', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            paddingBottom: '5px',
            cursor: 'pointer',
            fontSize: '20px',
            transition: 'all 0.6s ease'
          }}
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <Outlet />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutNavbar />}>
          <Route index element={<Home />} />
          <Route path="servicos" element={<h1>Serviços</h1>} />
          <Route path="agendamento" element={<h1>Agendamento</h1>} />
          <Route path="agendamentos" element={<h1>Agendamentos</h1>} />
        </Route>
        <Route path="/admin" element={<LayoutSidebar />}>
          <Route path="agendamentos" element={<AgendamentosPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}