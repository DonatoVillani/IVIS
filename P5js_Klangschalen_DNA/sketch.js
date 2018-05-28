/**
 * Created by Marco on 17.04.18.
 */
//Minim       minim;
//AudioPlayer in;
//FFT         fft;

// ====================CONSTANTS======================
var canvasHeight = 1000;
var canvasWidth = 2000;

const ampFactor = 0.8;

const interactionThreshold = canvasHeight/10;

//defines a frequency range - factor 1 maps from 0 to spectrum.length so from 0Hz to around 22Khz. Factor 4 can be seen as dividor -> 22khz : 4 = 5.5Khz  so the range would be 0 to 5.5khz
const horizontalZoomFactor = 5;

//personal favorite Ratio after trying different strokeweights.
const strokeWeight = canvasHeight/614 < 1 ? 1: canvasHeight/614;

const sampleRate = 44100;

const circlesY = canvasHeight/2;
// ===================================================


var amps = [];
var cnv;

var distances = [];

var maxAmpPerFrequency = new Array (sampleRate/2);
var interactiveCircles = [];

var max= new Array(sampleRate/2);//array that contains the half of the sampleRate size, because FFT only reads the half of the sampleRate frequency. This array will be filled with amplitude values.
var maximum;//the maximum amplitude of the max array
var frequency;//the frequency in hertz


function preload() {
    soundFormats('mp3', 'ogg');
    mySound = loadSound('assets/klangschale_gr7_sc37307.mp3');
}

function setup() {

    createCanvas(canvasWidth,canvasHeight);
    interactionCanvas = createCanvas(canvasWidth,canvasHeight);
    background(10);
    fft = new p5.FFT();
    mySound.amp(ampFactor);
    mySound.play();
}

function draw() {


    var spectrum = fft.analyze();


    for (var i = 0; i< spectrum.length; i++){
        // the whole frequency spectrum in the image - x axis.. Not really useful in this case because "klangschalen"s frequencies conentrate from 0 to 2000 hz..
        var x = map(i, 0, spectrum.length, 0, canvasWidth * horizontalZoomFactor);

        //console.log(x);
        var scaledAmplitude = spectrum[i] *1.2;

        if (interactiveCircles[i] == null || scaledAmplitude > interactiveCircles[i].maxAmplitude){
            interactiveCircles[i] = {x:x, y:circlesY, radius:getRadius(scaledAmplitude), maxAmplitude:scaledAmplitude};
            //console.log(interactiveCircles);
        }

        var distance = dist(mouseX, mouseY, interactiveCircles[i].x, interactiveCircles[i].y);
        if(interactiveCircles[i].radius > interactionThreshold && distance < interactiveCircles[i].radius){
            console.log("DIST"+ distance);
            //console.log(interactiveCircles[i]);
        }


/*
        for (var j=0; j< interactiveCircles.length;j++) {
            var distance = dist(mouseX, mouseY, interactiveCircles[j].x, interactiveCircles[j].y);
            if (interactiveCircles[j] != null && interactiveCircles[j] > interactionThreshold) {
                if(distance < interactiveCircles[j].radius){
                    fill(255);
                    console.log("HIT");
                    ellipse(interactiveCircles[j].x, interactiveCircles[j].y, interactiveCircles[j].radius, interactiveCircles[j].radius);
                }
            }
        }
*/


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
        stroke(100,100-(scaledAmplitude/4),15,8);
        //console.log("spectrum iteration: "+ i + "with ampl:" + scaledAmplitude);



        //manual but working
        //ellipse(((canvasWidth/100)*i), canvasHeight/2, scaledAmplitude*(canvasHeight/400), scaledAmplitude*(canvasHeight/400));
        if(x < canvasWidth)
        ellipse(x, circlesY, getRadius(scaledAmplitude), getRadius(scaledAmplitude));


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

function keyPressed(){
    printing = true;
    var textCounter = 0;
    var inc = 0.01;
    if(keyCode == UP && smoothing < 1-inc) smoothing += inc;
    if(keyCode == DOWN && smoothing > inc) smoothing -= inc;
    if (key == 's') {
        save("normal.png");
        saveHiRes(2);
        exit();
    }
    if(key=='p'){
        var lastBand = 0;
        var textY = (height/2)-50;
        textSize(128);
        textFont(mandali);
        for(var i =0;i<amps.length;i++){
            if(amps[i]>200){
                textCounter +=1;
                System.out.println(i+" scaledAmp: "+amps[i]+" with Hertz of: "+fft.indexToFreq(i));
                fill(100,30);
                textAlign(LEFT,BOTTOM);
                //text((int)(fft.indexToFreq(i))+" Hz",(width/100)*i,((i-lastBand<5?textY+200:textY)/4)*3);
                text((int)(fft.indexToFreq(i))+" Hz",(width/8*7),100+(150*textCounter));
                var midi= 69+12*(log(fft.indexToFreq(i)/440)/log(2));// formula that transform frequency to midi numbers
                var n= int (midi);//cast to int
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
                fill(100,70,0,90);
                textAlign(CENTER,CENTER);
                text(note,map(i, 0, specSize, 0, width*horizontalZoomFactor),((i-lastBand<5?textY+100:textY)));
                lastBand = i;
            }
        }

        save("image.png");
    }
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


function getRadius(scaledAmplitude){
    return scaledAmplitude*(canvasHeight/400);
}

/*
function getCircleXCoordinate(i, spectrum.length){
    return map(i, 0, spectrum.length, 0, width * horizontalZoomFactor);
}*/