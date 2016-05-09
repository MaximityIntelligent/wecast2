/**
 * CustomPlayController
 *
 * @description :: Server-side logic for managing customplays
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	customPlayFrame: function(req, res){
		res.view('advertisement_c_play-frame');
	},
	easywash: function(req, res){
		//res.setHeader('Cache-Control', 'no-cache, no-store');
		res.view('easywash');
	}
};
