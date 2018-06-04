/**
 * Created by Marco on 17.04.18.
 */
//Minim       minim;
//AudioPlayer in;
//FFT         fft;

// ====================CONSTANTS======================
var canvasHeight = 1000;
var canvasWidth = 2000;
var upLoad = false;
var mySound, uploadBtn, playPauseBtn, uploadedAudio, uploadAnim;

const ellipseDiameterZoomFactor = (canvasHeight/300);

const ampFactor = 0.8;

const interactionThreshold = canvasHeight/10*5;

//defines a frequency range - factor 1 maps from 0 to spectrum.length so from 0Hz to around 22Khz. Factor 4 can be seen as dividor -> 22khz : 4 = 5.5Khz  so the range would be 0 to 5.5khz
const horizontalZoomFactor = 5;

//personal favorite Ratio after trying different strokeweights.
const strokeWeight = canvasHeight/614 < 1 ? 1: canvasHeight/614;

const sampleRate = 44100;

const circlesY = canvasHeight/2;
// ===================================================


var interactionCanvas;

var canvasDrawing = [];
var cnv;

var distances = [];

var maxAmpPerFrequency = new Array (sampleRate/2);
var interactiveCircles = [];

var max= new Array(sampleRate/2);//array that contains the half of the sampleRate size, because FFT only reads the half of the sampleRate frequency. This array will be filled with amplitude values.
var maximum;//the maximum amplitude of the max array
var frequency;//the frequency in hertz

var spectrum = [];

var centroids = [];

var textCounter = 0;

function preload() {
    mySound = loadSound('assets/klangschale_gr7_sc37307.mp3');
}

function uploaded(file){
    upLoad = true;
    uploadedAudio = loadSound(file.data, uploadedAudioPlay);
    setup();
}


function uploadedAudioPlay(audioFile){
    upLoad = false;
    if(mySound.isPlaying()){
        mySound.pause();
    }

    mySound = audioFile;
    mySound.play();
}



function setup() {

    createCanvas(windowWidth,windowHeight);

    uploadAnim = select('#uploading-animation');

    playPauseBtn = createButton("Play / Pause");

    uploadBtn = createFileInput(uploaded);

    uploadBtn.addClass("upload-btn");

    uploadBtn.addClass("upload-btn");

    playPauseBtn.addClass("toggle-btn");

    playPauseBtn.mousePressed(toggleAudio);


    background(50);

    interactionCanvas = createGraphics(300,100);
    interactionCanvas.background(0,0,0,0);


    fft = new p5.FFT();
    mySound.amp(ampFactor);
   // mySound.play();
}

function draw() {

    //Add a loading animation for the uploaded track
    if (upLoad) {
        uploadAnim.addClass('is-visible');
    } else {
        uploadAnim.removeClass('is-visible');
    }


    spectrum = fft.analyze();


    for (var i = 0; i< spectrum.length; i++){
        // the whole frequency spectrum in the image - x axis.. Not really useful in this case because "klangschalen"s frequencies conentrate from 0 to 2000 hz..
        var x = map(i, 0, spectrum.length, 0, canvasWidth * horizontalZoomFactor);



        //---------- also Interesting visualization of energy
        //var amplitude = fft.getEnergy(i);
        //console.log(amplitude+" AMP at i");
        //console.log(fft.getEnergy(i)+" ENERGY at i");

        var amplitude = spectrum[i];


        //Opportunity of showing the dominant mean center of the soundfile.. for example as vertical line..
        //centroids.push(fft.getCentroid());
        //console.log(fft.getCentroid());

        if (interactiveCircles[i] == null || amplitude > interactiveCircles[i].maxAmplitude){
            interactiveCircles[i] = {x:x, y:circlesY, diameter:getScaledDiameter(amplitude,ellipseDiameterZoomFactor), maxAmplitude:amplitude}
        }

        var distance = dist(mouseX, mouseY, interactiveCircles[i].x, interactiveCircles[i].y);
        if(interactiveCircles[i].diameter > interactionThreshold && distance < (interactiveCircles[i].diameter/2)){
            //console.log(i+ " DIST "+ distance);



            var frequencyHertz = i * 44100 / fft.bins;
            console.log("MIDI" + freqToMidi(frequencyHertz));
            //console.log(freqToMidi(interactiveCircles[i].maxAmplitude));
            console.log(i * 44100 / fft.bins);//freq = i_max * Fs / N)
            interactionCanvas.fill(255);
            interactionCanvas.textSize(30);
            interactionCanvas.text("LOL");
            //text(getMusicalNoteFromMidi(freqToMidi(frequencyHertz)) +" "+ frequencyHertz+" Hz", canvasWidth-100, 100*textCounter);
            stroke(0,i%4*i*20,i%4*i*20);
            //line(interactiveCircles[i].x, interactiveCircles[i].y, mouseX, mouseY);
            //fill(255);
            //ellipse(interactiveCircles[i].x,interactiveCircles[i].y,interactiveCircles[i].diameter,interactiveCircles[i].diameter);
            //console.log(interactiveCircles[i]);

        }else{
            interactionCanvas.background(0);
        }
       // image(interactionCanvas, 0, 0);


        //image(interactionCanvas, 0, 0);

        //console.log(maxAmpPerFrequency);

        //var scaledAmplitude = map(spectrum[i], 0, 256, 0, 1000)
       // var x = map(i, 0, spectrum.length, 0, width);
       // var h = -height + map(spectrum[i], 0, 255, height, 0);
        //rect(x, height, width / spectrum.length, h )
        //strokeWeight(4);
        noFill();
        colorMode(RGB,100);
        //stroke(240,220-(scaledAmplitude/2),15,9);
        stroke(100,100-(amplitude/4),15,8);
        //console.log("spectrum iteration: "+ i + "with ampl:" + scaledAmplitude);



        //manual but working
        //ellipse(((canvasWidth/100)*i), canvasHeight/2, scaledAmplitude*(canvasHeight/400), scaledAmplitude*(canvasHeight/400));
        if(x < canvasWidth) {
            ellipse(x, circlesY, getScaledDiameter(amplitude,ellipseDiameterZoomFactor), getScaledDiameter(amplitude,ellipseDiameterZoomFactor));
        }


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


function findNote() {
    var frequency = 0.0;
    for (var f=0;f<sampleRate/2;f++) { //analyses the amplitude of each frequency analysed, between 0 and 22050 hertz
        max[f]=fft.getFreq(f); //each index is correspondent to a frequency and contains the amplitude value
    }
    maximum=max(max);//get the maximum value of the max array in order to find the peak of volume

    for (var i=0; i<max.length; i++) {// read each frequency in order to compare with the peak of volume
        if (max[i] == maximum) {//if the value is equal to the amplitude of the peak, get the index of the array, which corresponds to the frequency
            frequency= i;
        }
    }
    return frequency;
}


function getScaledDiameter(amplitude,ellipseDiameterZoomFactor){
    return amplitude*ellipseDiameterZoomFactor;
}

/*
function getCircleXCoordinate(i, spectrum.length){
    return map(i, 0, spectrum.length, 0, width * horizontalZoomFactor);
}*/


function getMusicalNoteFromMidi(midi){
    var n = midi;
    var note ="";
    //the octave have 12 tones and semitones. So, if we get a modulo of 12, we get the note names independently of the frequency
    if (n%12==9)
    {
        note = ("a");
    }

    if (n%12==10)
    {
        note = ("a#");
    }

    if (n%12==11)
    {
        note = ("b");
    }

    if (n%12==0)
    {
        note = ("c");
    }

    if (n%12==1)
    {
        note = ("c#");
    }

    if (n%12==2)
    {
        note = ("d");
    }

    if (n%12==3)
    {
        note = ("d#");
    }

    if (n%12==4)
    {
        note = ("e");
    }

    if (n%12==5)
    {
        note = ("f");
    }

    if (n%12==6)
    {
        note = ("f#");
    }

    if (n%12==7)
    {
        note = ("g");
    }

    if (n%12==8)
    {
        note = ("g#");
    }

    return note;
}

function toggleAudio() {
    if (mySound.isPlaying()) {
        mySound.pause();
    } else {
        mySound.play();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}
