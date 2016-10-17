export class BlurModule{
  constructor(audioContext){
    console.log("blurmodule constructor");
    let biquadFilter = audioContext.createBiquadFilter();
    let convolver=audioContext.createConvolver();

    let inputNode=audioContext.createGain();
    let outputNode=audioContext.createGain();
    this.dryLevel=audioContext.createGain();
    this.wetLevel=audioContext.createGain();
    /*
    [input node_______________________]
      V                    V
    [dryLevel node]     [wetLevel node]
      |                    V
      |                 [Low pass filter]
      |                 [convolver]
      V                    V
    [output node_____________________]

    */
    inputNode.connect(this.dryLevel);
    inputNode.connect(this.wetLevel);

    this.dryLevel.connect(outputNode);
    this.wetLevel.connect(biquadFilter);

    biquadFilter.connect(convolver);
    convolver.connect(outputNode);


    this.audioInput=inputNode;
    this.audioOutput=outputNode;

    biquadFilter.type = "lowpass";
    biquadFilter.frequency.value = 300;

    //most code of this function comes from http://middleearmedia.com/web-audio-api-convolver-node/
    function getImpulse(impulseUrl) {
      // let convolver = audioContext.createConvolver();
      let ajaxRequest = new XMLHttpRequest();
      ajaxRequest.open('GET', impulseUrl, true);
      ajaxRequest.responseType = 'arraybuffer';
      ajaxRequest.onload = function() {
        let impulseData = ajaxRequest.response;
        audioContext.decodeAudioData(impulseData, function(buffer) {
          let myImpulseBuffer = buffer;
          convolver.buffer = myImpulseBuffer;
          convolver.loop = true;
          convolver.normalize = true;
        },
        function(e){"Error with decoding audio data" + e.err});

      }

      ajaxRequest.send();
    }
    // getImpulse("audio/Batcave.wav");
    getImpulse("audio/TunnelToHell.wav");
  }
  connect(audioInputNode){
    this.audioOutput.connect(audioInputNode);
  }
  control(value){
    let wet=value;
    this.dryLevel.gain.value=1-wet;
    this.wetLevel.gain.value=wet;
  };
}