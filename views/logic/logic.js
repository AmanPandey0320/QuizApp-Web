var firebaseConfig = {
  apiKey: "AIzaSyC74xtatGtAOvmzdoTUCIRL7I5c5NMUSmM",
  authDomain: "gossips-6259d.firebaseapp.com",
  databaseURL: "https://gossips-6259d.firebaseio.com",
  projectId: "gossips-6259d",
  storageBucket: "gossips-6259d.appspot.com",
  messagingSenderId: "300711730286",
  appId: "1:300711730286:web:8b29b367ebc6eb7b7e5a7f",
  measurementId: "G-Q0HGD0PP94"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
//sign in btn
var sign_in_btn=document.getElementById("signin");

var reset_btn=document.getElementById("reset");

var xhr= new XMLHttpRequest();

reset_btn.addEventListener('click',()=>{
  var e;
  e=signin_email_txt.value;
  firebase.auth().sendPasswordResetEmail(e).then(()=>{
    window.alert('Email sent successfully!')
  }).catch(error=>{
    window.alert(`Error ${error.code}: ${error.message}`);
  });
});


//signup credentials
var signup_email_txt=document.getElementById("signup_email_txt");
var signup_password_txt=document.getElementById("signup_password_txt");
var signup_confirm_txt=document.getElementById("signup_confirm_txt");

var signin_email_txt=document.getElementById("signin_email_txt");
var signin_password_txt=document.getElementById("signin_password_txt");

var currentuid=localStorage.getItem('quizrrUID');

var uid=$('#datadiv').text();
$('#datadiv').remove();
console.log(uid);

function signIn(){
  var e,p;
  e=signin_email_txt.value;
  p=signin_password_txt.value;
  firebase.auth().signInWithEmailAndPassword(e,p)
  .then(({user}) => {
    if(user.emailVerified){
      uid=user.uid;
      localStorage.setItem('quizrrUID',`${uid}`);
      location.href=`home?uid=${uid}`;
    }else{
      window.alert('Email not verified!');
    }
    
  })
  .catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
    window.alert(errorMessage);
  });
}

sign_in_btn.addEventListener('click',()=>{
  signIn();
});

xhr.open("GET",`getdata?uid=${uid}`,true);
xhr.onreadystatechange= function(){
    if(this.readyState == 4){
        if(this.status==200){
            var data= JSON.parse(this.response);
            $('#userAvatar').attr("src",`./assets/avatar/${data.av}`);
            $('#userName').text(data.nm);
        }else{
            // location.href=`error?status=${this.status}`;
        }
    }
};
xhr.send();