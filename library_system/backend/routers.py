from flask import request, jsonify
from datetime import datetime, timedelta, date
import jwt
from models import db, User, Book, Loan

def init_routes(app, bcrypt):
    
    @app.route('/api/login', methods=['POST'])
    def login():
        data = request.json
        user = User.query.filter_by(username=data.get('username')).first()
        if user and bcrypt.check_password_hash(user.password, data.get('password')):
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, app.config['SECRET_KEY'])
            return jsonify({
                'token': token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'full_name': user.full_name,
                    'role': user.role
                }
            })
        return jsonify({'message': 'Неверные учетные данные'}), 401

    @app.route('/api/books', methods=['GET'])
    def get_books(current_user):
        books = Book.query.all()
        return jsonify([{
            'id': b.id,
            'title': b.title,
            'author': b.author,
            'year': b.year,
            'publisher': b.publisher,
            'copies': b.copies,
            'available_copies': b.available_copies,
            'location': b.location
        } for b in books])

    @app.route('/api/books', methods=['POST'])
    def add_book(current_user):
        data = request.json
        book = Book(
            title=data['title'],
            author=data['author'],
            year=data.get('year'),
            publisher=data.get('publisher'),
            copies=data.get('copies', 1),
            available_copies=data.get('copies', 1),
            location=data.get('location')
        )
        db.session.add(book)
        db.session.commit()
        return jsonify({'message': 'Книга добавлена', 'id': book.id})

    @app.route('/api/users', methods=['GET'])
    def get_users(current_user):
        users = User.query.filter(User.role == 'reader').all()
        return jsonify([{
            'id': u.id,
            'full_name': u.full_name,
            'username': u.username,
            'student_id': u.student_id,
            'group_name': u.group_name,
            'phone': u.phone
        } for u in users])

    @app.route('/api/users', methods=['POST'])
    def add_user(current_user):
        data = request.json
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
        user = User(
            username=data['username'],
            password=hashed_password,
            full_name=data['full_name'],
            role='reader',
            student_id=data.get('student_id'),
            group_name=data.get('group_name'),
            phone=data.get('phone')
        )
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'Читатель добавлен', 'id': user.id})

    @app.route('/api/loans', methods=['GET'])
    def get_loans(current_user):
        if current_user.role in ['admin', 'librarian']:
            loans = Loan.query.all()
        else:
            loans = Loan.query.filter_by(user_id=current_user.id)
        
        return jsonify([{
            'id': l.id,
            'user_id': l.user_id,
            'user_name': l.user.full_name if l.user else '',
            'book_id': l.book_id,
            'book_title': l.book.title if l.book else '',
            'book_author': l.book.author if l.book else '',
            'loan_date': l.loan_date.isoformat(),
            'due_date': l.due_date.isoformat(),
            'return_date': l.return_date.isoformat() if l.return_date else None,
            'fine': float(l.fine)
        } for l in loans])

    @app.route('/api/loans/checkout', methods=['POST'])
    def checkout_book(current_user):
        data = request.json
        user_id = data['user_id']
        book_id = data['book_id']
        
        book = Book.query.get(book_id)
        if not book or book.available_copies < 1:
            return jsonify({'message': 'Книга недоступна'}), 400
        
        active_loans = Loan.query.filter_by(user_id=user_id, return_date=None).all()
        for loan in active_loans:
            if loan.due_date < date.today():
                return jsonify({'message': 'У читателя есть задолженности'}), 400
        
        loan = Loan(
            user_id=user_id,
            book_id=book_id,
            loan_date=date.today(),
            due_date=date.today() + timedelta(days=30)
        )
        book.available_copies -= 1
        
        db.session.add(loan)
        db.session.commit()
        return jsonify({'message': 'Книга выдана'})

    @app.route('/api/loans/return', methods=['POST'])
    def return_book(current_user):
        data = request.json
        loan_id = data['loan_id']
        
        loan = Loan.query.get(loan_id)
        if not loan:
            return jsonify({'message': 'Операция не найдена'}), 404
        
        loan.return_date = date.today()
        fine = 0
        if loan.due_date < date.today():
            days_late = (date.today() - loan.due_date).days
            fine = days_late * 10
        
        loan.fine = fine
        
        book = Book.query.get(loan.book_id)
        book.available_copies += 1
        
        db.session.commit()
        return jsonify({'message': 'Книга возвращена', 'fine': fine})

    @app.route('/api/stats', methods=['GET'])
    def get_stats(current_user):
        total_books = Book.query.count()
        total_available = sum(b.available_copies for b in Book.query.all())
        total_loans = Loan.query.filter_by(return_date=None).count()
        overdue_loans = Loan.query.filter(Loan.return_date == None, Loan.due_date < date.today()).count()
        
        return jsonify({
            'total_books': total_books,
            'total_available': total_available,
            'total_loans': total_loans,
            'overdue_loans': overdue_loans
        })

    @app.route('/api/books/<int:book_id>', methods=['PUT'])
    def update_book(current_user, book_id):
        book = Book.query.get(book_id)
        if not book:
            return jsonify({'message': 'Книга не найдена'}), 404
        
        data = request.json
        book.title = data.get('title', book.title)
        book.author = data.get('author', book.author)
        book.year = data.get('year', book.year)
        book.publisher = data.get('publisher', book.publisher)
        book.location = data.get('location', book.location)
        
        new_copies = data.get('copies', book.copies)
        if new_copies != book.copies:
            difference = new_copies - book.copies
            book.copies = new_copies
            book.available_copies += difference
            if book.available_copies < 0:
                book.available_copies = 0
        
        db.session.commit()
        return jsonify({'message': 'Книга обновлена'})

    @app.route('/api/books/<int:book_id>', methods=['DELETE'])
    def delete_book(current_user, book_id):
        book = Book.query.get(book_id)
        if not book:
            return jsonify({'message': 'Книга не найдена'}), 404
        
        active_loans = Loan.query.filter_by(book_id=book_id, return_date=None).count()
        if active_loans > 0:
            return jsonify({'message': 'Нельзя удалить книгу, есть выданные экземпляры'}), 400
        
        db.session.delete(book)
        db.session.commit()
        return jsonify({'message': 'Книга удалена'})
    
    @app.route('/')
    def home():
        return jsonify({'message': 'Library API is running!'})