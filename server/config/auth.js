/**
 *  Route middleware to ensure user is authenticated.
 */
exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.send(401);
};

/**
 * Comment authorizations routing middleware
 */
// TODO: Hm. Seems like this isn't useful as the right way of only allowing
// owners to do things.
//exports.comment = {
	//hasAuthorization: function(req, res, next) {
		//console.log('req', req);
		//if (req.body.user._id.toString() !== req.user._id.toString()) {
			//return res.send(403);
		//}
		//next();
	//}
//};
