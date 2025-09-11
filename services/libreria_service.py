from repositories.libreria_repository import BookRepository

class BookService:
    def __init__(self, db_session):
        self.repository = BookRepository(db_session)

    def listar_libros(self):
        return self.repository.get_all_books()

    def obtener_libro(self, book_id: int):
        return self.repository.get_book_by_id(book_id)

    def crear_libro(self, title: str, author: str, year: int):
        return self.repository.create_book(title, author, year)

    def actualizar_libro(self, book_id: int, title: str = None, author: str = None, year: int = None):
        return self.repository.update_book(book_id, title, author, year)

    def eliminar_libro(self, book_id: int):
        return self.repository.delete_book(book_id)