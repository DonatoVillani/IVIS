/**
 * Created by Marco on 17.04.18.
 */
//Minim       minim;
//AudioPlayer in;
//FFT         fft;

// ====================CONSTANTS======================
var canvasHeight = 800;
var canvasWidth = 1000;

const ampFactor = 0.8;
// ===================================================


var amps = [];


function preload() {
    soundFormats('mp3', 'ogg');
    mySound = loadSound('assets/klangschale_gr7_sc37307.mp3');
}

function setup() {

    var cnv = createCanvas(canvasWidth,canvasHeight);
    background(0);
    fft = new p5.FFT();
    mySound.amp(ampFactor);
    mySound.play();
}

function draw() {


    var spectrum = fft.analyze();

    for (var i = 0; i< spectrum.length; i++){
        var scaledAmplitude = spectrum[i]*1.5;
       // var x = map(i, 0, spectrum.length, 0, width);
       // var h = -height + map(spectrum[i], 0, 255, height, 0);
        //rect(x, height, width / spectrum.length, h )
        strokeWeight(1);
        noFill();
        stroke(100,100-(scaledAmplitude/4),15,8);

        //ellipse(((canvasWidth/100)*i), canvasHeight/2, scaledAmplitude*(canvasHeight/400), scaledAmplitude*(canvasHeight/400));
        ellipse(((canvasWidth/100)*i), canvasHeight/2, scaledAmplitude*(canvasHeight/400), scaledAmplitude*(canvasHeight/400));
        //getMaxAmp per Band
        //if(scaledAmplitude>amps[i]){amps[i]=scaledAmplitude;}

    }

  /*  var waveform = fft.waveform();
    noFill();
    beginShape();
    stroke(255,0,0); // waveform is red
    strokeWeight(1);
    for (var i = 0; i< waveform.length; i++){
        var x = map(i, 0, waveform.length, 0, width);
        var y = map( waveform[i], -1, 1, 0, height);
        vertex(x,y);
    }*/

    endShape();
}

