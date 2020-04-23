const express = require('express');
const router = express.Router();

//Importar express-validator
const { body } = require('express-validator/check');

//Importar el controlador
const proyectosController = require('../controllers/proyectosController');
const tareasController = require('../controllers/tareasController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');

module.exports = function(){
    //Ruta para el home
    router.get('/',
        authController.usuarioAuntenticado,
        proyectosController.proyectosHome
    );
    router.get('/nuevo-proyecto',
        authController.usuarioAuntenticado,
        proyectosController.formularioProyecto
    );
    router.post('/nuevo-proyecto',
        authController.usuarioAuntenticado, 
        body('nombre').not().isEmpty().trim().escape(),
        proyectosController.nuevoProyecto
    );

    //Listar proyecto
    router.get('/proyectos/:url',
        authController.usuarioAuntenticado,
        proyectosController.proyectoPorUrl
    );
    
    //Actualizar el proyecto
    router.get('/proyecto/editar/:id',
        authController.usuarioAuntenticado,
        proyectosController.formularioEditar
    );
    router.post('/nuevo-proyecto/:id',
        authController.usuarioAuntenticado,
        body('nombre').not().isEmpty().trim().escape(),
        proyectosController.actualizarProyecto
    );

    //Eliminar proyecto
    router.delete('/proyectos/:url',
        authController.usuarioAuntenticado,
        proyectosController.eliminarProyecto
    );

    // Tareas
    router.post('/proyectos/:url',
        authController.usuarioAuntenticado,
        tareasController.agregarTarea
    );

    // Actualizar tarea
    router.patch('/tareas/:id',
        authController.usuarioAuntenticado,
        tareasController.cambiarEstadoTarea
    );

    // Eliminar tarea
    router.delete('/tareas/:id',
        authController.usuarioAuntenticado,
        tareasController.eliminarTarea
    );

    // Crear nueva cuenta
    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', usuariosController.crearCuenta);
    router.get('/confirmar/:correo', usuariosController.confirmarCuenta);

    // Iniciar Sesion
    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.auntenticarUsuario);

    // Cerrar Sesion
    router.get('/cerrar-sesion', authController.cerrarSesion);

    // Reestablecer contraseña
    router.get('/reestablecer', usuariosController.formRestablecerPassword);
    router.post('/reestablecer', authController.enviarToken);
    router.get('/reestablecer/:token', authController.validarToken);
    router.post('/reestablecer/:token', authController.actualizarPassword);

    return router;
}
