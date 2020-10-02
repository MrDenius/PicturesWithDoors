function InitDaD(dz, input){
    $dropzone = dz
    dz.ondrop = ev => dropHandler(ev)
    dz.ondragover = ev => dragOverHandler(ev)
}

let $dropzone
let dt

function dropHandler(ev) {
    console.log('File(s) dropped');
    console.log(ev.dataTransfer)
    console.log(JSON.stringify(ev.dataTransfer.files[0]))
    dt = ev.dataTransfer
    // Prevent default behavior (Prevent file from being opened)
    ev.stopPropagation();
    ev.preventDefault();

  var reader = new FileReader();
    reader.onload = function(){
      var output = document.getElementById('output');
      output.src = reader.result;
    };
    reader.readAsDataURL(ev.dataTransfer.files[0]);
    console.log(ev.dataTransfer.files[0])
    InitDC(output, ev.dataTransfer.files[0].name)
    
  }
  
  function dragOverHandler(ev) {
    console.log('File(s) in drop zone'); 
    ev.dataTransfer.dropEffect = 'copy';
  
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();
    ev.stopPropagation();
  }