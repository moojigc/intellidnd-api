module.exports = function (req, res, next) {
	if (req.user) {
		return next();
	} else {
		req.flash("errorMsg", "You must be logged in to view this resource.");
		return res.redirect("/users/login");
	}
};
