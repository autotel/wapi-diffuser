let filterLowestCut=80;
let filterHighestCut=20000;

export class BlurModule{
  constructor(audioContext){
    console.log("blurmodule constructor");
    let thisBlurModule=this;

    this.biquadFilter = audioContext.createBiquadFilter();
    this.convolver=audioContext.createConvolver();

    let inputNode=audioContext.createGain();
    let outputNode=audioContext.createGain();
    this.dryLevel=audioContext.createGain();
    this.wetLevel=audioContext.createGain();
    /*
    [input node _______________________]
      V
    [Low pass filte ___________________]
      V                    V
    [dryLevel node]     [wetLevel node]
      |                    V
      |                 [convolver]
      V                    V
    [output node _____________________]
    */

    inputNode.connect(this.biquadFilter);

    this.biquadFilter.connect(this.dryLevel);
    this.biquadFilter.connect(this.wetLevel);

    this.dryLevel.connect(outputNode);
    this.wetLevel.connect(this.convolver);

    this.convolver.connect(outputNode);


    this.audioInput=inputNode;
    this.audioOutput=outputNode;

    this.biquadFilter.type = "lowpass";
    this.biquadFilter.frequency.value = 300;

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
          thisBlurModule.convolver.buffer = myImpulseBuffer;
          thisBlurModule.convolver.loop = true;
          thisBlurModule.convolver.normalize = true;
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
    let filterCut=(1-value*value)*filterHighestCut+filterLowestCut;
    console.log(filterCut);
    this.biquadFilter.frequency.value=filterCut;
    this.dryLevel.gain.value=1-wet;
    this.wetLevel.gain.value=wet;
  };
}