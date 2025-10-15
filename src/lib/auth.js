module.exports = {
    isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            req.session.userId = req.user.id; // Garante userId na sessão
            return next();
        }
        res.redirect('/signin');
    }
};