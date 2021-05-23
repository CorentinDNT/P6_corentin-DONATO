const fs = require("fs");
const Sauce = require("../models/Sauce");
const sanitize = require("mongo-sanitize");
const validator = require("validator");

exports.createSauce = (req, res, next) => {
	const sauceReq = JSON.parse(sanitize(req.body.sauce));
	delete sauceReq._id;
	const sauce = new Sauce({
		...sauceReq,
		imageUrl: `${req.protocol}://${req.get("host")}/images/${
			req.file.filename
		}`,
		likes: 0,
		dislikes: 0,
		usersLiked: [],
		usersDisliked: [],
	});
	sauce
		.save()
		.then(() => {
			res.status(201).json({ message: "Sauce enregistrée" });
		})
		.catch((error) => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
	let file = sanitize(req.file);
	let id = sanitize(req.params.id);
	let sauceUpdated = {};
	if (file) {
		let body = JSON.parse(sanitize(req.body.sauce));
		Sauce.findOne({ _id: id })
			.then((sauce) => {
				const filename = sauce.imageUrl.split("/images")[1];
				fs.unlink(`images/${filename}`, () => {});
			})
			.catch((error) => res.status(400).json({ error }));
		sauceUpdated = {
			...body,
			imageUrl: `${req.protocol}://${req.get("host")}/images/${file.filename}`,
		};
	} else {
		let body = sanitize(req.body);
		sauceUpdated = body;
	}
	console.log(sauceUpdated);
	Sauce.updateOne({ _id: id }, { ...sauceUpdated, _id: id })
		.then(() => res.status(200).json({ message: "Sauce update" }))
		.catch((e) => res.status(400).json({ e }));
};

exports.deleteSauce = (req, res, next) => {
	let id = sanitize(req.params.id);
	Sauce.findOne({ _id: id })
		.then((sauce) => {
			const filename = sauce.imageUrl.split("/images/")[1];
			fs.unlink(`images/${filename}`, () => {
				Sauce.deleteOne({ _id: id })
					.then(() => res.status(200).json({ message: "Sauce Supprimé" }))
					.catch((e) => res.status(400).json({ e }));
			});
		})
		.catch((e) => res.status(500).json({ e }));
};

exports.getSauce = (req, res, next) => {
	let idOfSauce = sanitize(req.params.id);
	Sauce.findOne({ _id: idOfSauce })
		.then((sauce) => res.status(200).json(sauce))
		.catch((e) => res.status(404).json({ e }));
};

exports.getAllSauce = (req, res, next) => {
	Sauce.find()
		.then((sauces) => res.status(200).json(sauces))
		.catch((e) => res.status(400).json({ e }));
};

exports.like = (req, res, next) => {
	let user = sanitize(req.body.userId);
	let like = sanitize(req.body.like);
	let idOfSauce = sanitize(req.params.id);
	Sauce.findOne({ _id: idOfSauce })
		.then((sauce) => {
			switch (like) {
				case -1:
					Sauce.updateOne(
						{ _id: idOfSauce },
						{
							$inc: { dislikes: +1 },
							$push: { usersDisliked: user },
							_id: idOfSauce,
						}
					).then(() => res.status(200).json({ message: "Dislike ajouté" }));
					break;
				case 1:
					Sauce.updateOne(
						{ _id: idOfSauce },
						{
							$inc: { likes: +1 },
							$push: { usersLiked: user },
							_id: idOfSauce,
						}
					).then(() => {
						res.status(200).json({ message: "like ajouté" });
					});
					break;
				case 0:
					if (sauce.usersLiked.includes(user)) {
						Sauce.updateOne(
							{ _id: idOfSauce },
							{
								$inc: { likes: -1 },
								$pull: { usersLiked: user },
								_id: idOfSauce,
							}
						).then(() => res.status(200).json({ message: "Like retiré" }));
					}
					if (sauce.usersDisliked.includes(user)) {
						Sauce.updateOne(
							{ _id: idOfSauce },
							{
								$inc: { dislikes: -1 },
								$pull: { usersDisliked: user },
								_id: idOfSauce,
							}
						).then(() => res.status(200).json({ message: "Dislike retiré" }));
					}
					break;
				default:
			}
		})

		.catch((e) => res.status(400).json({ e }));
};
