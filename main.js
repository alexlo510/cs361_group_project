var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.use(express.static(__dirname));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('port', process.env.PORT || 3000);

// Connect with Postgres
const { Client } = require('pg');
const e = require('express');
const pg = new Client({
    connectionString: process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/ethical_eating",
    // ssl: {
    //   rejectUnauthorized: false
    // }
});
pg.connect();

app.get('/',function(req,res,next){
    let context = {};
    context.title = "Ethical Eating";
    res.render('home', context);
});

app.get('/dbtest',function(req,res,next){
  let context = {};
  context.title = "Ethical Eating";

  // Select all from the test_table
  let query = "select r.name as recipeName, i.name as ingredientName from recipe r inner join recipe_ingredient ri on r.id = ri.recipe_id inner join ingredient i on ri.ingredient_id = i.id";

  pg.query(query, (err, result) => {
    if(err){
      next(err);
      return;
    }

    context.results = result.rows;
    res.render('home', context);
  });
});

app.post('/register', function(req, res, next) {
  var context = {success: null}
  let query = `INSERT INTO account (first_name, last_name, email, username, password) VALUES ('${req.body.first_name}', '${req.body.last_name}', '${req.body.email}', '${req.body.username}', '${req.body.password}');`;
  pg.query(query, (err, result) => {
    if(err){
      next(err);
      return;
    }
    context.success = true
    res.send(context);
  })
});

app.post('/validateUsername', function(req, res, next) {
  var context = {success: null}
  let query = `SELECT account.username FROM account where account.username='${req.body.username}'`;
  pg.query(query, (err, result) => {
    if(err){
      next(err);
      return;
    }
    // if the select finds something.
    if (result.rowCount > 0) {
      context.success = false
    } else {
      context.success = true
    }
    res.send(context);
  })
});

app.post('/validateEmail', function(req, res, next) {
  var context = {success: null}
  let query = `SELECT account.email FROM account where account.email='${req.body.email}'`;
  pg.query(query, (err, result) => {
    if(err){
      next(err);
      return;
    }
    // if the select finds something.
    console.log("hello");
    if (result.rowCount > 0) {
      context.success = false
    } else {
      context.success = true
    }
    res.send(context);
  })
});

app.use(function(req,res){
    res.status(404);
    res.render('404');
});

app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
