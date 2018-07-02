const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const STATUS_OK = 200;
const BAD_REQUEST = 400;
const app = express();
admin.initializeApp(functions.config().firebase);
var db = admin.firestore();
/*var docRef = db.collection('users').doc('alovelace');
var setAda = docRef.set({
    first: 'Ada',
    last: 'Lovelace',
    born: 1815
});*/
function verify_phone(phone){
    var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    const valid = re.test(String(phone).toLowerCase());
    if(!valid){
        return false;
    }
    return true;
}
function verify_email(email){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const valid = re.test(String(email).toLowerCase());
    if(!valid){
        return false;
    }
    return true;
}
app.post('/requests', (request, response) => {
     if(!verify_email(request.body.email)){
        response.status(BAD_REQUEST);
        response.set({'Content-type':'application/json'});
        response.send(JSON.stringify("email"));
     }
     else if(!verify_phone(request.body.phone)){
        response.status(BAD_REQUEST);
        response.set({'Content-type':'application/json'});
        response.send(JSON.stringify("phone"));
     }
     else{
         var docRef = db.collection('requests').add({
             first:request.body.first,
             last:request.body.last,
             compname:request.body.compname,
             email:request.body.email,
             phone:request.body.phone,
             message:request.body.message,
             questions:request.body.questions,
             answers:request.body.answers
         }).then(docRef => {
             response.status(STATUS_OK);
             response.set({'Content-type': 'application/json'});
             response.send(JSON.stringify(docRef.id));
         });
     }
})

app.post('/schools',(request,response)=>{
    console.log("do we even get here");
    console.log("request.body.id ",request.body.id);
    console.log("request.body.schools ",request.body.schools);
    var cityRef = db.collection('requests').doc(request.body.id);
    var updateSingle = cityRef.update({ schools: request.body.schools})
    .then(docRef => {
        response.status(STATUS_OK);
        response.set({'Content-type': 'application/json'});
        response.send(JSON.stringify("good to go"));
    })
    .catch(err=>{
        console.log("err ",err);
        throw err;
    });
});

app.get('/schools',(request,response)=>{
    /*var cityRef = db.collection('requests').doc(requests.body.id);
    var updateSingle = cityRef.update({ schools: requests.body.schools })
    .then(docRef => {
        response.status(STATUS_OK);
    });*/
    var dict = {};
    var schoolsRef = db.collection('schools');
    var allSchools = schoolsRef.get()
        .then(snapshot => {
          snapshot.forEach(doc => {
              var key = doc.data().state;
              if(key in dict){
                  dict[key].push(doc.id);
              }
              else{
                  dict[key] = [];
                  dict[key].push(doc.id);
              }
              //console.log(doc.id, '=>', doc.data().state);
          });
            console.log("dict ",dict);
            response.status(STATUS_OK);
            response.set({'Content-type': 'application/json'});
            response.send(JSON.stringify(dict));
        })
        .catch(err => {
          //console.log('Error getting documents', err);
            console.log("err ",err);
            throw err;
        });
});

app.get('/users',(request,response) => {
    db.collection('users').get()
    .then((snapshot) => {
      users = [];
      snapshot.forEach((doc) => {
        users.push(doc.id);
        console.log(doc.id, '=>', doc.data());
      });
        response.status(STATUS_OK);
        response.set({'Content-type': 'application/json'});
        response.send(JSON.stringify(users));
    })
    .catch((err) => {
      throw(err);
    });
});

 exports.app = functions.https.onRequest(app);