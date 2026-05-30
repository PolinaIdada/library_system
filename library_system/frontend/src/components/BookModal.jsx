import { useState } from 'react';

function BookModal({ mode, formData, onSave, onClose }) {
    const [data, setData] = useState(formData);

    const handleSubmit = () => {
        onSave({
            title: data.title,
            author: data.author,
            year: parseInt(data.year),
            publisher: data.publisher,
            copies: parseInt(data.copies),
            location: data.location
        });
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>{mode === 'add' ? 'Добавить книгу' : 'Редактировать книгу'}</h3>
                <input
                    placeholder="Название"
                    value={data.title || ''}
                    onChange={e => setData({ ...data, title: e.target.value })}
                />
                <input
                    placeholder="Автор"
                    value={data.author || ''}
                    onChange={e => setData({ ...data, author: e.target.value })}
                />
                <input
                    placeholder="Год"
                    type="number"
                    value={data.year || ''}
                    onChange={e => setData({ ...data, year: e.target.value })}
                />
                <input
                    placeholder="Количество"
                    type="number"
                    value={data.copies || ''}
                    onChange={e => setData({ ...data, copies: e.target.value })}
                />
                <input
                    placeholder="Издательство"
                    value={data.publisher || ''}
                    onChange={e => setData({ ...data, publisher: e.target.value })}
                />
                <input
                    placeholder="Местоположение"
                    value={data.location || ''}
                    onChange={e => setData({ ...data, location: e.target.value })}
                />
                <div className="modal-buttons">
                    <button onClick={handleSubmit}>Сохранить</button>
                    <button onClick={onClose}>Отмена</button>
                </div>
            </div>
        </div>
    );
}

export default BookModal;