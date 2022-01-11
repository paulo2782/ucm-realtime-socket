var mysql    = require('mysql');
const ucm    = process.env.UCM

class DB {
  constructor(){
    this.con = mysql.createPool({
      host     : process.env.HOST_DB,
      user     : process.env.USER_DB,
      password : process.env.PASSWORD_DB,
      database : process.env.DATABASE_DB,
      port     : process.env.PORT_DB
    });
  }

  listCallRealtime(callback){
    let SQL = "SELECT * FROM "+ucm+" "
    this.con.query(SQL, (err, rows) => {
      if (err){
        return callback(err)
      }else{
        return callback(rows)
      }
      
    })
  }
  insertCallRealtime(text){

    let SQL = ""+
    "INSERT INTO `cascaveladm` "+
    "(`id`, `cdr`) "+
    "VALUES (NULL, "+text+") ";

    // let values = [
    //   [ 'NULL', str[0] ]

    // ]
    
    this.con.query(SQL,  (err, rows) => {
      if(err){
        console.log("Registro Salvo!")
      }
    })
  }

}

module.exports = {DB}