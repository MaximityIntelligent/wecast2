/**
 * ClickCountController
 *
 * @description :: Server-side logic for managing clickcounts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	clickCount: function(req, res){
		var name = req.param('clickCountName');
		ClickCount.findOne({name: name}).exec(function(err, clickCountOne){
			if(!clickCountOne){
				ClickCount.create({name: name, clickCount: 1}).exec(function(){
					res.end();
					return;
				});

			}else{
				clickCountOne.clickCount = clickCountOne.clickCount + 1;
				clickCountOne.save(function(){
					res.end();
					return;
				})
			}

		});
	}
};
