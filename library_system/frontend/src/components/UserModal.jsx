import { useState } from 'react';

function UserModal({ formData, onSave, onClose }) {
    const [data, setData] = useState(formData);

    const handleSubmit = () => {
        onSave({
            username: data.username,
            password: data.password,
            full_name: data.full_name,
            student_id: data.student_id,
            group_name: data.group_name,
            phone: data.phone
        });
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h3>Добавить читателя</h3>
                <input
                    placeholder="Логин"
                    onChange={e => setData({ ...data, username: e.target.value })}
                />
                <input
                    placeholder="Пароль"
                    type="password"
                    onChange={e => setData({ ...data, password: e.target.value })}
                />
                <input
                    placeholder="ФИО"
                    onChange={e => setData({ ...data, full_name: e.target.value })}
                />
                <input
                    placeholder="Номер студ. билета"
                    onChange={e => setData({ ...data, student_id: e.target.value })}
                />
                <input
                    placeholder="Группа"
                    onChange={e => setData({ ...data, group_name: e.target.value })}
                />
                <input
                    placeholder="Телефон"
                    onChange={e => setData({ ...data, phone: e.target.value })}
                />
                <div className="modal-buttons">
                    <button onClick={handleSubmit}>Сохранить</button>
                    <button onClick={onClose}>Отмена</button>
                </div>
            </div>
        </div>
    );
}

export default UserModal;