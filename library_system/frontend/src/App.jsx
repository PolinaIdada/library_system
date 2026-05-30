import { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import BooksList from './components/BooksList';
import UsersList from './components/UsersList';
import LoansList from './components/LoansList';
import BookModal from './components/BookModal';
import UserModal from './components/UserModal';
import BookViewModal from './components/BookViewModal';
import './App.css';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser && token) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, [token]);

    const handleLogin = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(token);
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    if (!token || !user) {
        return <Login onLogin={handleLogin} />;
    }

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    return (
        <div className="main-container">
            <div className="sidebar">
                <h3>📚 Библиотека</h3>
                <button onClick={() => setActiveTab('dashboard')}>Главная</button>
                <button onClick={() => setActiveTab('books')}>Книги</button>
                {(user.role === 'admin' || user.role === 'librarian') && (
                    <button onClick={() => setActiveTab('users')}>Читатели</button>
                )}
                <button onClick={() => setActiveTab('loans')}>Операции</button>
            </div>

            <div className="content">
                <div className="header">
                    <div className="user-info">
                        👋 {user.full_name} ({user.role === 'admin' ? 'Администратор' : user.role === 'librarian' ? 'Библиотекарь' : 'Читатель'})
                    </div>
                    <button onClick={handleLogout} className="logout-btn">Выйти</button>
                </div>

                {activeTab === 'dashboard' && (
                    <Dashboard user={user} token={token} />
                )}

                {activeTab === 'books' && (
                    <BooksList user={user} token={token} />
                )}

                {activeTab === 'users' && (user.role === 'admin' || user.role === 'librarian') && (
                    <UsersList token={token} />
                )}

                {activeTab === 'loans' && (
                    <LoansList user={user} token={token} />
                )}
            </div>
        </div>
    );
}

export default App;