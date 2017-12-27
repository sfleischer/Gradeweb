var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
	
	res.render('index');
});

router.post('/', function(req, res){
	var dakine = {'msg': "hi"};
	console.log('req min', req.body.min);
	res.send(req.body)
})


module.exports = router;