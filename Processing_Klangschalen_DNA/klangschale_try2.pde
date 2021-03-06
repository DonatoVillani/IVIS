import ddf.minim.analysis.*;
import ddf.minim.*;

Minim       minim;
AudioPlayer in;
FFT         fft;

float smoothing = 0.5;
float[] fftReal;
float[] fftImag;
float[] fftSmooth;
int specSize;
float scaledAmplitude;
float[] amps;

int sampleRate= 44100;//sapleRate of 44100
float [] max= new float [sampleRate/2];//array that contains the half of the sampleRate size, because FFT only reads the half of the sampleRate frequency. This array will be filled with amplitude values.
float maximum;//the maximum amplitude of the max array
float frequency;//the frequency in hertz

PFont mandali;

void setup(){
  size(4096, 3072, P3D);
  minim = new Minim(this);
  in = minim.loadFile("klangschale_gr7_sc37307.mp3", 2048);
  in.play();
  fft = new FFT(in.bufferSize(), in.sampleRate());
  specSize = fft.specSize();
  System.out.println(specSize);
  fftSmooth = new float[specSize];
  fftReal   = new float[specSize];
  amps   = new float[specSize];
  colorMode(RGB,100);
  background(10);
  mandali = createFont("Mandali-Regular.ttf",128);
}

void draw(){
  //background(0);
  stroke(255);

  fft.forward(in.left);
  fftReal = fft.getSpectrumReal();
  fftImag = fft.getSpectrumImaginary();
  findNote();
  //System.out.println(frequency);
  for(int i = 0; i < specSize; i++)
  {
    float amp = fft.getBand(i);
    scaledAmplitude = amp*8; //scale amp according to needs
    
    strokeWeight(5);
    noFill();
    
    //Inside Yellow, the bigger the more reddish
    stroke(100,100-(scaledAmplitude/4),15,8);
    
    //N0p3
    //stroke((scaledAmplitude/35)*100,((100-(scaledAmplitude/4))/(scaledAmplitude/35))*100,((scaledAmplitude/35)*15),5);
    
     //ellipse((width/30)+((width/100)*i), height/2, (width/5)+fftSmooth[i]*(height/400), (width/5)+fftSmooth[i]*(height/400));
     ellipse(((width/100)*i), height/2, scaledAmplitude*(height/400), scaledAmplitude*(height/400));
  
    //getMaxAmp per Band
  if(scaledAmplitude>amps[i]){amps[i]=scaledAmplitude;}


  }
  //text("smoothing: " + (int)(smoothing*100),10,10);
}
void keyPressed(){
  float textCounter = 0;
  float inc = 0.01;
  if(keyCode == UP && smoothing < 1-inc) smoothing += inc;
  if(keyCode == DOWN && smoothing > inc) smoothing -= inc;
   if (key == 's') {
    save("normal.png");
    saveHiRes(2);
    exit();
  }
  if(key=='p'){
    int lastBand = 0;
    int textY = (height/2)-50;
    textSize(128);
    textFont(mandali);
   for(int i =0;i<amps.length;i++){
   if(amps[i]>200){
     textCounter +=1;
     System.out.println(i+" scaledAmp: "+amps[i]+" with Hertz of: "+fft.indexToFreq(i));
     fill(100,30);
     textAlign(LEFT,BOTTOM);
     //text((int)(fft.indexToFreq(i))+" Hz",(width/100)*i,((i-lastBand<5?textY+200:textY)/4)*3);
     text((int)(fft.indexToFreq(i))+" Hz",(width/8*7),100+(150*textCounter));
     float midi= 69+12*(log(fft.indexToFreq(i)/440)/log(2));// formula that transform frequency to midi numbers
     int n= int (midi);//cast to int
     String note ="";
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
      text(note,(width/100)*i,((i-lastBand<5?textY+100:textY)));
      lastBand = i;
   }
   }
   
   save("image.png");
  }
}

float findNote() {
  float frequency = 0.0;
  for (int f=0;f<sampleRate/2;f++) { //analyses the amplitude of each frequency analysed, between 0 and 22050 hertz
    max[f]=fft.getFreq(float(f)); //each index is correspondent to a frequency and contains the amplitude value 
  }
  maximum=max(max);//get the maximum value of the max array in order to find the peak of volume
 
  for (int i=0; i<max.length; i++) {// read each frequency in order to compare with the peak of volume
    if (max[i] == maximum) {//if the value is equal to the amplitude of the peak, get the index of the array, which corresponds to the frequency
      frequency= i;
    }
  }
  return frequency;
}

 
void saveHiRes(int scaleFactor) {
  PGraphics hires = createGraphics(width*scaleFactor, height*scaleFactor, P3D); // CREATION OF 3D PGRAPHICS OBJECT
  beginRecord(hires);
  hires.scale(scaleFactor);
  draw();
  endRecord();
  hires.save("hires.png");
}