import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import { Simulator } from './pages/Simulator';
import QuotePage from './pages/QuotePage';
import FrameManager from './pages/admin/FrameManager';
import PaperManager from './pages/admin/PaperManager';
import AdminDashboard from './pages/admin/AdminDashboard';
import { Partners, Contact } from './pages/Placeholders';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/orcamento" element={<QuotePage />} />
        <Route path="/simulador" element={<Simulator />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/molduras" element={<FrameManager />} />
        <Route path="/admin/papeis" element={<PaperManager />} />
        <Route path="/parceiros" element={<Partners />} />
        <Route path="/contato" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
