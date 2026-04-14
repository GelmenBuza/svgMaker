import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import DrawPage from './pages/DrawPage';
import ProfilePage from './pages/ProfilePage';

function App() {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/draw" element={<DrawPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App