function BookViewModal({ book, onClose }) {
    return (
        <div className="modal">
            <div className="modal-content view-modal">
                <h3>📖 Информация о книге</h3>
                <div className="book-details">
                    <p><strong>Название:</strong> {book.title}</p>
                    <p><strong>Автор:</strong> {book.author}</p>
                    <p><strong>Год издания:</strong> {book.year}</p>
                    <p><strong>Издательство:</strong> {book.publisher || 'Не указано'}</p>
                    <p><strong>Всего экземпляров:</strong> {book.copies}</p>
                    <p><strong>Доступно:</strong> {book.available_copies}</p>
                    <p><strong>Местоположение:</strong> {book.location || 'Не указано'}</p>
                    <p><strong>Статус:</strong> {book.available_copies > 0 ?
                        <span className="available">✓ В наличии</span> :
                        <span className="unavailable">✗ Нет в наличии</span>}
                    </p>
                </div>
                <div className="modal-buttons">
                    <button onClick={onClose}>Закрыть</button>
                </div>
            </div>
        </div>
    );
}

export default BookViewModal;