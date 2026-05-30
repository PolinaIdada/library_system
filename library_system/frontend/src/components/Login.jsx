import { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
    const [loginData, setLoginData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/login', loginData);
            onLogin(res.data.token, res.data.user);
        } catch (err) {
            setError('Неверный логин или пароль');
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleSubmit} className="login-form">
                <h2>📚 Библиотека ВУЗа</h2>
                <input
                    type="text"
                    placeholder="Логин"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    required
                />
                <input
                    type="password"
                    placeholder="Пароль"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                />
                <button type="submit">Войти</button>
                {error && <div className="error">{error}</div>}
                <div style={{ marginTop: '15px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
                    <p><strong>Тестовые учетные записи:</strong></p>
                    <p>admin / admin123</p>
                    <p>librarian / lib123</p>
                    <p>student1 / reader123</p>
                </div>
            </form>
        </div>
    );
}

export default Login;