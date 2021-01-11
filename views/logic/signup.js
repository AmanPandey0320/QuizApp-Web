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
  
  //sign up btn
  var sign_up_btn=document.getElementById("signup");

  function sendSignUprequest(e,p){
    var xhr = new XMLHttpRequest();
    xhr.open('GET',`register?email=${e}&password=${p}`,true);
    xhr.send();
    xhr.onreadystatechange=function(){
      if(this.readyState==4){
        if(this.status==200)
        window.alert('Check your inbox! We just mailed you.');
        else if(this.status==409)
        location.href=`error?status=${this.status}`;
      }
    };
  }


  function register(){
    var e,c,p;
    e=signup_email_txt.value;
    p=signup_password_txt.value;
    c=signup_confirm_txt.value;
  
    if(c!=p){
      window.alert('Passwords do not match!');
    }else{
      if(p.length<6)
      window.alert('The password must be a string with at least 6 characters.')
      else
      sendSignUprequest(e,p);
    }
  
  }
  
sign_up_btn.addEventListener('click',()=>{
    register();
  });