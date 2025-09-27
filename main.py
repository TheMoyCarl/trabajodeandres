from flask import Flask
from controllers.libreria_controller import book_bp

app = Flask(__name__)

app.register_blueprint(book_bp)

if __name__ == "__main__":
    app.run(debug=True)