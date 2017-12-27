var express = require('express')
var app = express();
var router = express.Router()
var path = require('path');
var web = require('./routes/web');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));

var exphbs  = require('express-handlebars');
app.use(express.static(path.join(__dirname, 'public')));
app.engine('.html', exphbs({ defaultLayout: 'main', extname: '.html'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.html');

var $ = require('jquery')(require('jsdom-no-contextify').jsdom().parentWindow);

// Support for Cross-domain request with using jQuery
// See: http://garajeando.blogspot.jp/2012/06/avoiding-xmlhttprequest-problem-using.html
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
$.support.cors = true;
$.ajaxSettings.xhr = function () {
	return new XMLHttpRequest;
}

app.use(web);
app.get('/', function(req, res) {
  res.render('index');
})

app.listen(3000, function () {
  console.log('Express listening at', 3000);
});

module.exports = app;