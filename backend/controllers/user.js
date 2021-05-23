const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sanitize = require("mongo-sanitize");
const validator = require("validator");

const User = require("../models/User");

exports.signup = (req, res, next) => {
	let email = sanitize(req.body.email);
	let passw = sanitize(req.body.password);
	if (validator.isEmail(email)) {
		const regPass = /^[\w]{6,}$/;
		if (regPass.test(passw)) {
			bcrypt
				.hash(passw, 10)
				.then((hash) => {
					const user = new User({ email: email, password: hash });
					user
						.save()
						.then(() => res.status(201).json({ message: "user créer" }))
						.catch((e) => res.status(400).json({ e }));
				})
				.catch((e) => res.status(500).json({ e }));
		} else {
			console.log("MDP non sécurisé");
		}
	} else {
		console.log("email invalid");
	}
};

exports.login = (req, res, next) => {
	let email = sanitize(req.body.email);
	let passw = sanitize(req.body.password);
	if (validator.isEmail(email)) {
		User.findOne({ email: email })
			.then((user) => {
				if (!user) {
					return res.status(401).json({ error: "user introuvable" });
				}
				bcrypt
					.compare(passw, user.password)
					.then((valid) => {
						if (!valid) {
							return res.status(401).json({ error: "MDP incorrect !" });
						}
						res.status(200).json({
							userId: user._id,
							token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
								expiresIn: "24h",
							}),
						});
					})
					.catch((e) => res.status(500).json({ e }));
			})
			.catch((e) => res.status(500).json({ e }));
	}
};
