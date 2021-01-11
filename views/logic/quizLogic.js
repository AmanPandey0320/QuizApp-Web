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

const db=firebase.firestore();

$('Quizmodal').hide();
const data=$('#dataDiv').text();
const uid=$('#dataDiv2').text();
$('#dataDiv').remove();
$('#dataDiv2').remove();
// console.log(userID);
var submitBtn=document.getElementById('submitQuiz');
var saveBtn= document.getElementById('saveResult');
var isSubmitted=false;
var correct=0;
var wrong=0;
var skip=0;
var score=0;
// console.log(data);
var quizData=JSON.parse(data);
var json=quizData.data;
// console.log(quizData.answers);

var answers=quizData.answers;
var response=[];
function getResponce(){

    for(var i=0;i<10;i++){
        response.push(4);
        for(var j=0;j<4;j++){
            var radio=document.getElementById(`option${i*4+j}`);
            if(radio.checked){
                response[i]=j;
            }
        }
    }

}


submitBtn.addEventListener('click',()=>{
    if(!isSubmitted){
        getResponce();
        // console.log(response);
        for(var i=0;i<10;i++){
            if(answers[i]==response[i])
            correct++;
            else if(response[i] == 4 )
            skip++;
            else 
            wrong++;
        }
        score=correct*4-wrong;
        // console.log(score);

        $('#attempt').text(`Attempts: ${10-skip}`);
        $('#correct').text(`Correct: ${correct}`);
        $('#wrong').text(`Wrong: ${wrong}`);
        $('#score').text(`Score: ${score}`);
        $('Quizmodal').show();

        var time=new Date();
        var id=firebase.database.ServerValue.TIMESTAMP;
        db.collection('user').doc(`${uid.trim()}`).collection('quiz').add({
            correct:correct,
            json:json,
            wrong:wrong,
            skip:skip,
            score:score,
            time:`${time}`,
        }).then(()=>{
            window.alert('Saved succesfully');
        }).catch((error)=>{
            window.alert(`Error ${error.code} : ${error.message}`);
        });
        var xhr = new XMLHttpRequest();
        var options=quizData.options;
        var ans=quizData.answers;
        var correct_answers=[];
        for(var i=0;i<10;i++){
            correct_answers.push(options[i*4+ans[i]]);
        }
        var mailData={
            uid:`${uid.trim()}`,
            correct:`${correct}`,
            question:quizData.question,
            answer:correct_answers,
            wrong:`${wrong}`,
            skip:`${skip}`,
            score:`${score}`,
            time:`${time}`,
        };
        var sender=JSON.stringify(mailData);
        // console.log(mailData);
        xhr.open('POST',`mail`,true);
        xhr.setRequestHeader("Content-type", "application/json");
        xhr.send(sender);
        isSubmitted=true;
    }else{
        window.alert('Sorry, you have already submitted!!')
    }
});