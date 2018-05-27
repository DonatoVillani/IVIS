/**
 * Created by Marco on 17.04.18.
 */
//Minim       minim;
//AudioPlayer in;
//FFT         fft;

// ====================CONSTANTS======================
var canvasHeight = 2000;
var canvasWidth = 4000;

const ampFactor = 0.8;

//defines a frequency range - factor 1 maps from 0 to spectrum.length so from 0Hz to around 22Khz. Factor 4 can be seen as dividor -> 22khz : 4 = 5.5Khz  so the range would be 0 to 5.5khz
const horizontalZoomFactor = 4;

//personal favorite Ratio after trying different strokeweights.
const strokeWeight = canvasHeight/614 < 1 ? 1: canvasHeight/614;
// ===================================================


var amps = [];


function preload() {
    soundFormats('mp3', 'ogg');
    mySound = loadSound('assets/klangschale_gr7_sc37307.mp3');
}

function setup() {

    var cnv = createCanvas(canvasWidth,canvasHeight);
    background(10);
    fft = new p5.FFT();
    mySound.amp(ampFactor);
    mySound.play();
}

function draw() {


    var spectrum = fft.analyze();

    for (var i = 0; i< spectrum.length; i++){

        var scaledAmplitude = spectrum[i] *1.5;

        //var scaledAmplitude = map(spectrum[i], 0, 256, 0, 1000)
       // var x = map(i, 0, spectrum.length, 0, width);
       // var h = -height + map(spectrum[i], 0, 255, height, 0);
        //rect(x, height, width / spectrum.length, h )
        //strokeWeight(4);
        noFill();
        colorMode(RGB,100);
        //stroke(240,220-(scaledAmplitude/2),15,9);
        stroke(100,100-(scaledAmplitude/4),15,8);
        //console.log("spectrum iteration: "+ i + "with ampl:" + scaledAmplitude);

        // the whole frequency spectrum in the image - x axis.. Not really useful in this case because "klangschalen"s frequencies conentrate from 0 to 2000 hz..
        var x = map(i, 0, spectrum.length, 0, width * horizontalZoomFactor);

        //manual but working
        //ellipse(((canvasWidth/100)*i), canvasHeight/2, scaledAmplitude*(canvasHeight/400), scaledAmplitude*(canvasHeight/400));
        ellipse(x, canvasHeight/2, scaledAmplitude*(canvasHeight/400), scaledAmplitude*(canvasHeight/400));

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

