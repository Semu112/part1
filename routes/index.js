var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var dbConnectionPool = mysql.createPool({ host: 'localhost',database: 'hotel'});

router.use(function(req,res,next){
  req.pool = dbConnectionPool;
  next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//Gets all suite options
router.get('/getFields', function(req, res, next){

  req.pool.getConnection(function(error, connection) {
    if(error) {
      console.log(error);
      res.sendStatus(500);
      return;
    }

    let query = "SELECT suite_type FROM rooms";
    connection.query(query, function(error, rows, fields){
      connection.release();
      if(error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }

      res.json(rows);
    })
  })

})

router.post('/search', function(req, res, next){

  req.pool.getConnection(function(error, connection){
    if(error){
      console.log(error);
      res.sendStatus(500);
      return;
    }


    //Gradually builds up query based on how specific the user is being
    let query = "SELECT rooms.room_id, suite_type FROM rooms"; //Starts just by selecting all rooms
    let queryArgs = [];


    if(req.body.inputDate_start != ''){ //If start date is defined

      //Note NOT IN
      query += " WHERE room_id NOT IN (SELECT rooms.room_id FROM rooms NATURAL JOIN reservations WHERE"

      if(req.body.inputDate_end == req.body.inputDate_start){//If end and start date are the same, check if the booking is available for that day

        query += " ? BETWEEN reservations.start_date AND reservations.end_date)";
        queryArgs.push(req.body.inputDate_start);

      } else { //If both are different

        //find the rooms in which the reservation start date is before the inputted end date and the reservation end date is after the inputted start date
        //i.e. find the rooms which have reservations in the inputted range
        query += " reservations.start_date <= ? AND reservations.end_date >= ?)";
        queryArgs.push(req.body.inputDate_end);
        queryArgs.push(req.body.inputDate_start);

      }

      if(req.body.suite_type != ''){//Get ready to add " AND suite_type = ?" to end of query
        query += " AND";
      }
    }
    else if(req.body.suite_type != ''){ //If suite type is defined and no dates are specified
      //Get ready to add " WHERE suite_type = ?" to end of query
      query += " WHERE";
    }

    if(req.body.suite_type != ''){ //If suite type is defined, add rest of query
      query += " suite_type = ?";
      queryArgs.push(req.body.suite_type);
    }

    connection.query(query, queryArgs, function(error, rows, fields){
      connection.release();
      if(error) {
        console.log(error);
        res.sendStatus(500);
        return;
      }

      res.json(rows);

    })
  })

});

module.exports = router;
