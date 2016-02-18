"use strict";

module.exports = function(sequelize, dataTypes) {
	var User = sequelize.define('googleUser', {
		id: {
			type: dataTypes.BIGINT.UNSIGNED,
			primaryKey: true
		},
		name: dataTypes.STRING,
		token: dataTypes.STRING,
		email: dataTypes.STRING
	}, {
		timestamps: true,
		updatedAt: 'updateTimestamp',
		classMethods: {
			associate: function(models) {
				// User.hasMany(models.Task)
			}
		}
	});
	return User
}