var express = require('express')
var app = express();
var router = express.Router()
var path = require('path');
var web = require('./routes/web')

var exphbs  = require('express-handlebars');
app.use(express.static(path.join(__dirname, 'public')));
app.engine('.html', exphbs({ defaultLayout: 'main', extname: '.html'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', '.html');

app.use(web);
app.get('/', function(req, res) {
  res.render('index');
})

app.listen(3000, function () {
  console.log('Express listening at', 3000);
});

module.exports = app;