from sqlalchemy.orm import Session
from models.libreria_model import Book

class BookRepository:
    def __init__(self, db_session: Session):
        self.db = db_session

    def get_all_books(self):
        return self.db.query(Book).all()

    def get_book_by_id(self, book_id: int):
        return self.db.query(Book).filter(Book.id == book_id).first()

    def create_book(self, title: str, author: str, year: int):
        new_book = Book(title=title, author=author, year=year)
        self.db.add(new_book)
        self.db.commit()
        self.db.refresh(new_book)
        return new_book

    def update_book(self, book_id: int, title: str = None, author: str = None, year: int = None):
        book = self.get_book_by_id(book_id)
        if book:
            if title:
                book.title = title
            if author:
                book.author = author
            if year:
                book.year = year
            self.db.commit()
            self.db.refresh(book)
        return book

    def delete_book(self, book_id: int):
        book = self.get_book_by_id(book_id)
        if book:
            self.db.delete(book)
            self.db.commit()
        return book