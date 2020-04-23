const passport = require('passport');
const Usuarios = require('../models/Usuarios');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const enviarEmail = require('../handlers/email');

exports.auntenticarUsuario = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos Campos son Obligatorios'
});

// Funcion para revisar si el usuario esta logueado o no
exports.usuarioAuntenticado = (req, res, next) => {
    //Si el usuario esta auntenticado, adelante
    if(req.isAuthenticated()){
        return next();
    }

    // Si no, redirigir
    return res.redirect('/iniciar-sesion');
}

// Funcion para cerrar sesion
exports.cerrarSesion = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/iniciar-sesion'); // Al cerrar sesion lo lleva al login
    })
}

// Si usuario es valido genera un token
exports.enviarToken = async (req, res) => {
    // Verificar que el usuario exista
    const {email} = req.body;
    const usuario = await Usuarios.findOne({where: { email }});

    console.log(usuario);

    // Si no existe el usuario
    if(!usuario){
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/reestablecer');
    }

    // Usuario existe
    usuario.token = crypto.randomBytes(24).toString('hex');
    console.log(usuario.token);
    usuario.expiracion = Date.now() + 3600000; //Equivale el 3600000 a una hora

    // Guardarlos en la base de datos
    await usuario.save();

    // Url de reset
    const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;

    //console.log(resetUrl);

    // Envia el correo con el token
    await enviarEmail.enviar({
        usuario,
        subject: 'Password Reset',
        resetUrl,
        archivo : 'reestablecer-password'
    });

    // Terminar
    req.flash('correcto', 'Se envió un mensaje a tu correo');
    res.redirect('/iniciar-sesion');
}

exports.validarToken = async (req, res) => {

    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token
        }
    });

    // Si no encuentra el usuario
    if(!usuario){
        req.flash('error', 'No Valido');
        res.redirect('/reestablecer');
    }

    // Formulario para generar el password 
    res.render('resetPass', {
        nombrePagina : 'Reestablecer Contraseña'
    });
}

// Cambiar el Password por el nuevo
exports.actualizarPassword = async (req, res) => {

    // Verifica el token valido pero tambien la fecha de expiracion
    const usuario = await Usuarios.findOne({
        where: {
            token: req.params.token,
            expiracion: {
                [Op.gte] : Date.now()
            }
        }
    });

    // Verificar si el usuario existe
    if(!usuario){
        req.flash('error', 'No Válido');
        res.redirect('/reestablecer');
    }

    // Hashear el nuevo password
    usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10) );
    usuario.token = null;
    usuario.expiracion = null;

    // Guardamos el nuevo password
    await usuario.save();

    req.flash('correcto', 'Tu password se ha modificado correctamente.');
    res.redirect('/iniciar-sesion');
    
}