/**
 * Advertisement_cController
 *
 * @description :: Server-side logic for managing advertisement_cs
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	create: function(req, res){
		var title = req.param('title');
		var url = req.param('url');
		if(!title||!url){
			res.end();
			return;
		}
		advertisement_c.create({title: title, url: url}).exec(function(err, ad){
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
		var id = req.param('id');
		var updateOptions = {};
		var title = req.param('title');
		if(title){
			updateOptions.title = title;
		}
		var url = req.param('url');
		if(url){
			updateOptions.url = url;
		}
		advertisement_c.update({id: id}, updateOptions).exec(function(err){
			res.status(200);
			res.end();
			return;
		});
	},
};
