import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router';
import Login from './pages/Login/index.jsx';
import Register from './pages/Register/index.jsx';
import DrawPage from './pages/DrawPage/index.jsx';
import ProfilePage from './pages/ProfilePage/index.jsx';

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