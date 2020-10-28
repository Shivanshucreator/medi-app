const express = require('express'); // use express lib
const ejs = require('ejs'); // use ejs templating feature
const querystring = require('querystring'); // to get parameter queries from url
const bodyParser = require('body-parser'); // take data from html forms
const alert = require('alert'); // to flash messages like alerts
const { body ,validationResult } = require('express-validator'); // server side validation
const connection = require('./database'); // sql database connection

const app = express();
app.set('view engine' , 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));



//**************************home route********************************************
app.get('/' , function (req, res){
  res.render('home');
});
//****************************************************************

//**************************user registration page********************************

app.get('/userregister' , function(req, res){
  res.render('userregister')
});
// apply regex in .matches here below

app.post('/userregister', function (req, res){
  const userinput = {
    firstname:req.body.fname,
    lastname:req.body.lname,
    email:req.body.email,
    username:req.body.username,
    password:req.body.password
  }
  if(userinput.password.length<6){
    alert ('please enter a password of atleast 6 characters')
  }else{
    const sql = "SELECT email FROM customers WHERE email = ?";
    connection.query(sql,[userinput.email], function (err,email){
      if(err){
        console.log(err);
      }else{
        if(email.length){
          console.log(email.length);
           alert('this email already exists please choose another email');
        }if(!email.length){
          console.log(!email.length);
          const sql1 = 'INSERT INTO customers(fname,lname,email,username,password) VALUES(?,?,?,?,?)';
          connection.query(sql1 , [userinput.firstname,userinput.lastname,userinput.email,userinput.username,userinput.password], function (err, customer){
            if(err){
              console.log(err);
            }else{
              if(customer){
                // res.json(customer);
                res.render('userregisterconfirm');
              }
            }
          });
        }
      }
    });
  }

});

//*********************************************************************************

//***********************admin registration page**************************************

app.get('/storeadminregister', function (req,res){
  res.render('adminregister');
})

app.post('/storeadminregister', function(req,res){
  const admininputs = {
    fname:req.body.fname,
    lname:req.body.lname,
    email:req.body.email,
    storename:req.body.storename,
    licencenumber: req.body.licencenumber,
    city:req.body.city,
    address:req.body.address,
    pincode:req.body.pincode,
    password:req.body.password
  }
  const sql = 'SELECT email FROM storeadmins where email =?';
  connection.query(sql, [admininputs.email], function(err, email){
    if(err){
      console.log(err);
    }else{
      if(email.length){
        alert('this email is already registered please choose another email');
      }
    }if(!email.length){
      const sql1 = 'INSERT INTO storeadmins(fname,lname,email,storename,licencenumber,city,address,pincode,password)VALUES(?,?,?,?,?,?,?,?,?)';
      connection.query(sql1, [admininputs.fname, admininputs.lname,admininputs.email,admininputs.storename,admininputs.licencenumber,admininputs.city,admininputs.address,
      admininputs.pincode,admininputs.password], function (err, admin){
        if(err){
          console.log(err);
        }else{
          if(admin){
            console.log('admin data updated and saved');
            res.redirect('/');
            // res.redirect('/adminstoreportal/' + admininputs.licencenumber);
          }
        }
      });
    }
  });
});

// **********************************************************************************

//************************* admin store  login portal **************************************

app.get('/adminstorelogin' , function (req,res){
  res.render('adminloginpage');
});

app.post('/adminstorelogin', function(req,res){
  const userinput = {
    email: req.body.email,
    licencenumber:req.body.licencenumber,
    password:req.body.password
  }
  const sql = 'SELECT email FROM storeadmins WHERE licencenumber=? AND password=?';
  connection.query(sql, [userinput.licencenumber, userinput.password], function (err, admin){
    if(err){
      console.log(err);
    }else{
      if(admin.length){
        res.redirect('adminstoreportal/' + [userinput.licencenumber]);
      }if(!admin.length){
        alert('no admin registered with these details');
      }
    }
  });
});

// ******************************now admin lands on home page ***************************888

app.get('/adminstoreportal/:licencenumber', function(req,res){
  const licencenumber = req.params.licencenumber;
  console.log(licencenumber);
  const sql = 'SELECT city FROM storeadmins WHERE licencenumber=?';
  connection.query(sql,[licencenumber],function(err,city){
    if(err){
      console.log(err);
    }else{
      if(city){
        const cityname = city[0].city;
          res.render('adminstoreportal',{licnum: licencenumber , city:cityname});
      }

    }
  })

  // add city from here so we can add city to medicine data
})

// ************* route where admin will see available data and update if want to********************
app.get('/adminstoreportal/:licencenumber/medicine' , function(req,res){
  const param = req.params.licencenumber;
  const query = req.query.name;
  console.log(param);
  console.log(query);
const sql = 'SELECT present_stock, amount_pertablet FROM storemedicines WHERE medicinename=? AND licencenumber=?';
connection.query(sql,[query,param], function (err, medicineinfo){
  if(err){
    console.log(err);
  }else{
    if(medicineinfo.length){
      const stock= (medicineinfo[0].present_stock);
      const amount = (medicineinfo[0].amount_pertablet);
      res.render('datamedicineportal', {licnum: param , medname:query , prestock: stock , amountpertab: amount});
// create a post route later if admin wants to sell or update medicine from here
    }
  }
});
});

// ************************** route to add medicines to database ************************
app.get('/addmedicinedata', function(req,res){
  const licencenumber = req.query.licencenumber;
  const mediname = req.query.medicine;
  const city = req.query.city;
  console.log(licencenumber);
  console.log(mediname);
  res.render('addmedicineportal',{licnum: licencenumber , medname:mediname , city: city});
});

app.post('/addmedicinedata', function(req,res){
  const admininputs = {
licencenumber: req.body.licnum,
city:req.body.city,
medicinename:req.body.mediname,
present_stock:req.body.addstock,
amount_pertablet:req.body.amount,
date: req.body.date
}
const sql = "INSERT INTO storemedicines(licencenumber,city,medicinename,present_stock,amount_pertablet,date)VALUES(?,?,?,?,?,?)";
 connection.query(sql,[admininputs.licencenumber, admininputs.city, admininputs.medicinename, admininputs.present_stock, admininputs.amount_pertablet, admininputs.date], function (err, data){
   if(err){
     console.log(err);
   }else {
     if(data){
       console.log("data updated");
       res.redirect("/adminstoreportal/" + admininputs.licencenumber)
     }
   }
 })
})


// route to add data to the database


app.post('/addmedicinedata', function(req,res){
  const admininputs = {
    licnum: req.body.licnum,
    city:req.body.city,
    mediname: req.body.mediname,
    addstock:req.body.addstock,
    amount:req.body.amount,
    date:req.body.date
  }
const sql = 'SELECT * FROM storemedicines WHERE licencenumber=?';
connection.query(sql,[admininputs.licnum], function(err, licnum){
  if(err){
    console.log(err);
  }else{
    if(licnum.length){
      const sql1 = 'INSERT INTO storemedicines(medicinename,present_stock,amount_pertablet,licencenumber,date,city) VALUES(?,?,?,?,?,?)';
      connection.query(sql1,[admininputs.mediname,admininputs.addstock, admininputs.amount,admininputs.licnum,admininputs.date,admininputs.city],function(err, medidata){
        if(err){
          console.log(err);
        }else{
          if(medidata){
            console.log('the data has been saved to database');
            res.redirect('/adminstoreportal/'+ [admininputs.licnum]);
          }
        }
      })
    }
  }
})
})










//*********** home route to post data and check if medicine exists or not ***********
app.post('/adminstoreportal' , function(req,res){
const admininputs = {
  licencenumber:req.body.licencenumber,
  city:req.body.city,
  medicinename:req.body.medicinename
}
const sql = 'SELECT medicinename FROM storemedicines WHERE licencenumber=?  AND medicinename =?';
connection.query(sql, [admininputs.licencenumber, admininputs.medicinename], function(err,medicine){
  if(err){
    console.log(err);
  }else{
    if(medicine.length){
      res.redirect('adminstoreportal/'+[admininputs.licencenumber]+ '/medicine?name='+[admininputs.medicinename]);
    }if(!medicine.length){
res.redirect('/addmedicinedata?licencenumber='+[admininputs.licencenumber]+'&medicine='+[admininputs.medicinename]+ '&city='+[admininputs.city])
      // alert('this medicine does not exists in your store, if you want to add some stock for this please click on add medicine button on the screen');
    }
  }
})
});
// give the add medicine link in above alert and then on that page give a button to simply come give lic in query
// to this page back if owner does not want to add medicine to database
// also give medicine name in query so that we can take it from url and give values if 0 in page using database




//***************** this is route to update database from datamedicineportal****************************************
app.get('/datamedicineportal', function(req,res){
  res.render('datamedicineportal');
})

app.post('/datamedicineportal', function(req,res){
const adminupdates = {
  licencenumber:req.body.licencenumber,
 medicine:req.body.medicinename,
 presentstock: req.body.presentstock,
 addstock: req.body.addstock,
 amount: req.body.amount,
 soldstock: req.body.soldstock,
 date:req.body.date
}
const sql = "UPDATE storemedicines SET present_stock = ?, date = ? WHERE licencenumber=? AND medicinename=?";
if(adminupdates.addstock > 0){
  const present = parseInt(adminupdates.presentstock);
 const added = parseInt(adminupdates.addstock);
 const newpresentdata = (present + added);
 console.log(newpresentdata);
  connection.query(sql,[newpresentdata,adminupdates.date, adminupdates.licencenumber , adminupdates.medicine], function(err, update){
    if(err){
      console.log(err);
    }else{
      if(update){
        console.log(update);
        res.redirect('/adminstoreportal/' + [adminupdates.licencenumber])
      }
    }
  })
}else{
  if(adminupdates.soldstock > 0){
const present = parseInt(adminupdates.presentstock);
const sold = parseInt(adminupdates.soldstock);
const newpresentdata1 = (present - sold);
connection.query(sql,[newpresentdata1, adminupdates.date, adminupdates.licencenumber, adminupdates.medicine], function (err, update){
  if(err){
    console.log(err);
  }else{
    if(update){
      console.log('sold stock removed from data');
        res.redirect('/adminstoreportal/' + [adminupdates.licencenumber])
    }
  }
})
  }
}


  // console.log('post req received for datamedicineportal');
  // res.redirect('/adminstoreportal/'+[licnum]);
})

//**************************************************************************************************************



//****************** userlogins *******************************

const items = [];

app.get('/userlogin', function(req,res){
  res.render('userlogin');
})

app.post('/userlogin', function(req,res){
  const customerinputs = {
    email:req.body.email,
    password:req.body.password
  }
  console.log(customerinputs);
  const sql = 'SELECT email FROM customers WHERE email=? AND password =?';
  connection.query(sql, [customerinputs.email , customerinputs.password], function (err,email){
    if(err){
    console.log(err);
    }else {
      if(email.length){
      res.redirect("/medicinehome")
    } if(!email.length){
      alert('please check your credentials')
    }
    }
  })

})


app.get('/medicinehome', function(req,res){
  res.render('medicinehome', {newlistitem: items});
})


app.post('/medicinehome', function(req,res){
  const userinputs = {
    city:req.body.city,
    med:req.body.medicine
  }
  const sql1 = 'SELECT storeadmins.storename,storeadmins.city, storeadmins.address FROM storeadmins INNER JOIN storemedicines ON storeadmins.licencenumber = storemedicines.licencenumber WHERE storemedicines.medicinename = ? AND storemedicines.city =?';
  connection.query(sql1, [userinputs.med, userinputs.city], function(err, store){
    if(err){
      console.log(err);
    }else{
      if(store.length){
      console.log(store);
      for(var i=0;i<store.length;i++){
        const arraydata ={
          store:store[i].storename,
          city:store[i].city,
          address:store[i].address
        }
console.log(arraydata.store);
items.push(arraydata);
console.log(items);
}
        res.redirect('/medicinehome');
      }if(!store.length){
        alert('your query does not met any results please look for other query');
      }
    }
  });
});

//*****************************************************************************












app.listen(process.env.PORT || 3000, function(req, res){
  console.log('server started');
});
