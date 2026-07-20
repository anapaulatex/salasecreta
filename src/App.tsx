import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import RaioXForm from './pages/RaioXForm'
import Relatorio from './pages/Relatorio'
import Admin from './pages/Admin'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/raio-x" element={<RaioXForm />} />
        <Route path="/relatorio/:id" element={<Relatorio />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}
