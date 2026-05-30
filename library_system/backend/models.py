from flask_sqlalchemy import SQLAlchemy
from datetime import date
from sqlalchemy import UniqueConstraint

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(50), default='reader')
    student_id = db.Column(db.String(50))
    group_name = db.Column(db.String(100))
    phone = db.Column(db.String(20))

class Book(db.Model):
    __tablename__ = 'books'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(300), nullable=False)
    author = db.Column(db.String(200), nullable=False)
    year = db.Column(db.Integer)
    publisher = db.Column(db.String(200))
    copies = db.Column(db.Integer, default=1)
    available_copies = db.Column(db.Integer, default=1)
    location = db.Column(db.String(200))

class Loan(db.Model):
    __tablename__ = 'loans'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'))
    loan_date = db.Column(db.Date, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    return_date = db.Column(db.Date)
    fine = db.Column(db.Numeric(10,2), default=0)
    
    user = db.relationship('User', backref='loans')
    book = db.relationship('Book', backref='loans')

class Wishlist(db.Model):
    __tablename__ = 'wishlist'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    book_id = db.Column(db.Integer, db.ForeignKey('books.id'), nullable=False)
    __table_args__ = (db.UniqueConstraint('user_id', 'book_id', name='uq_wishlist_user_book'),)
    user = db.relationship('User', backref='wishlist_items')
    book = db.relationship('Book', backref='wishlist_items')