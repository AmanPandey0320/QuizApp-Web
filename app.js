const express = require('express');
let ejs =require('ejs');
const e = require('express');
const { query } = require('express');
const app = express();
const port = process.env.YOUR_PORT || process.env.port ;
const host = process.env.YOUR_HOST || '0.0.0.0';

const nodemailer=require('nodemailer');
const fetch =require('node-fetch');
const admin = require('firebase-admin');
const emailHtml= require('./emailHtml');
const bodyParser = require('body-parser');

const serviceAccount=require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://gossips-6259d.firebaseio.com",
});

const db=admin.firestore();


app.set('view engine', 'ejs');

//email transporter
var transporter = nodemailer.createTransport({
  service:'gmail',
  auth:{
    user:'darkphoenix09199@gmail.com',
    pass:'Aman@4457',
  }
});

app.use('/',bodyParser.json());
app.use('/',express.static('assets'));
app.use('/',express.static('views'));

app.get('/login',(req,res)=>{
  var queryList= req.query;
  var e= queryList.email;
  var p=queryList.password;
  console.log(e+' '+p);
  admin.auth().getUserByEmail(e).then((userRecord)=>{
    res.render('index',{
      userID:`${userRecord.uid}`,
    });
  }).catch((error)=>{
    console.log(`login auth error: ${error.message}`);
    res.render('Error',{
      code:`${error.code}`,
      message:`${error.message}`
    });
  });
});

app.get('/practice',(req,res)=>{
  var uid=req.query.uid;
  admin.auth().getUser(uid).then(({userRecord})=>{
    res.render('practice',{
      userID:uid
    });
  }).catch((error)=>{
    console.log(`practice: ${error.message}`);
    res.render('Error',{
      code:`${error.code}`,
      message:`${error.message}`
    });
  });
});

app.get('/signup',(req,res)=>{
  res.render('signup');
});

//home route
app.get('/home', (req, res) => {
  var uid=req.query.uid;
  if(uid==null)
    res.render('index',{
      userID:'null'
    });
  else{
    admin.auth().getUser(uid).then(({userRecord})=>{
      res.render('index',{
        userID:uid
      });
    }).catch((error)=>{
    console.log(`home: ${error.message}`);
      res.render('Error',{
        code:`${error.code}`,
        message:`${error.message}`
      });
    });
  }
});
app.get('/register',(req,res)=>{
  var e=req.query.email;
  var p=req.query.password;
  if(e==null || p==null){
    res.render('Error',{
      code:`${error.code}`,
      message:`${error.message}`
    });
  }
  else{
    admin.auth().createUser({
      email:e,
      password:p,
    }).then((userRecord)=>{
      // console.log('practice');
      db.collection('user').doc(`${userRecord.uid}`).set({
        ab:'Hello!',
        av:'user.png',
        em:e,
        nm:'New user',
      }).then(()=>{
        var verifyURL='https://gossips-6259d.web.app/';
        var dom=`<h1>Welcome</h1><br>Thanks for signing up with us. Hope you enjoy quizing with us.<br><h3> Let us verify it's really you.</h3>Click <a href="${verifyURL}" >here</a> to verify <br> For any query you can write to us @ 2000amanpandey@gmail.com <br>Thank you<br> Team Quizrr...`;
        var emailDOM=emailHtml(verifyURL);
        var mailOp={
          from:'darkphoenix09199@gmail.com',
          to:e,
          subject:'Welcome to Quizrr...',
          html:emailDOM,
        };
        transporter.sendMail(mailOp,(error,info)=>{
          if(error){
            console.log(error);
          }else{
            console.log(`Email sent to: ${e} : ${info.responce}`);
          }
        });
        res.sendStatus(200);
        // res.render('practice',{
        //   userID:`${userRecord.uid}`
        // });
      }).catch((error)=>{
        console.log(`register: db: ${error.message}`);
        res.render('Error',{
          code:`${error.code}`,
          message:`${error.message}`
        });
      });

    }).catch((error)=>{
      console.log(`register: auth : ${error.message}`);
      res.sendStatus(409);
    });
  }
});

function prepareQuiz(json){
  let data=JSON.parse(json);
  // console.log(data.results);
  var questions=[];
  var options=[];
  var answers=[];
  for(var i=0;i<10;i++){
    questions.push(data.results[i].question.replace(/&#039;/g,"'").replace(/&quot;/g,' ').replace(/&shy;/g,'-').replace(/&amp;/g,'&').replace(/&eacute;/g,' ').replace(/&rdquo;/g,' ').replace(/&ldquo;/g,' ').replace(/&oacute;/g,'Ó').replace(/&Eacute;/g,"É").replace(/&auml;/g,"Ä"));
    answers.push(Math.floor(Math.random() * (4)));
    var k=0;
    for(var j=0;j<4;j++){
      if(j==answers[i]){
        options.push(data.results[i].correct_answer.replace(/&#039;/g,"'").replace(/&quot;/g,'"').replace(/&shy;/g,'-').replace(/&amp;/g,'&').replace(/&eacute;/g,' ').replace(/&rdquo;/g,' ').replace(/&ldquo;/g,' ').replace(/&oacute;/g,'Ó').replace(/&Eacute;/g,"É").replace(/&auml;/g,"Ä"));
      }else{
        options.push(data.results[i].incorrect_answers[k].replace(/&#039;/g,"'").replace(/&quot;/g,'"').replace(/&shy;/g,'-').replace(/&amp;/g,'&').replace(/&eacute;/g,' ').replace(/&rdquo;/g,' ').replace(/&ldquo;/g,' ').replace(/&oacute;/g,'Ó').replace(/&Eacute;/g,"É").replace(/&auml;/g,"Ä"));
        k++;
      }
    }//assigning options
  }//creating questions correct answers and the options
  var res={
    question:questions,
    answers: answers,
    options:options,
    data:JSON.stringify(data),
  };
  return(JSON.stringify(res));
}

async function getQuiz(url){
  const responce = await fetch(url);
  let data = await responce.json();
  const json=prepareQuiz(JSON.stringify(data));
  return(json);
}


app.get('/quiz',async function(req,res){
  var queryList=req.query;
  var uid=queryList.uid;
  var type=queryList.type;

  if(uid!=null){
    admin.auth().getUser(uid).then(async function(userRecord){
      if(type != null){
        var url='https://opentdb.com/api.php?amount=10&type=multiple';

        if(type==0)
        url='https://opentdb.com/api.php?amount=10&type=multiple';
        else
        url=`https://opentdb.com/api.php?amount=10&category=${type}&type=multiple`;

        let quizJSON= await getQuiz(url);

        res.render('quiz',{
          userID:uid,
          type:type,
          data:quizJSON,
        });
      }else{
        res.render('Error',{
          code:'invalid type',
          message:'We do not provide the mentioned type of quiz'
        });
      }
    }).catch((error)=>{
      console.log(`quiz: ${error.message}`);
      res.render('Error',{
        code:`${error.code}`,
        message:`${error.message}`,
      });
    });
  }else{
    let quizJSON= await getQuiz('https://opentdb.com/api.php?amount=10&type=multiple');
    res.render('quizView',{
      userID:'null',
      data:quizJSON,
    });
  }


});

app.get('/myquizes',(req,res)=>{
  var queryList= req.query;
  var uid=queryList.uid;
  admin.auth().getUser(uid).then( async function(userRecord){
    let query = db.collection('user').doc(`${uid}`).collection('quiz');
    var time=[];
    var wrong=[];
    var correct=[];
    var skip=[];
    var score=[];
    var path=[];
    await query.get().then(querySnapshot=>{
      querySnapshot.forEach(documentSnapshot=>{
        var data=documentSnapshot.data();
        time.push(`${data.time}`);
        wrong.push(data.wrong);
        correct.push(data.correct);
        skip.push(data.skip);
        score.push(data.score);
        path.push(`${documentSnapshot.ref.path}`);
        // console.log(`${data.time}`);
      });
    });
    res.render('myQuizes',{
      userID:uid,
      time:time,
      wrong:wrong,
      correct:correct,
      skip:skip,
      score:score,
      path:path,
    });
  }).catch((error)=>{
    console.log(`myquiz: ${error.message}`);
    res.render('Error',{
      code:`${error.code}`,
      message:`${error.message}`
    });
  });
});

app.get('/quizview',function(req,res){
  var queryList=req.query;
  var uid=queryList.uid;
  admin.auth().getUser(uid).then(function(user){
    var ref=queryList.ref;
    let docRef=db.doc(`${ref}`);
    var json;
    docRef.get().then(documentSnapshot=>{
      var data=documentSnapshot.data();
      json=data.json;
      // console.log(json);
      const quizData= prepareQuiz(json);
      res.render('quizView',{
        userID:uid,
        data:quizData,
      });
    }).catch(error=>{
      console.log(`quizview:db:${error.message}`);
      res.render('Error',{
        code:`${error.code}`,
        message:`${error.message}`
      });
    });
  }).catch(({error})=>{
    console.log(`quizview:auth:${error.message}`);
    res.render('Error',{
      code:`${error.code}`,
      message:`${error.message}`
    });
  });
});

app.post('/mail',(req,res)=>{
  var queryList=req.query;
  var data=req.body;
  var question = data.question;
  var answer= data.answer;
  var uid= data.uid;
  // console.log(uid);
  //retriving email from uid
  admin.auth().getUser(uid).then((userRecord)=>{
    var userEmail=`${userRecord.email}`;
    // console.log(`${userRecord.email}`);

    var dom=`<div><p><h1>Your Result</h1><p/><p><ul><li>Correct:${data.correct}</li><li>Wrong:${data.wrong}</li><li>Skip:${data.skip}</li><li>Score:${data.score}</li></ul></p><p><h1>Analysis to your quiz:</h1></p></div><br><div><ol>`;
    for(var i=0;i<10;i++){
      var tempDom=`<li><div>${question[i]}</div><p><b>Answer: </b>${answer[i]}</p></li>`;
      dom=dom+tempDom;
    }
    dom=dom+'</ol></div><br>For any query with to us @ 2000amanpandey@gmail.com<br><div>Thank you<br>Team Quizrr...</div>';

    var mailOptions={
      from:'darkphoenix09199@gmail.com',
      to:userEmail,
      subject:`Quiz results attempted by you at: ${data.time}`,
      html:dom,
    };
    transporter.sendMail(mailOptions,(e,i)=>{
      if(e){
        console.log(e.message);
        res.send(e.message);
      }else{
        console.log(i.responce);
        res.send('200');
      }
    });
  }).catch((error)=>{
    console.log(`Failed to get email: ${error.message}`);
    res.render('Error',{
      code:`${error.code}`,
      message:`${error.message}`
    });
  });//end of retriving user from user id
});
app.get('/verify',(req,res)=>{
  var queryList=req.query;
  var uid=queryList.uid;

  admin.auth().getUser(uid).then((user)=>{

    if(user.emailVerified){
      res.render('profile',{
        userID:uid,
        name:`New user`,
        about:`Hello!`,
        email:`user@quizrr.com`,
        avatar:`user.png`,
      });
    }else{
      admin.auth().updateUser(uid,{
        emailVerified: true,
      }).then((userRecord)=>{
      res.send('Verification successfull! Refresh again to setup your profile');
      }).catch((error)=>{
        console.log(`line 346: ${error.message}`);
        res.render('Error',{
          code:`${error.code}`,
          message:`${error.message}`
        });
      });
    }

  }).catch((error)=>{
    console.log(`line 339:${error.code} ${error.message}`);
    res.render('Error',{
      code:`${error.code}`,
      message:`${error.message}`,
    });
  });

  
});


app.get('/error',(req,res)=>{
  var status=req.query.status;
  var error;
  if(status=409){
    error={
      code:'409 conflict',
      message:'The email address is improperly formatted',
    };
  }else if(status==401){
    error={
      code:'401 Unauthorized',
      message:'You must authenticate yourself to get the requested page',
    };
  }else if(status==400){
    error={
      code:'400 Bad Request',
      message:'The server could not understand the request due to invalid syntax',
    };
  }else if(status==404){
    error={
      code:'404 Not Found',
      message:'can not find the requested resource!',
    };
  }
  res.render('Error',{
    code:`${error.code}`,
    message:`${error.message}`
  });
});

app.get('/getdata',(req,res)=>{
  // console.log('data');
  var queryList = req.query;
  if(queryList!=null){
    var uid= queryList.uid;
    if(uid!=null){
      admin.auth().getUser(uid).then((user)=>{
        db.collection('user').doc(uid).get().then((documentSnapshot)=>{
          var data=documentSnapshot.data();
          // console.log(data);
          res.send(data);
        }).catch((error)=>{
          console.log(`getdata db error: ${error.message}`);
          res.sendStatus(404);
        });
      }).catch((error)=>{
        console.log(`getdata auth error: ${error.message}`);
        res.sendStatus(401);
      });
    }else{
      res.sendStatus(400);
    }
  }else{
    res.sendStatus(400);
  }
});

app.post('/updateProfile',(req,res)=>{
  var queryList=req.query;
  var body = req.body;
  if(queryList!=null){
    if(queryList.uid!=null){
      var uid=queryList.uid;
      admin.auth().getUser(uid).then((user)=>{
        if(body!=null){
          db.collection('user').doc(uid).set(body).then((result)=>{
            res.sendStatus(200);
          }).catch((error)=>{
            console.log(`updateProfile db error: ${error.message}`);
            res.sendStatus(404);
          });
        }else{
          console.log('empty body');
          res.sendStatus(400);
        }
      }).catch((error)=>{
        console.log(`updateProfile auth error: ${error.message}`);
        res.sendStatus(401);
      });
    }else{
      res.sendStatus(400)
    }
  }else{
    res.sendStatus(400);
  }
});

app.listen(port,host, () => console.log(`Example app listening on port ${port}`));