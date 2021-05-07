//-----------------------------------------------------------
// All the needed stuf to setup the Elka Synthex Emulator
//-----------------------------------------------------------
var ControlMouse = new mousehandling();
var SynthexMouse = new mousehandling();
var CpuMouse = new mousehandling();
var DigitalMouse = new mousehandling();
var AnalogMouse = new mousehandling();

var FrontPanel = new synthexfrontpanel(document.getElementById("frontpanel"), SynthexMouse);
var Control = new ControlPanel(document.getElementById("controlpanel"), ControlMouse);
var CpuPanel = new CPUPANEL(document.getElementById("cpuscreen"),document.getElementById("cpupanel"), CpuMouse);

var DigitalPanel = new DIGITALPANEL(document.getElementById("digitalscreen"),document.getElementById("digitalpanel"), DigitalMouse);
var AnalogPanel = new ANALOGPANEL(document.getElementById("analogscreen"),document.getElementById("analogpanel"), AnalogMouse);

var Cpu = new CPU65C02();
var Synthex = new SynthexHardware();
var Disasm = new Disasm_item(0xE9D1, "");


//-----------------------------------------------------------
//Connect the control objects to their functions
//-----------------------------------------------------------

//-----------------------------------------------------------
//Functions for the opening / closing / updating of the cpu panel
Control.cpumonitor.action = cpumonitoraction;
CpuPanel.power.action = cpupoweraction;

function cpumonitoraction()
{
  if(Control.cpumonitor.ledstate == 0)
  {
    CpuPanel.showscreen();
    Control.cpumonitor.setledstate(1);

    Cpu.mmi = function() { CpuPanel.update(Cpu); };
  }
  else
  {
    CpuPanel.hidescreen();
    Control.cpumonitor.setledstate(0);

    Cpu.mmi = null;
  }
}

function cpupoweraction()
{
  CpuPanel.hidescreen();
  Control.cpumonitor.setledstate(0);

  Cpu.mmi = null;
}

//-----------------------------------------------------------
//Functions for the opening / closing of the digital panel
Control.digitalout.action = digitaloutaction;
DigitalPanel.power.action = digitalpoweraction;

function digitaloutaction()
{
  if(Control.digitalout.ledstate == 0)
  {
    DigitalPanel.showscreen(Synthex);
    Control.digitalout.setledstate(1);
    Synthex.updatedigital = function(synthex) { DigitalPanel.update(synthex); };
  }
  else
  {
    DigitalPanel.hidescreen();
    Control.digitalout.setledstate(0);
    Synthex.updatedigital = null;
  }
}

function digitalpoweraction()
{
  DigitalPanel.hidescreen();
  Control.digitalout.setledstate(0);
  Synthex.updatedigital = null;
}

//-----------------------------------------------------------
//Functions for the opening / closing of the analog panel
Control.analogout.action = analogoutaction;
AnalogPanel.power.action = analogpoweraction;

function analogoutaction()
{
  if(Control.analogout.ledstate == 0)
  {
    AnalogPanel.showscreen(Synthex);
    Control.analogout.setledstate(1);
    Synthex.updateanalog = function(synthex) { AnalogPanel.update(synthex); };
  }
  else
  {
    AnalogPanel.hidescreen();
    Control.analogout.setledstate(0);
    Synthex.updateanalog = null;
  }
}

function analogpoweraction()
{
  AnalogPanel.hidescreen();
  Control.analogout.setledstate(0);
  Synthex.updateanalog = null;
}

//-----------------------------------------------------------
//Set function for controling the piano keyboard matrix
FrontPanel.pianokeys.action = function(id, state)
{
  var t = [ 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80 ];
  var i = parseInt(id % 8);
  var b = t[parseInt(id / 8)];

  if(state == 0)
    Synthex.synthex5831data.keyboarddata[i] &= (~b & 0xFF);
  else
    Synthex.synthex5831data.keyboarddata[i] |= b;
};

//-----------------------------------------------------------
//Set function for controling output mode (Stereo / Mono)
FrontPanel.switches[1].action = function(state)
{
  if(state == 0)
    Synthex.outputmode &= 0xFE;
  else
    Synthex.outputmode |= 0x01;
};

//-----------------------------------------------------------
// Connect the hardware to the panel leds and knobs
//-----------------------------------------------------------
Synthex.updateleds = function(leds, data) { FrontPanel.updateleds(leds, data); };
Synthex.updateknobs = function(knob, data) { FrontPanel.updateknobs(knob, data); };

//-----------------------------------------------------------
// Connect the panel knobs, buttons and switches to the hardware
//-----------------------------------------------------------

FrontPanel.knobs[0].action = function(data) { Synthex.synthex581Xdata.anlsig[0x00] = data; }; //LFO frequency
FrontPanel.knobs[1].action = function(data) { Synthex.synthex581Xdata.anlsig[0x10] = data; }; //LFO delay
FrontPanel.knobs[2].action = function(data) { Synthex.synthex581Xdata.anlsig[0x18] = data; }; //LFO depth a
FrontPanel.knobs[3].action = function(data) { Synthex.synthex581Xdata.anlsig[0x08] = data; }; //LFO depth b

FrontPanel.knobs[4].action = function(data) { Synthex.mastertune = data; }; //Master tune
FrontPanel.knobs[4].set(128);
FrontPanel.knobs[5].action = function(data) { Synthex.synthex581Xdata.anlsig[0x23] = data; }; //Detune

FrontPanel.knobs[6].action = function(data) { Synthex.synthex581Xdata.anlsig[0x21] = data; }; //OSC1 transpose
FrontPanel.knobs[7].action = function(data) { Synthex.synthex581Xdata.anlsig[0x24] = data; }; //OSC1 pulse width
FrontPanel.knobs[8].action = function(data) { Synthex.synthex581Xdata.anlsig[0x37] = data; }; //OSC1 volume

FrontPanel.knobs[9].action = function(data) { Synthex.synthex581Xdata.anlsig[0x20] = data; }; //OSC2 transpose
FrontPanel.knobs[10].action = function(data) { Synthex.synthex581Xdata.anlsig[0x26] = data; }; //OSC2 pulse width
FrontPanel.knobs[11].action = function(data) { Synthex.synthex581Xdata.anlsig[0x35] = data; }; //OSC2 volume

FrontPanel.knobs[12].action = function(data) { Synthex.synthex581Xdata.anlsig[0x22] = data; }; //Glide speed
FrontPanel.knobs[13].action = function(data) { Synthex.synthex581Xdata.anlsig[0x33] = data; }; //Glide amount

FrontPanel.knobs[14].action = function(data) { Synthex.synthex581Xdata.anlsig[0x30] = data; }; //Noise volume

FrontPanel.knobs[15].action = function(data) { Synthex.synthex581Xdata.anlsig[0x34] = data; }; //Filter frequency
FrontPanel.knobs[16].action = function(data) { Synthex.synthex581Xdata.anlsig[0x2F] = data; }; //Filter envelope
FrontPanel.knobs[17].action = function(data) { Synthex.synthex581Xdata.anlsig[0x36] = data; }; //Filter resonance
FrontPanel.knobs[18].action = function(data) { Synthex.synthex581Xdata.anlsig[0x2D] = data; }; //Filter keyboard

FrontPanel.knobs[19].action = function(data) { Synthex.synthex581Xdata.anlsig[0x29] = data; }; //Filter attack
FrontPanel.knobs[20].action = function(data) { Synthex.synthex581Xdata.anlsig[0x32] = data; }; //Filter decay
FrontPanel.knobs[21].action = function(data) { Synthex.synthex581Xdata.anlsig[0x28] = data; }; //Filter sustain
FrontPanel.knobs[22].action = function(data) { Synthex.synthex581Xdata.anlsig[0x2A] = data; }; //Filter release

FrontPanel.knobs[23].action = function(data) { Synthex.synthex581Xdata.anlsig[0x2B] = data; }; //Amplifier attack
FrontPanel.knobs[24].action = function(data) { Synthex.synthex581Xdata.anlsig[0x31] = data; }; //Amplifier decay
FrontPanel.knobs[25].action = function(data) { Synthex.synthex581Xdata.anlsig[0x2E] = data; }; //Amplifier sustain
FrontPanel.knobs[26].action = function(data) { Synthex.synthex581Xdata.anlsig[0x2C] = data; }; //Amplifier release

FrontPanel.knobs[27].action = function(data) { Synthex.masterbalance = data; }; //Master balance
FrontPanel.knobs[27].set(128);

FrontPanel.knobs[28].action = function(data) { Synthex.mastervolume = data; }; //Master volume
FrontPanel.knobs[28].set(150);

FrontPanel.knobs[29].action = function(data) { Synthex.seqoscincrement = 0.0000128 + ((0.00512 * data) / 255); }; //Sequencer frequency
FrontPanel.knobs[29].set(42);

FrontPanel.knobs[30].action = function(data) { Synthex.seqgatethreshold = 22 + ((234 * data) / 255); }; //Sequencer gate
FrontPanel.knobs[30].set(164);

FrontPanel.buttons[0].action = function() { Synthex.synthex581Xdata.octkeys1 &= 0xFE; };
FrontPanel.buttons[1].action = function() { Synthex.synthex581Xdata.octkeys1 &= 0xFD; };
FrontPanel.buttons[2].action = function() { Synthex.synthex581Xdata.octkeys1 &= 0xFB; };
FrontPanel.buttons[3].action = function() { Synthex.synthex581Xdata.octkeys1 &= 0xF7; };
FrontPanel.buttons[4].action = function() { Synthex.synthex581Xdata.octkeys1 &= 0xEF; };
FrontPanel.buttons[33].action = function() { Synthex.synthex581Xdata.octkeys1 &= 0xDF; };

FrontPanel.buttons[5].action = function() { Synthex.synthex581Xdata.wavekeys1 &= 0xFE; };
FrontPanel.buttons[6].action = function() { Synthex.synthex581Xdata.wavekeys1 &= 0xFD; };
FrontPanel.buttons[7].action = function() { Synthex.synthex581Xdata.wavekeys1 &= 0xFB; };
FrontPanel.buttons[8].action = function() { Synthex.synthex581Xdata.wavekeys1 &= 0xF7; };
FrontPanel.buttons[9].action = function() { Synthex.synthex581Xdata.wavekeys1 &= 0xEF; };
FrontPanel.buttons[10].action = function() { Synthex.synthex581Xdata.wavekeys1 &= 0xDF; };

FrontPanel.buttons[11].action = function() { Synthex.synthex581Xdata.octkeys2 &= 0xFE; };
FrontPanel.buttons[12].action = function() { Synthex.synthex581Xdata.octkeys2 &= 0xFD; };
FrontPanel.buttons[13].action = function() { Synthex.synthex581Xdata.octkeys2 &= 0xFB; };
FrontPanel.buttons[14].action = function() { Synthex.synthex581Xdata.octkeys2 &= 0xF7; };
FrontPanel.buttons[15].action = function() { Synthex.synthex581Xdata.octkeys2 &= 0xEF; };
FrontPanel.buttons[34].action = function() { Synthex.synthex581Xdata.octkeys2 &= 0xDF; };

FrontPanel.buttons[16].action = function() { Synthex.synthex581Xdata.wavekeys2 &= 0xFE; };
FrontPanel.buttons[17].action = function() { Synthex.synthex581Xdata.wavekeys2 &= 0xFD; };
FrontPanel.buttons[18].action = function() { Synthex.synthex581Xdata.wavekeys2 &= 0xFB; };
FrontPanel.buttons[19].action = function() { Synthex.synthex581Xdata.wavekeys2 &= 0xF7; };
FrontPanel.buttons[20].action = function() { Synthex.synthex581Xdata.wavekeys2 &= 0xEF; };
FrontPanel.buttons[21].action = function() { Synthex.synthex581Xdata.wavekeys2 &= 0xDF; };

FrontPanel.buttons[22].action = function() { Synthex.synthex581Xdata.lfowavekeys &= 0xFE; };
FrontPanel.buttons[23].action = function() { Synthex.synthex581Xdata.lfowavekeys &= 0xFD; };
FrontPanel.buttons[24].action = function() { Synthex.synthex581Xdata.lfowavekeys &= 0xFB; };
FrontPanel.buttons[25].action = function() { Synthex.synthex581Xdata.lfowavekeys &= 0xF7; };
FrontPanel.buttons[32].action = function() { Synthex.synthex581Xdata.lfowavekeys &= 0xEF; };

FrontPanel.buttons[26].action = function() { Synthex.synthex581Xdata.lforoutingkeys &= 0xFE; };
FrontPanel.buttons[27].action = function() { Synthex.synthex581Xdata.lforoutingkeys &= 0xFD; };
FrontPanel.buttons[28].action = function() { Synthex.synthex581Xdata.lforoutingkeys &= 0xFB; };
FrontPanel.buttons[29].action = function() { Synthex.synthex581Xdata.lforoutingkeys &= 0xDF; };
FrontPanel.buttons[30].action = function() { Synthex.synthex581Xdata.lforoutingkeys &= 0xEF; };
FrontPanel.buttons[31].action = function() { Synthex.synthex581Xdata.lforoutingkeys &= 0xF7; };

FrontPanel.buttons[39].action = function() { Synthex.synthex581Xdata.fltmdkeys &= 0xFE; };
FrontPanel.buttons[40].action = function() { Synthex.synthex581Xdata.fltmdkeys &= 0xFD; };
FrontPanel.buttons[41].action = function() { Synthex.synthex581Xdata.fltmdkeys &= 0xFB; };
FrontPanel.buttons[42].action = function() { Synthex.synthex581Xdata.fltmdkeys &= 0xF7; };
FrontPanel.buttons[43].action = function() { Synthex.synthex581Xdata.fltmdkeys &= 0xEF; };

FrontPanel.buttons[44].action = function() { Synthex.synthex581Xdata.choruskeys &= 0xFE; };
FrontPanel.buttons[45].action = function() { Synthex.synthex581Xdata.choruskeys &= 0xFD; };
FrontPanel.buttons[46].action = function() { Synthex.synthex581Xdata.choruskeys &= 0xFB; };
FrontPanel.buttons[47].action = function() { Synthex.synthex581Xdata.choruskeys &= 0xF7; };
FrontPanel.buttons[48].action = function() { Synthex.synthex581Xdata.choruskeys &= 0xEF; };
FrontPanel.buttons[49].action = function() { Synthex.synthex581Xdata.choruskeys &= 0xDF; };

FrontPanel.buttons[50].action = function() { Synthex.synthex581Xdata.bankkeys &= 0xFE; };
FrontPanel.buttons[51].action = function() { Synthex.synthex581Xdata.bankkeys &= 0xFD; };
FrontPanel.buttons[52].action = function() { Synthex.synthex581Xdata.bankkeys &= 0xFB; };
FrontPanel.buttons[53].action = function() { Synthex.synthex581Xdata.bankkeys &= 0xF7; };
FrontPanel.buttons[35].action = function() { Synthex.synthex581Xdata.bankkeys &= 0xEF; };
FrontPanel.buttons[36].action = function() { Synthex.synthex581Xdata.bankkeys &= 0xDF; };

FrontPanel.buttons[54].action = function() { Synthex.synthex581Xdata.prgkeys1 &= 0xFE; };
FrontPanel.buttons[55].action = function() { Synthex.synthex581Xdata.prgkeys1 &= 0xFD; };
FrontPanel.buttons[56].action = function() { Synthex.synthex581Xdata.prgkeys1 &= 0xFB; };
FrontPanel.buttons[57].action = function() { Synthex.synthex581Xdata.prgkeys1 &= 0xF7; };
FrontPanel.buttons[58].action = function() { Synthex.synthex581Xdata.prgkeys1 &= 0xEF; };
FrontPanel.buttons[59].action = function() { Synthex.synthex581Xdata.prgkeys1 &= 0xDF; };

FrontPanel.buttons[60].action = function() { Synthex.synthex581Xdata.prgkeys2 &= 0xFE; };
FrontPanel.buttons[61].action = function() { Synthex.synthex581Xdata.prgkeys2 &= 0xFD; };
FrontPanel.buttons[62].action = function() { Synthex.synthex581Xdata.prgkeys2 &= 0xFB; };
FrontPanel.buttons[63].action = function() { Synthex.synthex581Xdata.prgkeys2 &= 0xF7; };
FrontPanel.buttons[37].action = function() { Synthex.synthex581Xdata.prgkeys2 &= 0xEF; };
FrontPanel.buttons[38].action = function() { Synthex.synthex581Xdata.prgkeys2 &= 0xDF; };

FrontPanel.buttons[64].action = function() { Synthex.synthex581Xdata.caskeys &= 0xFE; };
FrontPanel.buttons[65].action = function() { Synthex.synthex581Xdata.caskeys &= 0xFD; };
FrontPanel.buttons[66].action = function() { Synthex.synthex581Xdata.caskeys &= 0xFB; };
FrontPanel.buttons[67].action = function() { Synthex.synthex581Xdata.caskeys &= 0xF7; };

FrontPanel.buttons[68].action = function() { Synthex.synthex581Xdata.modekeys &= 0xF7; };
FrontPanel.buttons[69].action = function() { Synthex.synthex581Xdata.modekeys &= 0xFB; };
FrontPanel.buttons[70].action = function() { Synthex.synthex581Xdata.modekeys &= 0xFD; };
FrontPanel.buttons[71].action = function() { Synthex.synthex581Xdata.modekeys &= 0xFE; };

FrontPanel.buttons[72].action = function() { Synthex.synthex5831data.extread2 &= 0xBF; };
FrontPanel.buttons[73].action = function() { Synthex.synthex5831data.extread2 &= 0x7F; };
FrontPanel.buttons[77].action = function() { Synthex.synthex5831data.extread2 &= 0xFB; };
FrontPanel.buttons[78].action = function() { Synthex.synthex5831data.extread2 &= 0xF7; };
FrontPanel.buttons[79].action = function() { Synthex.synthex5831data.extread2 &= 0xEF; };
FrontPanel.buttons[80].action = function() { Synthex.synthex5831data.extread2 &= 0xDF; };

FrontPanel.buttons[74].action = function() { Synthex.synthex5831data.extread1 &= 0xFB; };
FrontPanel.buttons[75].action = function() { Synthex.synthex5831data.extread1 &= 0xF7; };
FrontPanel.buttons[76].action = function() { Synthex.synthex5831data.extread1 &= 0xFD; };

//-----------------------------------------------------------
//Setup the hardware
//-----------------------------------------------------------
synthexmemoryinit(Cpu);
Synthex.init(Cpu);

//-----------------------------------------------------------
// Start the 65C02 processor
//-----------------------------------------------------------
var CpuTimer = setInterval(function() { Cpu.run(); }, 10);
