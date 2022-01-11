var express = require('express');
var router = express.Router();

const {DB} = require('../model/DB.js');
var db = new DB()


/* GET call realtime UCM . */
router.get('/', function(req, res, next) {
    db.listCallRealtime(msg => {
        res.json({msg:msg})
    })
});

module.exports = router;
  