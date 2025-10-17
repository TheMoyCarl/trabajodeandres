from flask import Blueprint, request, jsonify
from services.libreria_service import BookService
from config.database import get_db_session
from flask_jwt_extended import jwt_required
from controllers.users_controller import role_required
from controllers.users_controller import role_required

book_bp = Blueprint('book_bp', __name__)
service = BookService(get_db_session())

@book_bp.route('/books', methods=['GET'])
@book_bp.route('/books', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_books():
    books = service.listar_libros()
    return jsonify([{'id': b.id, 'title': b.title, 'author': b.author, 'year': b.year} for b in books]), 200

@book_bp.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id):
    book = service.obtener_libro(book_id)
    if book:
        return jsonify({'id': book.id, 'title': book.title, 'author': book.author, 'year': book.year}), 200
    return jsonify({'error': 'Libro no encontrado'}), 404

@book_bp.route('/books', methods=['POST'])
@role_required('admin')
@book_bp.route('/books', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_book():
    data = request.get_json()
    title = data.get('title')
    author = data.get('author')
    year = data.get('year')
    if not title or not author:
        return jsonify({'error': 'El título y el autor son obligatorios'}), 400
    book = service.crear_libro(title, author, year)
    return jsonify({'id': book.id, 'title': book.title, 'author': book.author, 'year': book.year}), 201

@book_bp.route('/books/<int:book_id>', methods=['PUT'])
@role_required('admin')
@book_bp.route('/books/<int:book_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_book(book_id):
    data = request.get_json()
    title = data.get('title')
    author = data.get('author')
    year = data.get('year')
    book = service.actualizar_libro(book_id, title, author, year)
    if book:
        return jsonify({'id': book.id, 'title': book.title, 'author': book.author, 'year': book.year}), 200
    return jsonify({'error': 'Libro no encontrado'}), 404

@book_bp.route('/books/<int:book_id>', methods=['DELETE'])
@role_required('admin')
@book_bp.route('/books/<int:book_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_book(book_id):
    book = service.eliminar_libro(book_id)
    if book:
        return jsonify({'message': 'Libro eliminado'}), 200
    return jsonify({'error': 'Libro no encontrado'}), 404