var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Comment = mongoose.model('Comment');
var User = mongoose.model('User');
var _ = require('lodash');

router.get('/most-stars', function (req, res) {

	Comment.aggregate(
		{
			$match: {
				'stars.0': {
					$exists: true
				}
			}
		},
		{
			$unwind: '$stars'
		},
		{
			$group: {
				_id: '$user',
				stars: {$sum: 1}
			},
		},
		{
			$sort: {
				stars: -1
			}
		},
		{
			$limit: 10
		},
		{
			$project: {
				user: '$_id',
				stars: '$stars'
			}
		},
		function (error, results) {
			User.populate(results, {
				path: 'user',
				// WHY does this select not populate the gravatar?
				//select: 'username rank bio gravatar'
			}, function (err, populatedResults) {

				// We filter results manually here because the select doesn't seem to work on
				// the gravatar field (which is virtual) for mysterious reasons
				var filteredResults = populatedResults.map(
					result => {
						result.user = _.pick(result.user, ['username', 'rank', 'bio', 'gravatar']);
						return result;
					}
				);
				res.status(200).json(filteredResults);
			});
	});

});

module.exports = router;
