/**
 * AdvertisementController
 *
 * @description :: Server-side logic for managing advertisements
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require("fs");
var path = require('path');
var uuid = require('node-uuid');
module.exports = {
	create: function(req, res){
		var title = req.param('title');
		var content = req.param('content');
		var drawInfo = req.param('drawInfo');
		if(!title||!content||!drawInfo){
			res.end();
			return;
		}
		advertisement.create({title: title, content: content, drawInfo: drawInfo}).exec(function(err, ad){
			if(err){
				res.end();
				return;
			}
			res.status(200);
			res.json(ad);
			return;
		});
	}
  ,
	update: function(req, res){
		console.log("31");
		var id = req.param('id');
		var updateOptions = {};
		var title = req.param('title');
		if(title){
			updateOptions.title = title;
		}
		var content = req.param('content');
		if(content){
			updateOptions.content = content;
		}
		var drawInfo = req.param('drawInfo');
		if(drawInfo){
			updateOptions.drawInfo = drawInfo;
		}
		advertisement.update({id: id}, updateOptions).exec(function(err){
			res.status(200);
			res.end();
			return;
		});
	},
	image: function(req, res){
		console.log("52");
		var id = req.param("id");
		if(!id){
			res.end();
			return;
		}
		console.log("58");
		advertisement.findOne({id: id}).exec(function(err, adOne){
			if(err||!adOne){
				res.end();
				return;
			}
			console.log("64");
			req.file('files[]').upload(function (err, files) {
				if(err||!files||files.length!=1){
					res.end();
					return;
				}
				var imagePath;
				imagePath = files[0].fd;
				fs.readFile(imagePath, function (err, data) {
					if(err){
						res.end();
						return;
					}
					var imageUUID = uuid.v1();
					var ext = path.extname(imagePath).split(".")[1];
					var uploadPath = "/upload/"+imageUUID+"."+ext;
					var filename = path.join(process.cwd(), uploadPath);
					fs.writeFile(filename, data, function (err) {
						if(err){
							res.end();
							return;
						}
						console.log("56");
						var imagePublicId = imageUUID;
						var imageFormat = ext;
						image.create({publicId: imagePublicId, format: ext}).exec(function(err, imageOne){
							if(err){
								res.end();
								return;
							}
							adOne.image = imageOne.id;
							adOne.save(function(err){
								if(err){
									res.end();
									return;
								}
								console.log("98");
								res.status(200);
								res.end();
								return;

							})

						});
					});
				res.status(200);
				res.redirect('/advertisement-mod');
				return;
				});
			});
		});
	},
	find: function(req, res){
		advertisement.find().populate('image').exec(function(err, ads){
			res.json(ads);
			return;
		});
	},
	findOne: function(req, res){
		advertisement.findOne().populate('image').exec(function(err, adOne){
			res.json(adOne);
			return;
		});

	},
	downloadImage: function(req, res){

	}

};
