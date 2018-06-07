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
var mySound, uploadBtn, playPauseBtn, downloadBtn, uploadedAudio, uploadAnim;

var ellipseDiameterZoomFactor;

const ampFactor = 0.8;



//defines a frequency range - factor 1 maps from 0 to spectrum.length so from 0Hz to around 22Khz. Factor 4 can be seen as dividor -> 22khz : 4 = 5.5Khz  so the range would be 0 to 5.5khz
const horizontalZoomFactor = 5;

//personal favorite Ratio after trying different strokeweights.
const strokeWeight = canvasHeight/614 < 1 ? 1: canvasHeight/614;

const sampleRate = 44100;




// ===================================================

var interactionThreshold;

var circlesY;

var soundMP3Paths = [];

var cnv;


var dropdown;

var maxAmplitudeCircles = [];

var interactiveCircles = [];

var max= new Array(sampleRate/2);//array that contains the half of the sampleRate size, because FFT only reads the half of the sampleRate frequency. This array will be filled with amplitude values.

var frequency;//the frequency in hertz

var spectrum = [];

var centroids = [];

var textCounter = 0;

var currentHoveringCircle = null;

var graphicsBuffer = [];

var lastInteractedCircle = null;

var needToRedraw = false;

var hoveringIndices = [];

var myFont;

var filteredCircles = [];



function preload() {
    myFont = loadFont('assets/Roboto-Regular.ttf');
}

function uploaded(file){
    upLoad = true;
    loadSound(file.data, resetAndPlay);

}


function resetAndPlay(audioFile){
    upLoad = false;
    if(mySound.isPlaying()){
        mySound.pause();
    }
    mySound = audioFile;
    mySound.amp(ampFactor);
    background(0);
    graphicsBuffer = new Array(fft.bins);
    maxAmplitudeCircles = new Array(fft.bins);
    mySound.play();
}



function setup() {

    frameRate(30);

    soundMP3Paths[0]= 'assets/klangschale_gr7_sc37307.mp3';
    soundMP3Paths[1]= 'assets/klangschale_gr10_sc37310.mp3';
    soundMP3Paths[2]= 'assets/klangschale1.mp3';
    soundMP3Paths[3]= 'assets/klangschale2.mp3';
    soundMP3Paths[4]= 'assets/klangschale3.mp3';
    soundMP3Paths[5]= 'assets/klangschale4.mp3';

    cnv = createCanvas(windowWidth,windowHeight);

  //  createCanvas(canvasWidth,canvasHeight);

    uploadAnim = select('#uploading-animation');

    playPauseBtn = createButton("Start / Stopp");

    uploadBtn = createFileInput(uploaded);

    uploadBtn.addClass("upload-btn");

    uploadBtn.addClass("upload-btn");

    playPauseBtn.addClass("toggle-btn");

    playPauseBtn.mousePressed(toggleAudio);

    downloadBtn = createButton("Klangschalen-DNA herunterladen");

    downloadBtn.addClass("download-btn");

    downloadBtn.mousePressed(saveImage);

    dropdown = document.getElementById("dropdown");

    circlesY = windowHeight/2;
    interactionThreshold= windowHeight/10*5;
    ellipseDiameterZoomFactor = windowHeight/300;

    background(0);

    fft = new p5.FFT(0,512);

    textFont(myFont);


    mySound = loadSound(soundMP3Paths[dropdown.selectedIndex],resetAndPlay);
}

function redrawGraphicsBuffer() {
    background(0);
    for (var i = 0; i < graphicsBuffer.length; i++) {
        redrawCircle(graphicsBuffer[i]);
    }
}
function getStroke(amplitude) {
    stroke(100, 100 - (amplitude / 4), 15, 8);
}
function draw() {




    if(mouseY>windowHeight/4 && mouseY<(3*(windowHeight/4))){

        filteredCircles = maxAmplitudeCircles.filter(function (el) {
            if(el==null || graphicsBuffer[el.index]==null)return false;

            var circlesAboveThreshold = graphicsBuffer[el.index].filter(function(a){
                return a.diameter >interactionThreshold;
            })
            return circlesAboveThreshold.length > 8;
        });
        //console.log(filteredCircles);

        var closestCircleIndex = findClosest(mouseX,filteredCircles);

        if(closestCircleIndex!=-1) {
            currentHoveringCircle = maxAmplitudeCircles[closestCircleIndex];
        }
    }else{
        currentHoveringCircle = null;

        if(needToRedraw){
            background(0);
            redrawGraphicsBuffer();
            needToRedraw = false;}
    }


    if (currentHoveringCircle != null) {

        if(lastInteractedCircle == null || lastInteractedCircle.index != currentHoveringCircle.index || !needToRedraw) {
            background(0,150);
            redrawCircle(graphicsBuffer[currentHoveringCircle.index]);
            fill(50);
            textSize(20);
            textAlign(CENTER);
            text("Ton: "+ getMusicalNoteFromMidi(currentHoveringCircle.midi), (currentHoveringCircle.x), currentHoveringCircle.y);
            text(round(currentHoveringCircle.frequency)+ "Hz",(currentHoveringCircle.x), currentHoveringCircle.y+20);
            noFill();
        }
        lastInteractedCircle = currentHoveringCircle;
        needToRedraw = true;

    }


    if(mySound.isPlaying()){
    spectrum = fft.analyze();


    for (var i = 0; i < spectrum.length; i++) {
        // the whole frequency spectrum in the image - x axis.. Not really useful in this case because "klangschalen"s frequencies conentrate from 0 to 2000 hz..
        var x = map(i, 0, spectrum.length, 100, canvasWidth * horizontalZoomFactor);


        //---------- also Interesting visualization of energy
        //var amplitude = fft.getEnergy(i);
        //console.log(amplitude+" AMP at i");
        //console.log(fft.getEnergy(i)+" ENERGY at i");

        var amplitude = spectrum[i];

        //console.log(fft.getCentroid());
        //Opportunity of showing the dominant mean center of the soundfile.. for example as vertical line..
        //centroids.push(fft.getCentroid());
        //console.log(fft.getCentroid());

        var diameter = getScaledDiameter(amplitude, ellipseDiameterZoomFactor);

        if (maxAmplitudeCircles[i] == null || amplitude > maxAmplitudeCircles[i].amplitude) {

            maxAmplitudeCircles[i] = {
                x: x,
                y: circlesY,
                diameter: diameter,
                amplitude: amplitude,
                midi: freqToMidi(i * (44100 / fft.bins / 2)),
                frequency: i * (44100 / fft.bins / 2),
                index: i
            }
        }


        /*var distance = dist(mouseX, mouseY, maxAmplitudeCircles[i].x, maxAmplitudeCircles[i].y);
        if (maxAmplitudeCircles[i].diameter > interactionThreshold && distance < (maxAmplitudeCircles[i].diameter / 4)) {

        }
        */
        noFill();
        colorMode(RGB, 100);

        getStroke(amplitude);


        if (x < canvasWidth && diameter != 0) {
            if(graphicsBuffer[i]== null) graphicsBuffer[i] = [];
            graphicsBuffer[i].push({
                x: x,
                y: circlesY,
                diameter: diameter,
                amplitude: amplitude,
                midi: freqToMidi(i * (44100 / fft.bins / 2)),
                frequency: i * (44100 / fft.bins / 2),
                index: i
            })


            if(currentHoveringCircle ==null || currentHoveringCircle.index == i){
                ellipse(x, circlesY, getScaledDiameter(amplitude, ellipseDiameterZoomFactor), getScaledDiameter(amplitude, ellipseDiameterZoomFactor));
            }

        }
    }
    }

        endShape();
    }



    function getScaledDiameter(amplitude, ellipseDiameterZoomFactor) {
        return amplitude * ellipseDiameterZoomFactor;
    }

    function getMusicalNoteFromMidi(midi) {
        var n = midi;
        var note = "";
        //the octave have 12 tones and semitones. So, if we get a modulo of 12, we get the note names independently of the frequency
        if (n % 12 == 9) {
            note = ("a");
        }

        if (n % 12 == 10) {
            note = ("a#");
        }

        if (n % 12 == 11) {
            note = ("b");
        }

        if (n % 12 == 0) {
            note = ("c");
        }

        if (n % 12 == 1) {
            note = ("c#");
        }

        if (n % 12 == 2) {
            note = ("d");
        }

        if (n % 12 == 3) {
            note = ("d#");
        }

        if (n % 12 == 4) {
            note = ("e");
        }

        if (n % 12 == 5) {
            note = ("f");
        }

        if (n % 12 == 6) {
            note = ("f#");
        }

        if (n % 12 == 7) {
            note = ("g");
        }

        if (n % 12 == 8) {
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


function saveImage() {
    drawInfosForScreenshot();
}


function redrawCircle(circlesAtBandI){
    if(circlesAtBandI!=null) {
        for (var i = 0; i < circlesAtBandI.length; i++) {
            if (circlesAtBandI[i] != null) {
                noFill();
                stroke(100, 100 - (circlesAtBandI[i].amplitude / 4), 15, 8);
                ellipse(circlesAtBandI[i].x, circlesAtBandI[i].y, circlesAtBandI[i].diameter, circlesAtBandI[i].diameter);
            }
        }
    }
}



function selectFunction() {
    loadSound(soundMP3Paths[dropdown.selectedIndex],resetAndPlay);
}


function findClosest(num, arr) {
    if(arr==null || arr.length==0){
        return -1;
    }

    var curr = arr[0].x;
    var index = 0;
    var diff = Math.abs (num - curr);
    for (var val = 0; val < arr.length; val++) {
        var newdiff = Math.abs (num - arr[val].x);
        if (newdiff < diff) {
            diff = newdiff;
            curr = arr[val].x;
            index = arr[val].index;
        }
    }

    return index;
}


function drawInfosForScreenshot(){
    var maximumAmountOfCircleInfo = 100;
    fill(100);
    textSize(16);
    textAlign(CENTER);
    var lastXPos = 0;
    var sortedFilteredCircles = filteredCircles.sort(compareXPos);
    //console.log(sortedFilteredCircles);

    for(var i=0;i< (sortedFilteredCircles.length > maximumAmountOfCircleInfo ? maximumAmountOfCircleInfo : sortedFilteredCircles.length);i++){
        /*if(i>0){
            if(sortedFilteredCircles[i+1].frequency-sortedFilteredCircles[i].frequency > 20){

            }
        }*/

        console.log(graphicsBuffer[sortedFilteredCircles[i].index]);
        var xPos = sortedFilteredCircles[i].x - lastXPos < 60? lastXPos+60 : sortedFilteredCircles[i].x;
        lastXPos=xPos;
        noStroke();
        text("Ton: "+ getMusicalNoteFromMidi(sortedFilteredCircles[i].midi), xPos, 30);
        text(round(sortedFilteredCircles[i].frequency)+ "Hz",xPos, 50);
        stroke(80);
        line(xPos,50,sortedFilteredCircles[i].x,sortedFilteredCircles[i].y);

    }
    saveCanvas('Klangschalen_DNA', 'jpg');
}

function compareXPos(a,b) {
    if (a.x < b.x)
        return -1;
    if (a.x > b.x)
        return 1;
    return 0;
}