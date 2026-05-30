import { useState, useEffect } from 'react';
import axios from 'axios';
import BookModal from './BookModal';
import BookViewModal from './BookViewModal';

function BooksList({ user, token }) {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [selectedBook, setSelectedBook] = useState(null);
    const [formData, setFormData] = useState({});

    const [showIssueModal, setShowIssueModal] = useState(false);
    const [currentBookId, setCurrentBookId] = useState(null);
    const [readerSearch, setReaderSearch] = useState('');
    const [readersList, setReadersList] = useState([]);
    const [wishlistReaders, setWishlistReaders] = useState([]);
    const [filterWishlist, setFilterWishlist] = useState(false);

    const api = axios.create({
        baseURL: 'http://localhost:5000/api',
        headers: { Authorization: `Bearer ${token}` }
    });

    useEffect(() => { loadBooks(); }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredBooks(books);
        } else {
            const filtered = books.filter(book =>
                book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                book.author.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredBooks(filtered);
        }
    }, [searchTerm, books]);

    const loadBooks = async () => {
        try {
            const res = await api.get('/books');
            setBooks(res.data);
            setFilteredBooks(res.data);
        } catch (err) { console.error('Ошибка загрузки книг:', err); }
    };

    const loadReaders = async () => {
        try {
            const res = await api.get('/users');
            setReadersList(res.data);
        } catch (err) { console.error('Ошибка загрузки читателей:', err); }
    };

    const loadWishlist = async (bookId) => {
        try {
            const res = await api.get(`/books/${bookId}/wishlist`);
            setWishlistReaders(res.data.map(r => r.user_id));
        } catch { setWishlistReaders([]); }
    };

    const handleAddBook = async (bookData) => {
        try { await api.post('/books', bookData); setShowModal(false); loadBooks(); }
        catch { alert('Ошибка добавления книги'); }
    };

    const handleEditBook = async (bookData) => {
        try { await api.put(`/books/${selectedBook.id}`, bookData); setShowModal(false); setSelectedBook(null); loadBooks(); }
        catch { alert('Ошибка обновления книги'); }
    };

    const handleDeleteBook = async (bookId) => {
        if (window.confirm('Удалить книгу?')) {
            try { await api.delete(`/books/${bookId}`); loadBooks(); }
            catch { alert('Ошибка удаления'); }
        }
    };

    const toggleWishlist = async (bookId) => {
        try {
            const res = await api.post('/wishlist', { book_id: bookId });
            alert(res.data.message);
            loadBooks();
        } catch { alert('Ошибка'); }
    };

    const openIssueModal = async (bookId) => {
        setCurrentBookId(bookId);
        setReaderSearch('');
        setFilterWishlist(false);
        await Promise.all([loadReaders(), loadWishlist(bookId)]);
        setShowIssueModal(true);
    };

    const issueBook = async (readerId) => {
        try {
            await api.post('/loans/checkout', { user_id: readerId, book_id: currentBookId });
            setShowIssueModal(false);
            loadBooks();
        } catch (err) { alert(err.response?.data?.message || 'Ошибка выдачи'); }
    };

    const openEditModal = (book) => {
        setSelectedBook(book);
        setFormData({ title: book.title, author: book.author, year: book.year, publisher: book.publisher, copies: book.copies, location: book.location });
        setModalType('edit');
        setShowModal(true);
    };

    const openAddModal = () => { setFormData({}); setModalType('add'); setShowModal(true); };
    const openViewModal = (book) => { setSelectedBook(book); setShowViewModal(true); };

    const getFilteredReaders = () => {
        let list = readersList;
        if (filterWishlist) {
            list = list.filter(r => wishlistReaders.includes(r.id));
        }
        if (readerSearch.trim()) {
            const term = readerSearch.toLowerCase();
            list = list.filter(r =>
                r.full_name.toLowerCase().includes(term) ||
                r.student_id?.toLowerCase().includes(term)
            );
        }
        return list;
    };

    return (
        <div>
            <div className="search-bar">
                <input type="text" placeholder="Поиск по названию или автору..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
                {(user.role === 'admin' || user.role === 'librarian') && (
                    <button onClick={openAddModal} className="add-button">+ Добавить книгу</button>
                )}
            </div>

            {filteredBooks.length === 0 ? (
                <div className="no-results"><p>Книги не найдены</p></div>
            ) : (
                <table className="books-table">
                    <thead>
                        <tr>
                            <th>№</th><th>Название</th><th>Автор</th><th>Год</th><th>Издательство</th>
                            <th>Доступно</th><th>Местоположение</th><th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBooks.map((book, idx) => (
                            <tr key={book.id}>
                                <td>{idx + 1}</td><td>{book.title}</td><td>{book.author}</td><td>{book.year}</td>
                                <td>{book.publisher}</td><td>{book.available_copies}/{book.copies}</td>
                                <td>{book.location}</td>
                                <td className="actions">
                                    <button onClick={() => openViewModal(book)} className="view-btn">Просмотр</button>
                                    {user.role === 'reader' ? (
                                        <button onClick={() => toggleWishlist(book.id)} className="wishlist-btn">Пометить желаемой</button>
                                    ) : (
                                        <>
                                            <button onClick={() => openEditModal(book)} className="edit-btn">Редактировать</button>
                                            <button onClick={() => handleDeleteBook(book.id)} className="delete-btn">Удалить</button>
                                            <button onClick={() => openIssueModal(book.id)} className="checkout-btn">Выдать</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showModal && (
                <BookModal mode={modalType} formData={formData} onSave={modalType === 'add' ? handleAddBook : handleEditBook} onClose={() => { setShowModal(false); setSelectedBook(null); setFormData({}); }} />
            )}
            {showViewModal && selectedBook && (
                <BookViewModal book={selectedBook} onClose={() => setShowViewModal(false)} />
            )}

            {showIssueModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h3>Выдача книги</h3>
                        <input type="text" placeholder="Поиск по ФИО или номеру билета" value={readerSearch} onChange={e => setReaderSearch(e.target.value)} />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '10px 0' }}>
                            <input type="checkbox" checked={filterWishlist} onChange={e => setFilterWishlist(e.target.checked)} />
                            Показать только желающих
                        </label>
                        <table className="readers-table">
                            <thead><tr><th>№</th><th>ФИО</th><th>Группа</th><th>Телефон</th><th>Действие</th></tr></thead>
                            <tbody>
                                {getFilteredReaders().map((r, index) => (
                                    <tr key={r.id}>
                                        <td>{index + 1}</td>
                                        <td>{r.full_name}</td>
                                        <td>{r.group_name || '-'}</td>
                                        <td>{r.phone || '-'}</td>
                                        <td><button onClick={() => issueBook(r.id)}>Выдать</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={() => setShowIssueModal(false)}>Закрыть</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BooksList;