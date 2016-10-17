(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BlurModule = exports.BlurModule = function () {
  function BlurModule(audioContext) {
    _classCallCheck(this, BlurModule);

    console.log("blurmodule constructor");
    var biquadFilter = audioContext.createBiquadFilter();
    var convolver = audioContext.createConvolver();

    var inputNode = audioContext.createGain();
    var outputNode = audioContext.createGain();
    this.dryLevel = audioContext.createGain();
    this.wetLevel = audioContext.createGain();
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

    this.audioInput = inputNode;
    this.audioOutput = outputNode;

    biquadFilter.type = "lowpass";
    biquadFilter.frequency.value = 300;

    //most code of this function comes from http://middleearmedia.com/web-audio-api-convolver-node/
    function getImpulse(impulseUrl) {
      // let convolver = audioContext.createConvolver();
      var ajaxRequest = new XMLHttpRequest();
      ajaxRequest.open('GET', impulseUrl, true);
      ajaxRequest.responseType = 'arraybuffer';
      ajaxRequest.onload = function () {
        var impulseData = ajaxRequest.response;
        audioContext.decodeAudioData(impulseData, function (buffer) {
          var myImpulseBuffer = buffer;
          convolver.buffer = myImpulseBuffer;
          convolver.loop = true;
          convolver.normalize = true;
        }, function (e) {
          "Error with decoding audio data" + e.err;
        });
      };

      ajaxRequest.send();
    }
    // getImpulse("audio/Batcave.wav");
    getImpulse("audio/TunnelToHell.wav");
  }

  _createClass(BlurModule, [{
    key: "connect",
    value: function connect(audioInputNode) {
      this.audioOutput.connect(audioInputNode);
    }
  }, {
    key: "control",
    value: function control(value) {
      var wet = value;
      this.dryLevel.gain.value = 1 - wet;
      this.wetLevel.gain.value = wet;
    }
  }]);

  return BlurModule;
}();

},{}],2:[function(require,module,exports){
'use strict';

var bm = require('./blurModule.js');
document.addEventListener('DOMContentLoaded', function () {
  console.log("init audio 3");
  var audioContext = new (window.AudioContext || window.webkitAudioContext)();
  var output = audioContext.destination;
  var looperModule = new function () {
    var source = audioContext.createBufferSource();
    source.loop = true;
    this.init = function () {
      source = audioContext.createBufferSource();
      var request = new XMLHttpRequest();

      request.open('GET', 'audio/bb_140_alphafunki.wav', true);

      request.responseType = 'arraybuffer';

      request.onload = function () {
        console.log("request", request);
        var audioData = request.response;

        audioContext.decodeAudioData(audioData, function (buffer) {
          var myBuffer = buffer;
          source.buffer = myBuffer;
          // source.connect(output);
          source.start();
          source.loop = true;
        }, function (e) {
          "Error with decoding audio data" + e.err;
        });
      };

      request.send();
    };
    this.init();
    this.connect = function (audioInputNode) {
      source.connect(audioInputNode);
    };
    return this;
  }();

  var module = new bm.BlurModule(audioContext);

  looperModule.connect(module.audioInput);

  module.connect(output);
  var duck = document.createElement("img");
  duck.src = "assets/duck.png";
  duck.style.position = "absolute";
  document.body.appendChild(duck);
  document.addEventListener('mousemove', function (e) {
    // console.log(document.width);
    module.control(e.clientX / (window.innerWidth - 5));
    duck.style.left = e.clientX - 200 + "px";
    duck.style.top = window.innerHeight - 180 + "px";
  });
});

},{"./blurModule.js":1}]},{},[2])


//# sourceMappingURL=build.js.map
