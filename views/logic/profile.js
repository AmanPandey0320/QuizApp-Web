var uid=$('#dataP').text();
// console.log(uid);
$('#dataP').remove();

var ab,av,nm,em;
var temp_av;

var xhr = new XMLHttpRequest();
xhr.open("GET",`getdata?uid=${uid}`,true);
xhr.onreadystatechange= function(){
    if(this.readyState == 4){
        if(this.status==200){
            var data= JSON.parse(this.response);
            nm=data.nm;
            em=data.em;
            ab=data.ab;
            av=data.av;
            temp_av=av;
            $('#userName').text(nm);
            $('#userAbout').text(ab);
            $('#userEmail').text(em);
            $('#userAvatar').attr("src",`./assets/avatar/${av}`);
        }else{
            location.href=`error?status=${this.status}`;
        }
    }
};
xhr.send();

$('#saveBtn').click(()=>{
    xhr.open('POST',`updateProfile?uid=${uid}`);
    xhr.setRequestHeader("Content-type", "application/json");
    var data={
        ab:ab,
        nm:nm,
        av:av,
        em:em,
    };
    var sender=JSON.stringify(data);
    xhr.onreadystatechange= function(){
        if(this.readyState==4){
            if(this.status==200){
                alert('Profile updated successfully!');
            }else{
                location.href=`error?status=${this.status}`;
            }
        }
    }
    xhr.send(sender);
});
function changeAvatar(element){
    temp_av=`${$(element).attr("id")}.png`;
    $('#userAvatar').attr("src",`./assets/avatar/${temp_av}`);
    // window.alert(`${temp_av}`);
}

$('#doneBtn').click(()=>{
    console.log('done');
    av=temp_av;
    if($('#newName').val()!=null)
    nm=$('#newName').val();
    if($('#newAbout').val()!=null)
    ab=$('#newAbout').val();
    $('#userName').text(nm);
    $('#userAbout').text(ab);
    $('#userAvatar').attr("src",`./assets/avatar/${av}`);
});
$('#practiceBtn').click(()=>{
    location.href=`practice?uid=${uid}`;
});
$('#myquizBtn').click(()=>{
    location.href=`myquiz?uid=${uid}`;
});
$('#home').click(()=>{
    location.href=`home?uid=${uid}`;
});