Trabajo de libreria
Este trabajo es tiene la funcion de crear una api, la cual cumpla la función de agregar, colocar, actualizar, y eliminar libros en una libreria. Para este trabajo se utilizo el lenguaje Python y herraminetas como Flask y SQLAlchemy para crear y utilizar la base de datos y sus relaciones.

Descripción General
El sistema permite agregar, consultar, actualizar y eliminar libros,autores y el año de publicacion, en caso de que existan ediciones especiales, de una libreria y sus libros . La estructura de trabajo que se implemento fue todo basado en una base de datos creada con la herramienta SQLAlquemy para relacionar las tablas. 
Características principales:
API de gestion de libros en una libreria.
Modelos bien definidos y documentados.
Uso de la rama development para la elaboracion de la logica y funciones.
Estructura del Proyecto
models/: Estructura de la tabla libros.
repositories/: Creacion de funciones que se van a usar para aplicar los comandos: GET,POST,PUT;DELETE.
controllers/:Rutas y Aplicacin de las funciones.
database.py/:Creacion de la base de datos local que se usa en caso de tener errores de conexion
services/: Logica de que datos se van a ver modificados cuando se usen los comandos
