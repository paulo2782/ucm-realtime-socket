require('dotenv').config()
var fs = require('fs')

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mysql = require("mysql2");

// ROTAS
var callRealTimeRouter  = require('./routes/callRealtime');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/callRealtime', callRealTimeRouter);
 
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// OPEN SOCKET 
const {DB} = require('./model/DB.js');
var db = new DB()

let net = require('net');
const { callbackify } = require('util');

var connection = mysql.createPool({
  host: "10.29.10.88",
  user: "root",
  password: "26031949Pa!@!@!",
  database: "voxcity",
  port: 5306
});

query = "UPDATE `config` SET `insert_blocked` = '0' WHERE `config`.`id` = 1"
connection.promise().query(query)
  .then(() =>{ console.log('START - CASCAVEL SAÚDE')})

setInterval(function(){ check() }, 20000);

let server = net.createServer(function(socket) {
  let ts      = Date.now();
  let date_ob = new Date(ts);
  let date    = date_ob.getDate();
  let month   = date_ob.getMonth() + 1;
  let year    = date_ob.getFullYear();
  file        = __dirname + '/csv/' + date + '-' + month + '-' + year + '.csv'

  socket.write('Erro no Servidor\r\n');

  socket.on('data', function(data){
    new Promise((resolve, reject) => {
      textChunk = data.toString('utf8');
      fs.appendFile(file,textChunk,(err) => {
        if(err){console.log(err)}
        console.log('Append File - Cascavel Saúde')
      })
      resolve()        
    }).then(() =>{
      
    })
  });
  
  socket.on("error", (err) => {
    //console.log(err)
  });
});

function check(){
  query = "SELECT * FROM config where client_id = 1"
  connection.query(query, (error, response) => {
    console.log(error || response)
    linha = response[0].line
    if(response[0].insert_blocked == 0){
      query = "UPDATE `config` SET `insert_blocked` = '1' WHERE `config`.`id` = 1"
      connection.query(query, (error, response) => {
        console.log(error || response)
        saveTable(linha)
      })
    }else{
      console.log('Tabela bloqueada para insert Cascavel Saúdel') 
    }
  });
}


function saveTable(linha){
  let ts      = Date.now();
  let date_ob = new Date(ts);
  let date    = date_ob.getDate();
  let month   = date_ob.getMonth() + 1;
  let year    = date_ob.getFullYear();
  file        = '/cascavel-api-realtime/csv/' + date + '-' + month + '-' + year + '.csv';
  
  var line = []
  new Promise((resolve, reject) => {
    const str = []

    query = "SELECT * FROM `config` WHERE `config`.`id` = 1"
  

    connection.query(query, (error, response) => {
      try{
        line.push(response[0].line)
        console.log(line)
      }catch{
        console.log('erro')
      }
    })

    fs.readFile(file,'utf-8', (err,data) => {
     
  
      fields = 
      "(accountcode,src,dst,dcontext,"+
      "clid,channel,dstchannel,lastapp,"+
      "lastdata,start,answer,end,duration,"+
      "billsec,disposition,amaflags,uniqueid,"+
      "userfieldchannel_ext,dstchannel_ext,"+
      "service,caller_name,recordfiles,dstanswer,"+
      "chanext,dstchanext,session,action_owner,"+
      "action_type,src_trunk_name,dst_trunk_name)" 

      var regex = data.replace(/(\r\n|\n|\r)/gm, "[+]").split('[+]')

      for(i = 0 ; i <= regex.length-1 ; i++){
        const array = regex[i].split(',')
        try{
          str.push(array)
        }catch{
          console.log('erro 1')
        }
        
      }

      aName = []

      iLine = str.length-1

      query2 = "UPDATE `config` SET `insert_blocked` = '0', line = "+iLine+" WHERE `config`.`id` = 1"
      connection.promise().query(query2)
        .then(() =>{
        connection.query(query2, (error, response) => {
          console.log("UPDATE TABLE - INSERT Unlocked")
        })
      })
  
      for(i = linha ; i <= str.length-2 ; i++){
        
        strName = str[i]
        for(j = 0 ; j <= strName.length-1 ; j++){
          try{ 
            aName.push(str[i][j])
          }catch{
            console.log('erro 2')
          }
        }
        let iTam = str[i].length
        switch(iTam){
          case 12:
            var query =  
            "INSERT INTO cascaveladms "+fields+" "+
            "VALUES ("+
            ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+
            ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+
            "'' ,'', '',"+
            "'','', '',"+
            "'','', '','',"+
            "'','', '','',"+
            "'','', '','',"+
            "'','', '','')"       
          break;
          case 26:
            var query =  
            "INSERT INTO cascaveladms "+fields+" "+
            "VALUES ("+
            ""      +str[i][0]+",'','','',"+
            "'','','','',"+
            "'','','','',"+
            "'','','',"+
            "'','','','',"+
            "'','','','',"+
            "'','','','',"+
            "'','','')"          
          break;
          case 28:
            var query =  
            "INSERT INTO cascaveladms "+fields+" "+
            "VALUES ("+
            ""+str[i][0]+",'','','',"+                                       //1
            "'','','','',"+                                                  //5
            "'',"+str[i][5]+","+str[i][6]+","+str[i][7]+","+                 //9
            ""+str[i][8]+",'','',"+                                          //13
            "'',"+str[i][12]+","+str[i][13]+",'',"+                          //16
            "'','','','',"+                                                  //20
            ""+str[i][16]+",'',"+str[i][22]+","+str[i][23]+","+              //24
            ""+str[i][24]+","+str[i][25]+",'')"                              //28
          break;
          case 31:
            var query =  
            "INSERT INTO cascaveladms "+fields+" "+
            "VALUES ("+
            ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+
            ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+
            "''," +str[i][10]+", '','',"+
            ""      +str[i][11]+","+str[i][12]+", "+str[i][13]+","+
            ""      +str[i][14]+","+str[i][15]+", "+str[i][16]+","+str[i][17]+","+
            ""      +str[i][19]+",'', '','',"+
            "'','', "+str[i][26]+",'',"+
            "'','', '')"   
          break;
          case 33:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+
              "''," +str[i][10]+", "+str[i][11]+","+str[i][12]+","+
              ""      +str[i][13]+","+str[i][14]+", "+str[i][15]+","+
              ""      +str[i][16]+","+str[i][17]+", "+str[i][18]+","+str[i][19]+","+
              ""      +str[i][21]+","+str[i][22]+", "+str[i][23]+","+str[i][24]+","+
              ""      +str[i][25]+","+str[i][26]+", "+str[i][27]+","+str[i][28]+","+
              ""      +str[i][29]+","+str[i][30]+", "+str[i][31]+")"          
          break;
          case 34:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+
              "''," +str[i][11]+", '','',"+
              ""      +str[i][14]+","+str[i][15]+", "+str[i][16]+","+
              ""      +str[i][17]+","+str[i][18]+", "+str[i][19]+","+str[i][20]+","+
              ""      +str[i][22]+","+str[i][23]+", '','',"+
              "'','', '',"+str[i][28]+","+
              ""      +str[i][29]+","+str[i][30]+", '')"          
          break;      
          case 35:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+
              "'',"+str[i][12]+", "+str[i][13]+","+str[i][14]+","+
              ""      +str[i][15]+","+str[i][16]+", "+str[i][17]+","+
              ""      +str[i][18]+","+str[i][19]+", "+str[i][20]+","+str[i][21]+","+
              ""      +str[i][23]+","+str[i][24]+", "+str[i][25]+","+str[i][26]+","+
              ""      +str[i][27]+","+str[i][28]+", "+str[i][29]+","+str[i][30]+","+
              ""      +str[i][31]+","+str[i][32]+", "+str[i][33]+")"    
          break;
          case 36:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+
              "'',"+str[i][13]+", "+str[i][14]+","+str[i][15]+","+
              ""      +str[i][16]+","+str[i][17]+", "+str[i][18]+","+
              ""      +str[i][19]+","+str[i][20]+", "+str[i][21]+","+str[i][22]+","+
              ""      +str[i][24]+","+str[i][25]+", "+str[i][26]+",'',"+
              "'','', "+str[i][30]+","+str[i][31]+","+
              "'',"+str[i][34]+", '')"    
          break;
          case 37:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+ //1
              ""      +str[i][5]+"," +str[i][6]+",  '','',"+                        //5
              "'',"+str[i][14]+", "+str[i][15]+","+str[i][16]+","+                  //9
              ""      +str[i][17]+","+str[i][18]+", "+str[i][19]+","+               //13
              ""      +str[i][20]+","+str[i][21]+", "+str[i][22]+","+str[i][23]+","+//16
              ""      +str[i][25]+",'', '','',"+                                    //20
              "'','', "+str[i][31]+","+str[i][32]+","+                              //24
              ""+str[i][33]+","+str[i][34]+", '')"                                  //28
          break;
          case 38:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+ //1
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+",'',"+             //5
              "'',"+str[i][17]+", "+str[i][18]+","+str[i][19]+","+                  //9
              ""      +str[i][20]+","+str[i][21]+", "+str[i][22]+","+               //13
              ""      +str[i][23]+","+str[i][24]+", "+str[i][25]+",'',"+            //16
              ""      +str[i][26]+",'', '','',"+                                    //20
              "'',"+str[i][32]+", "+str[i][33]+","+str[i][35]+","+                  //24
              ""      +str[i][34]+",'', '')"                                        //28
          break;
          case 39:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+ //1
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+",'',"+             //5
              "'',"+str[i][17]+", "+str[i][18]+","+str[i][19]+","+                  //9
              ""      +str[i][20]+","+str[i][21]+", "+str[i][22]+","+               //13
              ""      +str[i][23]+","+str[i][24]+", "+str[i][25]+",'',"+            //16
              ""      +str[i][28]+",'', '','',"+                                    //20
              "'','',"+str[i][34]+","+str[i][35]+","+                               //24
              "'',"   +str[i][36]+",'')"                                            //28
          break;
          
          case 40:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+ //1
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+ //5
              "'',"+str[i][17]+", "+str[i][18]+","+str[i][19]+","+                  //9
              ""      +str[i][20]+","+str[i][21]+", "+str[i][22]+","+               //13
              ""      +str[i][23]+","+str[i][24]+", "+str[i][25]+","+str[i][26]+","+//16
              ""+str[i][28]+",'', "+str[i][30]+",'',"+                              //20
              "'','', "+str[i][34]+","+str[i][35]+","+                              //24
              ""+str[i][36]+","+str[i][37]+", '')"                                  //28
          break;
          case 41:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+ //1
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+ //5
              "'',"+str[i][17]+", "+str[i][18]+","+str[i][19]+","+                  //9
              ""      +str[i][20]+","+str[i][21]+", "+str[i][22]+","+               //13
              ""      +str[i][23]+","+str[i][24]+", "+str[i][25]+","+str[i][26]+","+//16
              ""+str[i][28]+",'', '','',"+                                          //20
              "'','', "+str[i][35]+","+str[i][36]+","+                              //24
              ""+str[i][37]+","+str[i][38]+", '')"                                  //28
          break;      
          case 43:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+ //1
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+ //5
              "'',"+str[i][10]+", "+str[i][11]+","+str[i][12]+","+                  //9
              ""      +str[i][13]+","+str[i][14]+", "+str[i][15]+","+               //13
              ""      +str[i][16]+","+str[i][17]+", "+str[i][18]+","+str[i][19]+","+//16
              ""+str[i][31]+",'', '','',"+                                          //20
              "'','', "+str[i][37]+","+str[i][38]+","+                              //24
              ""+str[i][39]+","+str[i][40]+", '')"                                  //28
          break;   
          case 44:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+ //1
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+ //5
              "'',"+str[i][12]+", "+str[i][13]+","+str[i][14]+","+                  //9
              ""      +str[i][15]+","+str[i][16]+", "+str[i][17]+","+               //13
              ""      +str[i][18]+","+str[i][19]+", "+str[i][20]+","+str[i][21]+","+//16
              ""+str[i][23]+",'', '','',"+                                          //20
              "'','', "+str[i][38]+","+str[i][39]+","+                              //24
              ""+str[i][40]+","+str[i][41]+", '')"                                  //28
          break;            
          case 45:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+ //1
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+ //5
              "'',"+str[i][22]+", "+str[i][23]+","+str[i][24]+","+                  //9
              ""      +str[i][25]+","+str[i][26]+", "+str[i][27]+","+               //13
              ""      +str[i][28]+","+str[i][29]+", "+str[i][30]+","+str[i][31]+","+//16
              ""+str[i][33]+",'', '','',"+                                          //20
              "'','', "+str[i][39]+","+str[i][40]+","+                              //24
              ""+str[i][41]+","+str[i][42]+", '')"                                  //28
          break;            
          case 48:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+ //1
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+ //5
              "'',"+str[i][25]+", "+str[i][26]+","+str[i][27]+","+                  //9
              ""      +str[i][28]+","+str[i][29]+", "+str[i][30]+","+               //13
              ""      +str[i][31]+","+str[i][32]+", "+str[i][33]+","+str[i][34]+","+//16
              ""+str[i][36]+",'', '','',"+                                          //20
              "'','', "+str[i][42]+","+str[i][43]+","+                              //24
              ""+str[i][44]+",'', '')"                                              //28
          break;            
          case 49:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+ //1
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+ //5
              "'',"+str[i][26]+", "+str[i][27]+","+str[i][28]+","+                  //9
              ""      +str[i][29]+","+str[i][30]+", "+str[i][31]+","+               //13
              ""      +str[i][32]+","+str[i][33]+", "+str[i][34]+","+str[i][36]+","+//16
              ""+str[i][37]+","+str[i][38]+", '','',"+                              //20
              "'','', "+str[i][43]+","+str[i][44]+","+                              //24
              ""+str[i][45]+","+str[i][47]+", '')"                                  //28
          break;            
          case 51:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+ //1
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+ //5
              "'',"+str[i][10]+", "+str[i][11]+","+str[i][12]+","+                  //9
              ""      +str[i][13]+","+str[i][14]+", "+str[i][15]+","+               //13
              ""      +str[i][16]+","+str[i][17]+", "+str[i][18]+","+str[i][19]+","+//16
              ""+str[i][21]+",'', '','',"+                                          //20
              "'','', "+str[i][27]+","+str[i][28]+","+                              //24
              ""+str[i][47]+","+str[i][48]+", '')"                                  //28
          break;                  
          case 52:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+ //1
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+ //5
              "'',"+str[i][12]+", "+str[i][13]+","+str[i][14]+","+                  //9
              ""      +str[i][15]+","+str[i][16]+", "+str[i][17]+","+               //13
              ""      +str[i][18]+","+str[i][19]+", "+str[i][20]+","+str[i][21]+","+//16
              ""+str[i][23]+",'', '','',"+                                          //20
              "'','', "+str[i][29]+","+str[i][30]+","+                              //24
              ""+str[i][31]+","+str[i][49]+", '')"                                  //28
          break;                        
          case 54:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+ //1
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+ //5
              "'',"+str[i][12]+", "+str[i][13]+","+str[i][14]+","+                  //9
              ""      +str[i][15]+","+str[i][16]+", "+str[i][17]+","+               //13
              ""      +str[i][18]+","+str[i][19]+", "+str[i][20]+","+str[i][21]+","+//16
              ""+str[i][23]+","+str[i][24]+", '','',"+                              //20
              "'','', "+str[i][48]+","+str[i][49]+","+                              //24
              ""+str[i][50]+",'', '')"                                              //28
          break;                        
          case 56:
            var query =  
              "INSERT INTO cascaveladms "+fields+" "+
              "VALUES ("+
              ""      +str[i][0]+"," +str[i][2]+",  "+str[i][3]+"," +str[i][4]+","+ //1
              ""      +str[i][5]+"," +str[i][6]+",  "+str[i][7]+"," +str[i][8]+","+ //5
              "'',"+str[i][12]+", "+str[i][13]+","+str[i][14]+","+                  //9
              ""      +str[i][15]+","+str[i][16]+", "+str[i][17]+","+               //13
              ""      +str[i][18]+","+str[i][40]+", "+str[i][41]+","+str[i][42]+","+//16
              ""+str[i][44]+",'', '','',"+                                          //20
              "'','', "+str[i][50]+","+str[i][51]+","+                              //24
              ""+str[i][52]+","+str[i][53]+", '')"                                  //28
          break;                        
        }
        
        connection.promise().query(query)
        .then(() => console.log('Insert Ok - Cascavel Saúde '))
        .catch(console.log)
      }
    })
    

  })
}


server.listen(3001,'10.29.10.88');


module.exports = app;

