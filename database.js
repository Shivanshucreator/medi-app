// database name project

const mysql = require('mysql');


const pool = mysql.createPool({
  connectionLimit:10,
  host: 'us-cdbr-east-02.cleardb.com',
  user: 'b890e1df2e1df6',
  password: '869787da',
  database: 'heroku_7b6cf8306163972'
});
pool.getConnection((err) => {
  if (err){
  console.log(err);
}else{
    console.log('Connected!');
}

});


module.exports = pool
