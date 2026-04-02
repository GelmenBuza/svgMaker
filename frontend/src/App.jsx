import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import DrawPage from './pages/DrawPage';

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/draw" element={<DrawPage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App