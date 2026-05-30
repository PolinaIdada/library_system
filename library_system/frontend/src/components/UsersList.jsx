import { useState, useEffect } from 'react';
import axios from 'axios';
import UserModal from './UserModal';

function UsersList({ token }) {
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({});

    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Ошибка загрузки пользователей:', err);
        }
    };

    const handleAddUser = async (userData) => {
        try {
            await api.post('/users', userData);
            setShowModal(false);
            loadUsers();
            alert('Читатель добавлен');
        } catch (err) {
            alert('Ошибка добавления читателя');
        }
    };

    return (
        <div>
            <button onClick={() => setShowModal(true)}>+ Добавить читателя</button>
            <table>
                <thead>
                    <tr>
                        <th>ФИО</th>
                        <th>Логин</th>
                        <th>Студ. билет</th>
                        <th>Группа</th>
                        <th>Телефон</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.full_name}</td>
                            <td>{user.username}</td>
                            <td>{user.student_id}</td>
                            <td>{user.group_name}</td>
                            <td>{user.phone}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showModal && (
                <UserModal
                    formData={formData}
                    onSave={handleAddUser}
                    onClose={() => {
                        setShowModal(false);
                        setFormData({});
                    }}
                />
            )}
        </div>
    );
}

export default UsersList;