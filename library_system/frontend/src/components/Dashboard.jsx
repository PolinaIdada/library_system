import { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ user, token }) {
    const [stats, setStats] = useState({});
    const [showModal, setShowModal] = useState(false);

    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        if (user.role === 'admin' || user.role === 'librarian') {
            loadStats();
        }
    }, []);

    const loadStats = async () => {
        try {
            const res = await api.get('/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Ошибка загрузки статистики:', err);
        }
    };

    if (user.role === 'admin' || user.role === 'librarian') {
        return (
            <div>
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>{stats.total_books || 0}</h3>
                        <p>Всего книг</p>
                    </div>
                    <div className="stat-card">
                        <h3>{stats.total_available || 0}</h3>
                        <p>Доступно</p>
                    </div>
                    <div className="stat-card">
                        <h3>{stats.total_loans || 0}</h3>
                        <p>Выдано</p>
                    </div>
                    <div className="stat-card">
                        <h3 className="overdue">{stats.overdue_loans || 0}</h3>
                        <p>Просрочено</p>
                    </div>
                </div>
                <button onClick={() => setShowModal(true)}>+ Добавить книгу</button>
            </div>
        );
    }

    return (
        <div className="stat-card">
            <h3>Добро пожаловать, {user.full_name}!</h3>
            <p>Используйте меню слева для просмотра каталога</p>
        </div>
    );
}

export default Dashboard;