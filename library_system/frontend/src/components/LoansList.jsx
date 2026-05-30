import { useState, useEffect } from 'react';
import axios from 'axios';

function LoansList({ user, token }) {
    const [loans, setLoans] = useState([]);
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedLoanId, setSelectedLoanId] = useState(null);
    const [bookCondition, setBookCondition] = useState('good');
    const [processing, setProcessing] = useState(false);

    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => {
        loadLoans();
    }, []);

    const loadLoans = async () => {
        try {
            const res = await api.get('/loans');
            setLoans(res.data);
        } catch (err) {
            console.error('Ошибка загрузки операций:', err);
        }
    };

    const openReturnModal = (loanId) => {
        setSelectedLoanId(loanId);
        setBookCondition('good');
        setReturnModalOpen(true);
    };

    const submitReturn = async () => {
        if (processing) return;
        setProcessing(true);
        try {
            const res = await api.post('/loans/return', {
                loan_id: selectedLoanId,
                condition: bookCondition
            });
            alert(`Книга принята. Штраф: ${res.data.fine} руб.`);
            setReturnModalOpen(false);
            loadLoans();
        } catch (err) {
            alert(err.response?.data?.message || 'Ошибка при возврате');
        } finally {
            setProcessing(false);
        }
    };

    const isOverdue = (dueDate) => new Date(dueDate) < new Date();

    return (
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
                        <tr
                            key={loan.id}
                            className={!loan.return_date && isOverdue(loan.due_date) ? 'overdue-row' : ''}
                        >
                            <td>{loan.user_name}</td>
                            <td>{loan.book_title}</td>
                            <td>{loan.loan_date}</td>
                            <td>{loan.due_date}</td>
                            <td>{loan.fine} руб.</td>
                            {(user.role === 'admin' || user.role === 'librarian') && !loan.return_date && (
                                <td>
                                    <button onClick={() => openReturnModal(loan.id)}>Вернуть</button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>

            {returnModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Приём книги</h3>
                        <p style={{ marginBottom: '10px' }}>Оцените состояние возвращённой книги:</p>
                        <label style={{ display: 'block', margin: '5px 0' }}>
                            <input type="radio" name="condition" value="good" checked={bookCondition === 'good'} onChange={e => setBookCondition(e.target.value)} />
                            В хорошем состоянии
                        </label>
                        <label style={{ display: 'block', margin: '5px 0' }}>
                            <input type="radio" name="condition" value="damaged" checked={bookCondition === 'damaged'} onChange={e => setBookCondition(e.target.value)} />
                            С повреждениями (+500 ₽)
                        </label>
                        <label style={{ display: 'block', margin: '5px 0' }}>
                            <input type="radio" name="condition" value="lost" checked={bookCondition === 'lost'} onChange={e => setBookCondition(e.target.value)} />
                            Утеряна / критически повреждена (+1500 ₽)
                        </label>
                        <div className="modal-buttons">
                            <button onClick={submitReturn} disabled={processing}>{processing ? 'Обработка...' : 'Принять'}</button>
                            <button onClick={() => setReturnModalOpen(false)} disabled={processing}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LoansList;