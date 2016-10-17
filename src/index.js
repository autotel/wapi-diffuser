var bm=require('./blurModule.js');
document.addEventListener('DOMContentLoaded',function(){
  console.log("init audio 3");
  var audioContext = new (window.AudioContext || window.webkitAudioContext)();
  var output=audioContext.destination;
  var looperModule=new (function(){
    var source = audioContext.createBufferSource();
    source.loop = true;
    this.init=function() {
      source = audioContext.createBufferSource();
      var request = new XMLHttpRequest();

      request.open('GET', 'audio/bb_140_alphafunki.wav', true);

      request.responseType = 'arraybuffer';

      request.onload = function() {
        console.log("request",request);
        var audioData = request.response;

        audioContext.decodeAudioData(audioData, function(buffer) {
            var myBuffer = buffer;
            source.buffer = myBuffer;
            // source.connect(output);
            source.start();
            source.loop = true;
          },

          function(e){"Error with decoding audio data" + e.err});

      }

      request.send();
    }
    this.init();
    this.connect=function(audioInputNode){
      source.connect(audioInputNode);
    }
    return this;
  })();

  var module=new bm.BlurModule(audioContext);

  looperModule.connect(module.audioInput);


  module.connect(output);
  let duck=document.createElement("img");
  duck.src="assets/duck.png"
  duck.style.position="absolute";
  document.body.appendChild(duck);
  document.addEventListener('mousemove',function(e){
    // console.log(document.width);
    module.control(e.clientX/(window.innerWidth-5));
    duck.style.left=e.clientX-200+"px";
    duck.style.top=window.innerHeight-180+"px";
  });

});