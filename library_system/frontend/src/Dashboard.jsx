import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function Dashboard({ user, onLogout }) {
    const [token] = useState(localStorage.getItem('token'));
    const [activeTab, setActiveTab] = useState('dashboard');
    const [books, setBooks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loans, setLoans] = useState([]);
    const [stats, setStats] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [formData, setFormData] = useState({});

    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            if (activeTab === 'dashboard' && (user.role === 'admin' || user.role === 'librarian')) {
                const statsRes = await api.get('/stats');
                setStats(statsRes.data);
            }
            if (activeTab === 'books') {
                const booksRes = await api.get('/books');
                setBooks(booksRes.data);
            }
            if (activeTab === 'users' && (user.role === 'admin' || user.role === 'librarian')) {
                const usersRes = await api.get('/users');
                setUsers(usersRes.data);
            }
            if (activeTab === 'loans') {
                const loansRes = await api.get('/loans');
                setLoans(loansRes.data);
            }
        } catch (err) {
            console.error('Ошибка загрузки:', err);
        }
    };

    const handleAddBook = async () => {
        try {
            await api.post('/books', {
                title: formData.title,
                author: formData.author,
                year: formData.year,
                publisher: formData.publisher,
                copies: formData.copies,
                location: formData.location
            });
            setShowModal(false);
            setFormData({});
            loadData();
            alert('Книга добавлена');
        } catch (err) {
            alert('Ошибка добавления книги');
        }
    };

    const handleAddUser = async () => {
        try {
            await api.post('/users', {
                username: formData.username,
                password: formData.password,
                full_name: formData.full_name,
                student_id: formData.student_id,
                group_name: formData.group_name,
                phone: formData.phone
            });
            setShowModal(false);
            setFormData({});
            loadData();
            alert('Читатель добавлен');
        } catch (err) {
            alert('Ошибка добавления читателя');
        }
    };

    const handleCheckout = async (bookId, userId) => {
        try {
            await api.post('/loans/checkout', { user_id: userId, book_id: bookId });
            loadData();
            alert('Книга выдана');
        } catch (err) {
            alert(err.response?.data?.message || 'Ошибка');
        }
    };

    const handleReturn = async (loanId) => {
        try {
            const res = await api.post('/loans/return', { loan_id: loanId });
            alert(`Книга возвращена. Штраф: ${res.data.fine} руб.`);
            loadData();
        } catch (err) {
            alert('Ошибка при возврате');
        }
    };

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
                    <button onClick={onLogout} className="logout-btn">Выйти</button>
                </div>

                {activeTab === 'dashboard' && (
                    <div>
                        {(user.role === 'admin' || user.role === 'librarian') ? (
                            <>
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
                                <button onClick={() => { setModalType('book'); setShowModal(true); }}>+ Добавить книгу</button>
                            </>
                        ) : (
                            <div className="stat-card">
                                <h3>Добро пожаловать, {user.full_name}!</h3>
                                <p>Используйте меню слева для просмотра каталога</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'books' && (
                    <div>
                        {(user.role === 'admin' || user.role === 'librarian') && (
                            <button onClick={() => { setModalType('book'); setShowModal(true); }}>+ Добавить книгу</button>
                        )}
                        <table>
                            <thead>
                                <tr>
                                    <th>Название</th>
                                    <th>Автор</th>
                                    <th>Год</th>
                                    <th>Доступно</th>
                                    {(user.role === 'admin' || user.role === 'librarian') && <th>Действия</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {books.map(book => (
                                    <tr key={book.id}>
                                        <td>{book.title}</td>
                                        <td>{book.author}</td>
                                        <td>{book.year}</td>
                                        <td>{book.available_copies}/{book.copies}</td>
                                        {(user.role === 'admin' || user.role === 'librarian') && (
                                            <td>
                                                <button onClick={() => {
                                                    const userId = prompt('Введите ID читателя:');
                                                    if (userId) handleCheckout(book.id, parseInt(userId));
                                                }}>Выдать</button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'users' && (user.role === 'admin' || user.role === 'librarian') && (
                    <div>
                        <button onClick={() => { setModalType('user'); setShowModal(true); }}>+ Добавить читателя</button>
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
                                {users.map(userItem => (
                                    <tr key={userItem.id}>
                                        <td>{userItem.full_name}</td>
                                        <td>{userItem.username}</td>
                                        <td>{userItem.student_id}</td>
                                        <td>{userItem.group_name}</td>
                                        <td>{userItem.phone}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'loans' && (
                    <div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Читатель</th>
                                    <th>Книга</th>
                                    <th>Дата выдачи</th>
                                    <th>Срок возврата</th>
                                    <th>Штраф</th>
                                    {(user.role === 'admin' || user.role === 'librarian') && <th>Действия</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {loans.map(loan => (
                                    <tr key={loan.id} className={!loan.return_date && new Date(loan.due_date) < new Date() ? 'overdue-row' : ''}>
                                        <td>{loan.user_name}</td>
                                        <td>{loan.book_title}</td>
                                        <td>{loan.loan_date}</td>
                                        <td>{loan.due_date}</td>
                                        <td>{loan.fine} руб.</td>
                                        {(user.role === 'admin' || user.role === 'librarian') && !loan.return_date && (
                                            <td>
                                                <button onClick={() => handleReturn(loan.id)}>Вернуть</button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {showModal && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3>{modalType === 'book' ? 'Добавить книгу' : 'Добавить читателя'}</h3>
                            {modalType === 'book' && (
                                <>
                                    <input placeholder="Название" onChange={e => setFormData({...formData, title: e.target.value})} />
                                    <input placeholder="Автор" onChange={e => setFormData({...formData, author: e.target.value})} />
                                    <input placeholder="Год" type="number" onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
                                    <input placeholder="Количество" type="number" onChange={e => setFormData({...formData, copies: parseInt(e.target.value)})} />
                                    <input placeholder="Издательство" onChange={e => setFormData({...formData, publisher: e.target.value})} />
                                    <input placeholder="Местоположение" onChange={e => setFormData({...formData, location: e.target.value})} />
                                </>
                            )}
                            {modalType === 'user' && (
                                <>
                                    <input placeholder="Логин" onChange={e => setFormData({...formData, username: e.target.value})} />
                                    <input placeholder="Пароль" type="password" onChange={e => setFormData({...formData, password: e.target.value})} />
                                    <input placeholder="ФИО" onChange={e => setFormData({...formData, full_name: e.target.value})} />
                                    <input placeholder="Номер студ. билета" onChange={e => setFormData({...formData, student_id: e.target.value})} />
                                    <input placeholder="Группа" onChange={e => setFormData({...formData, group_name: e.target.value})} />
                                    <input placeholder="Телефон" onChange={e => setFormData({...formData, phone: e.target.value})} />
                                </>
                            )}
                            <div className="modal-buttons">
                                <button onClick={() => modalType === 'book' ? handleAddBook() : handleAddUser()}>Сохранить</button>
                                <button onClick={() => setShowModal(false)}>Отмена</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Dashboard;