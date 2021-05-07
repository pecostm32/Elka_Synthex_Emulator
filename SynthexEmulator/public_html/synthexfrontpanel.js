//-----------------------------------------------------------
// Code to draw the Synthex frontpanel on a html canvas
//-----------------------------------------------------------
function synthexfrontpanel(canvas, mouse)
{
  this.fontcolor = "#F5F9FC";
  this.font = "bold 24px arial";
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");

  var ww = window.innerWidth - 20;
  var wh = window.innerHeight - 20;

  this.scaler = ww / 3550;

  if((1565 * this.scaler) > wh)
    this.scaler = wh / 1565;

  //Make the canvas fit the window
  canvas.width = parseInt(3550 * this.scaler) + 5;
  canvas.height = parseInt(1565 * this.scaler) + 5;

  //Variables for the mouse actions of the panel objects
  this.lfoobjects = new Array();
  this.tunigobjects = new Array();
  this.dco1objects = new Array();
  this.dco2objects = new Array();
  this.gpnobjects = new Array();
  this.vcfobjects = new Array();
  this.feobjects = new Array();
  this.aeobjects = new Array();
  this.ceecobjects = new Array();
  this.modobjects = new Array();
  this.programobjects = new Array();
  this.volumeobjects = new Array();
  this.seqobjects = new Array();

  //Global variables for the panel items
  this.knobs = new Array();
  this.buttons = new Array();
  this.faders = new Array();
  this.switches = new Array();

  var panel = this;

  //Setup the mouse positions table for dividing the frontpanel into smaller sections
  mouse.setrange(107, 507, 66, 705, this.scaler, "scan", function(event) { return(mouse.scan(event, panel.lfoobjects)); });
  mouse.setrange(557, 757, 66, 705, this.scaler, "scan", function(event) { return(mouse.scan(event, panel.tunigobjects)); });
  mouse.setrange(807, 2142, 66, 265, this.scaler, "scan", function(event) { return(mouse.scan(event, panel.dco1objects)); });
  mouse.setrange(807, 2142, 285, 484, this.scaler, "scan", function(event) { return(mouse.scan(event, panel.dco2objects)); });
  mouse.setrange(807, 2142, 505, 705, this.scaler, "scan", function(event) { return(mouse.scan(event, panel.gpnobjects)); });
  mouse.setrange(2192, 2592, 66, 705, this.scaler, "scan", function(event) { return(mouse.scan(event, panel.vcfobjects)); });
  mouse.setrange(2642, 3442, 66, 265, this.scaler, "scan", function(event) { return(mouse.scan(event, panel.feobjects)); });
  mouse.setrange(2642, 3442, 285, 484, this.scaler, "scan", function(event) { return(mouse.scan(event, panel.aeobjects)); });
  mouse.setrange(2642, 3442, 505, 705, this.scaler, "scan", function(event) { return(mouse.scan(event, panel.ceecobjects)); });
  mouse.setrange(107, 917, 735, 935, this.scaler, "scan", function(event) { return(mouse.scan(event, panel.modobjects)); });
  mouse.setrange(967, 2850, 735, 935, this.scaler, "scan", function(event) { return(mouse.scan(event, panel.programobjects)); });
  mouse.setrange(2900, 3442, 735, 935, this.scaler, "scan", function(event) { return(mouse.scan(event, panel.volumeobjects)); });
  mouse.setrange(62, 457, 1096, 1517, this.scaler, "scan", function(event) { return(mouse.scan(event, panel.seqobjects)); });

  //All items are drawn with fixed big scale design size and are scaled with the overal canvas scale function
  this.ctx.scale(this.scaler,this.scaler);

  this.draw();

  this.knobcolorlight = new synthexknobstyle("#808080", "#3E3E3E", "#000000", 1, "#000000", 2, "#F5F9FC", 2, "Arial", 16);
  this.knobcolordark = new synthexknobstyle("#1E1E1E", "#3E3E3E", "#000000", 1, "#FFFFFF", 2, "#F5F9FC", 2, "Arial", 16);

  //synthexknob(ctx,radius, xpos, ypos, type, caption, colors, position)
  //LFO knobs
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,207,170,0,"FREQUENCY",this.knobcolordark,0,this.scaler,this.lfoobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,407,170,0,"DELAY",this.knobcolordark,0,this.scaler,this.lfoobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,207,335,0,"DEPTH A",this.knobcolordark,0,this.scaler,this.lfoobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,407,335,0,"DEPTH B",this.knobcolordark,0,this.scaler,this.lfoobjects);

  //Tuning knobs
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,657,170,2,"MASTER TUNE",this.knobcolorlight,0,this.scaler,this.tunigobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,657,390,2,"DETUNE",this.knobcolordark,0,this.scaler,this.tunigobjects);

  //DCO1 knobs
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,1282,170,1,"TRANSPOSE",this.knobcolordark,0,this.scaler,this.dco1objects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,1842,170,2,"PULSE WIDTH",this.knobcolordark,0,this.scaler,this.dco1objects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,2042,170,0,"VOLUME",this.knobcolordark,0,this.scaler,this.dco1objects);

  //DCO2 knobs
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,1282,390,1,"TRANSPOSE",this.knobcolordark,0,this.scaler,this.dco2objects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,1842,390,2,"PULSE WIDTH",this.knobcolordark,0,this.scaler,this.dco2objects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,2042,390,0,"VOLUME",this.knobcolordark,0,this.scaler,this.dco2objects);

  //Glide / Portamento knobs
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,1282,610,0,"SPEED",this.knobcolordark,0,this.scaler,this.gpnobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,1492,610,2,"GLIDE AMOUNT",this.knobcolordark,0,this.scaler,this.gpnobjects);

  //Noise knob
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,2042,610,0,"VOLUME",this.knobcolordark,0,this.scaler,this.gpnobjects);

  //VCF knobs
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,2292,170,0,"FREQUENCY",this.knobcolordark,0,this.scaler,this.vcfobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,2492,170,0,"ENVELOPE",this.knobcolordark,0,this.scaler,this.vcfobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,2292,390,0,"RESONANCE",this.knobcolordark,0,this.scaler,this.vcfobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,2492,390,0,"KEYBOARD",this.knobcolordark,0,this.scaler,this.vcfobjects);

  //VCF envelope knobs
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,2742,170,0,"ATTACK",this.knobcolordark,0,this.scaler,this.feobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,2942,170,0,"DECAY",this.knobcolordark,0,this.scaler,this.feobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,3142,170,0,"SUSTAIN",this.knobcolordark,0,this.scaler,this.feobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,3342,170,0,"RELEASE",this.knobcolordark,0,this.scaler,this.feobjects);

  //VCA envelope knobs
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,2742,390,0,"ATTACK",this.knobcolordark,0,this.scaler,this.aeobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,2942,390,0,"DECAY",this.knobcolordark,0,this.scaler,this.aeobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,3142,390,0,"SUSTAIN",this.knobcolordark,0,this.scaler,this.aeobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,3342,390,0,"RELEASE",this.knobcolordark,0,this.scaler,this.aeobjects);

  //Volume knobs
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,3142,840,2,"BALANCE",this.knobcolorlight,0,this.scaler,this.volumeobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,3342,840,0,"MASTER",this.knobcolorlight,0,this.scaler,this.volumeobjects);

  //Sequencer knobs
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,146,1207,0,"FREQUENCY",this.knobcolorlight,0,this.scaler,this.seqobjects);
  this.knobs[this.knobs.length] = new synthexknob(this.ctx,35,287,1207,0,"GATE",this.knobcolorlight,0,this.scaler,this.seqobjects);

  this.faderstyle = new synthexfaderstyle("#0E0E0E", "#2E2E2E", "#292929", "#F5F9FC", 2, "Arial Narrow", 14);

  //fader_item(xpos, ypos, type, caption, style, position, action)
  this.faders[this.faders.length] = new synthexfader(this.ctx, 362, 763, 0, "INIT. FREQ.", this.faderstyle, 0, this.scaler, this.modobjects);
  this.faders[this.faders.length] = new synthexfader(this.ctx, 431, 763, 1, "DELTA FREQ.", this.faderstyle, 0, this.scaler, this.modobjects);

  this.faders[this.faders.length] = new synthexfader(this.ctx, 519, 763, 0, "LFO 2", this.faderstyle, 0, this.scaler, this.modobjects);
  this.faders[this.faders.length] = new synthexfader(this.ctx, 588, 763, 1, "BEND", this.faderstyle, 0, this.scaler, this.modobjects);

  this.faders[this.faders.length] = new synthexfader(this.ctx, 676, 763, 0, "LFO 2", this.faderstyle, 0, this.scaler, this.modobjects);
  this.faders[this.faders.length] = new synthexfader(this.ctx, 745, 763, 1, "BEND", this.faderstyle, 0, this.scaler, this.modobjects);

  this.buttonstyle = new synthexbuttonstyle("arial narrow", 14, "", "#F5F9FC");

  //synthexbutton(ctx, xpos, ypos, orientation, style, state, ledstate, legendtype, legendtext, action)
  //DCO 1 footage section
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,884,136,0,this.buttonstyle,0,"16'",this.scaler,this.dco1objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,934,136,0,this.buttonstyle,0,"8'",this.scaler,this.dco1objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,984,136,0,this.buttonstyle,0,"4'",this.scaler,this.dco1objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1034,136,0,this.buttonstyle,0,"2'",this.scaler,this.dco1objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1084,136,0,this.buttonstyle,0,"1'",this.scaler,this.dco1objects);

  drawbuttonsubscript(this.ctx, 884, 136, 5, this.buttonstyle, "OCTAVE", 1);

  //DCO 1 waveform section
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1418,136,0,this.buttonstyle,4,"",this.scaler,this.dco1objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1468,136,0,this.buttonstyle,5,"",this.scaler,this.dco1objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1518,136,0,this.buttonstyle,7,"",this.scaler,this.dco1objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1568,136,0,this.buttonstyle,8,"",this.scaler,this.dco1objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1618,136,0,this.buttonstyle,3,"OSC 2<;>PWM",this.scaler,this.dco1objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1668,136,0,this.buttonstyle,3,"RING<;>MOD",this.scaler,this.dco1objects);

  drawbuttonsubscript(this.ctx, 1418, 136, 6, this.buttonstyle, "WAVEFORM", 1);

  //DCO 2 footage section
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,884,356,0,this.buttonstyle,0,"16'",this.scaler,this.dco2objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,934,356,0,this.buttonstyle,0,"8'",this.scaler,this.dco2objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,984,356,0,this.buttonstyle,0,"4'",this.scaler,this.dco2objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1034,356,0,this.buttonstyle,0,"2'",this.scaler,this.dco2objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1084,356,0,this.buttonstyle,0,"1'",this.scaler,this.dco2objects);

  drawbuttonsubscript(this.ctx, 884, 356, 5, this.buttonstyle, "OCTAVE", 1);

  //DCO 2 waveform section
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1418,356,0,this.buttonstyle,4,"",this.scaler,this.dco2objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1468,356,0,this.buttonstyle,5,"",this.scaler,this.dco2objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1518,356,0,this.buttonstyle,7,"",this.scaler,this.dco2objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1568,356,0,this.buttonstyle,8,"",this.scaler,this.dco2objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1618,356,0,this.buttonstyle,3,"OSC 2<;>PWM",this.scaler,this.dco2objects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1668,356,0,this.buttonstyle,3,"RING<;>MOD",this.scaler,this.dco2objects);

  drawbuttonsubscript(this.ctx, 1418, 356, 6, this.buttonstyle, "WAVEFORM", 1);

  //LFO waveform section
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,203,449,0,this.buttonstyle,4,"",this.scaler,this.lfoobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,253,449,0,this.buttonstyle,5,"",this.scaler,this.lfoobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,303,449,0,this.buttonstyle,6,"",this.scaler,this.lfoobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,353,449,0,this.buttonstyle,7,"",this.scaler,this.lfoobjects);

  drawbuttonsubscript(this.ctx, 203, 449, 4, this.buttonstyle, "WAVEFORM", 1);

  //LFO routing section
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,153,576,0,this.buttonstyle,0,"OSC 1",this.scaler,this.lfoobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,203,576,0,this.buttonstyle,0,"OSC 2",this.scaler,this.lfoobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,253,576,0,this.buttonstyle,0,"PW 1",this.scaler,this.lfoobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,303,576,0,this.buttonstyle,0,"PW 2",this.scaler,this.lfoobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,353,576,0,this.buttonstyle,2,"FILTER",this.scaler,this.lfoobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,403,576,0,this.buttonstyle,2,"AMPLIFIER",this.scaler,this.lfoobjects);

  drawbuttonsubscript(this.ctx, 153, 576, 4, this.buttonstyle, "A", 1);
  drawbuttonsubscript(this.ctx, 353, 576, 2, this.buttonstyle, "B", 1);
  drawbuttonsubscript(this.ctx, 153, 580 + this.buttonstyle.fontsize, 6, this.buttonstyle, "ROUTING", 0);

  //Tuning section
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,632,576,0,this.buttonstyle,3,"OSC 2<;>SYNC",this.scaler,this.tunigobjects);

  //Glide / Portamento section
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,884,576,0,this.buttonstyle,0,"OSC 1",this.scaler,this.gpnobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,934,576,0,this.buttonstyle,0,"OSC 2",this.scaler,this.gpnobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,984,576,0,this.buttonstyle,2,"GLIDE",this.scaler,this.gpnobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1034,576,0,this.buttonstyle,2,"PORTAM.",this.scaler,this.gpnobjects);

  //Noise section
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1793,576,0,this.buttonstyle,0,"WHITE",this.scaler,this.gpnobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1843,576,0,this.buttonstyle,0,"PINK",this.scaler,this.gpnobjects);

  //Filter section
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2267,576,0,this.buttonstyle,0,"LP",this.scaler,this.vcfobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2317,576,0,this.buttonstyle,0,"BP 1",this.scaler,this.vcfobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2367,576,0,this.buttonstyle,0,"BP 2",this.scaler,this.vcfobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2417,576,0,this.buttonstyle,0,"HP",this.scaler,this.vcfobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2467,576,0,this.buttonstyle,2,"ENV +/-",this.scaler,this.vcfobjects);

  drawbuttonsubscript(this.ctx, 2267, 576, 5, this.buttonstyle, "FILTER MODES", 1);

  //Chorus section
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2730,576,0,this.buttonstyle,0,"OFF",this.scaler,this.ceecobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2780,576,0,this.buttonstyle,0,"1",this.scaler,this.ceecobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2830,576,0,this.buttonstyle,0,"2",this.scaler,this.ceecobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2880,576,0,this.buttonstyle,0,"3",this.scaler,this.ceecobjects);

  //Envelope control section
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,3140,576,0,this.buttonstyle,0,"HOLD",this.scaler,this.ceecobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,3320,576,0,this.buttonstyle,0,"RELEASE",this.scaler,this.ceecobjects);

  //Program and control section
  //Program bank
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1040,806,0,this.buttonstyle,0,"1",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1090,806,0,this.buttonstyle,0,"2",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1140,806,0,this.buttonstyle,0,"3",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1190,806,0,this.buttonstyle,0,"4",this.scaler,this.programobjects);

  drawbuttonsubscript(this.ctx, 1040, 806, 4, this.buttonstyle, "BANK", 1);

  //Programs
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1443,806,0,this.buttonstyle,0,"0",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1493,806,0,this.buttonstyle,0,"1",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1543,806,0,this.buttonstyle,0,"2",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1593,806,0,this.buttonstyle,0,"3",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1643,806,0,this.buttonstyle,0,"4",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1693,806,0,this.buttonstyle,0,"5",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1743,806,0,this.buttonstyle,0,"6",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1793,806,0,this.buttonstyle,0,"7",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1843,806,0,this.buttonstyle,0,"8",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,1893,806,0,this.buttonstyle,0,"9",this.scaler,this.programobjects);

  drawbuttonsubscript(this.ctx, 1443, 806, 10, this.buttonstyle, "PROGRAM", 1);

  //Program controls/ cassette interface
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2164,806,0,this.buttonstyle,1,"MEMORY",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2214,806,0,this.buttonstyle,0,"PRESET",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2264,806,0,this.buttonstyle,0,"PANEL",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2314,806,0,this.buttonstyle,0,"WRITE",this.scaler,this.programobjects);

  drawbuttonsubscript(this.ctx, 2164, 790 + this.buttonstyle.fontsize, 1, this.buttonstyle, "SAVE", 0);
  drawbuttonsubscript(this.ctx, 2214, 790 + this.buttonstyle.fontsize, 1, this.buttonstyle, "SAVE HS", 0);
  drawbuttonsubscript(this.ctx, 2268, 790 + this.buttonstyle.fontsize, 1, this.buttonstyle, "VERIFY", 0);
  drawbuttonsubscript(this.ctx, 2316, 790 + this.buttonstyle.fontsize, 1, this.buttonstyle, "LOAD", 0);

  //Program / play mode controls
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2567,806,0,this.buttonstyle,0,"SPLIT",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2617,806,0,this.buttonstyle,0,"DOUBLE",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2667,806,0,this.buttonstyle,0,"LOWER",this.scaler,this.programobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,2717,806,0,this.buttonstyle,0,"UPPER",this.scaler,this.programobjects);

  //Sequencer section
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,80,1388,0,this.buttonstyle,0,"WRITE",this.scaler,this.seqobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,130,1388,0,this.buttonstyle,3,"BEATS<;>RESTS",this.scaler,this.seqobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,180,1388,0,this.buttonstyle,0,"DELETE",this.scaler,this.seqobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,230,1388,0,this.buttonstyle,0,"LOOP",this.scaler,this.seqobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,280,1388,0,this.buttonstyle,3,"STOP<;>READY",this.scaler,this.seqobjects);

  drawbuttonsubscript(this.ctx, 130, 1374 + this.buttonstyle.fontsize, 1, this.buttonstyle, "SPLIT", 0);
  drawbuttonsubscript(this.ctx, 180, 1374 + this.buttonstyle.fontsize, 1, this.buttonstyle, "KEY SET", 0);
  drawbuttonsubscript(this.ctx, 280, 1374 + this.buttonstyle.fontsize, 1, this.buttonstyle, "RESET", 0);

  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,370,1257,1,this.buttonstyle,9,"1",this.scaler,this.seqobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,370,1307,1,this.buttonstyle,9,"2",this.scaler,this.seqobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,370,1357,1,this.buttonstyle,9,"3",this.scaler,this.seqobjects);
  this.buttons[this.buttons.length] = new synthexbutton(this.ctx,370,1407,1,this.buttonstyle,9,"4",this.scaler,this.seqobjects);

  drawbuttonsubscript(this.ctx, 378, 1144 + this.buttonstyle.fontsize, 1, this.buttonstyle, "SEQUENCE", 0);

  this.switchstyle = new synthexswitchstyle("#F5F9FC", 14, "Arial Narrow");

  //switch_item(ctx, xpos, ypos, type, state, style, caption, action)
  this.switches[this.switches.length] = new synthexswitch(this.ctx,836,805,1,0,this.switchstyle,"UPPER<;>BOTH<;>LOWER",this.scaler,this.modobjects);
  this.switches[this.switches.length] = new synthexswitch(this.ctx,2974,813,0,0,this.switchstyle,"STEREO<;>MONO",this.scaler,this.volumeobjects);

  this.joystickstyle = new synthexjoystickstyle("#181818", "#C0C0C0", "#303030", 6, "#808080");

  this.joystick = new synthexjoystick(this.ctx,217,835,217,835,this.joystickstyle,0,0,this.scaler,this.modobjects);

  //Place the 5 octave pianokeyboard on the right spot
  this.pianokeys = new pianokeyboard(this.ctx, 5, 475, 1082, this.scaler, mouse.ranges);
}

//-----------------------------------------------------------
// Draws the frontpanel with text and lines but no objects
//-----------------------------------------------------------
synthexfrontpanel.prototype.draw = function()
{
  var ctx = this.ctx;

  ctx.save();

  //Underneath keyboard
  ctx.fillStyle = "#787A77";
  ctx.fillRect(473,1081,2955,442);

  //Wooden parts
  this.drawroundedrect(ctx, 46, 1565, 12, 0, 0, "#A56241", "#000000", 1);
  this.drawroundedrect(ctx, 46, 1565, 12, 3504, 0, "#A56241", "#000000", 1);
  this.drawroundedrect(ctx, 3457, 33, 0, 46, 1523, "#A56241", "#000000", 1);

  //Metal parts
  ctx.beginPath();
  ctx.moveTo(46,20);
  ctx.lineTo(3504,20);
  ctx.lineTo(3504,1533);
  ctx.lineTo(3429,1533);
  ctx.lineTo(3429,1081);
  ctx.lineTo(473,1081);
  ctx.lineTo(473,1533);
  ctx.lineTo(46,1533);
  ctx.lineTo(46,20);

  ctx.fillStyle = "#414244";
  ctx.fill();

  ctx.moveTo(46,1081);
  ctx.lineTo(3504,1081);

  ctx.moveTo(46,980);
  ctx.lineTo(3504,980);

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#000000";
  ctx.stroke();

  //Panel print
  ctx.lineWidth = 3;
  ctx.strokeStyle = this.fontcolor;
  ctx.fillStyle = this.fontcolor;
  ctx.textAlign = "left";
  ctx.font = this.font;

  ctx.strokeRect(107,66,400,639);
  ctx.fillText("LOW FREQUENCY OSCILLATOR",120,91);

  ctx.strokeRect(557,66,200,639);
  ctx.fillText("TUNING",610,91);

  ctx.strokeRect(807,66,1335,199);
  ctx.fillText("OSCILLATOR 1",1200,91);

  ctx.strokeRect(807,285,1335,199);
  ctx.fillText("OSCILLATOR 2",1200,310);

  ctx.strokeRect(807,505,785,200);
  ctx.fillText("GLIDE / PORTAMENTO",1068,530);

  ctx.strokeRect(1717,505,425,200);
  ctx.fillText("NOISE GENERATOR",1815,530);

  ctx.strokeRect(2192,66,400,639);
  ctx.fillText("MULTIMODE FILTER",2275,91);

  ctx.strokeRect(2642,66,800,199);
  ctx.fillText("FILTER ENVELOPE",2933,91);

  ctx.strokeRect(2642,285,800,199);
  ctx.fillText("AMPLIFIER ENVELOPE",2909,310);

  ctx.strokeRect(2642,505,375,200);
  ctx.fillText("CHORUS EFFECTS",2722,530);

  ctx.strokeRect(3067,505,375,200);
  ctx.fillText("ENVELOPE CONTROLS",3121,530);

  ctx.strokeRect(107,735,810,200);
  ctx.strokeRect(967,735,1883,200);

  ctx.strokeRect(2900,735,542,200);
  ctx.fillText("VOLUME",3121,760);

  ctx.strokeRect(62,1096,395,421);
  ctx.fillText("SEQUENCER",187,1121);

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#F5F9FC";
  ctx.beginPath();
  ctx.moveTo(2164,900);
  ctx.lineTo(2364,900);
  ctx.stroke();

  ctx.font = "16px arial";
  ctx.textAlign = "center";
  ctx.fillText("CASSETTE INTERFACE",2264,922);

  ctx.fillText("LFO 2",400,757);
  ctx.fillText("TO OSC.",557,757);
  ctx.fillText("TO FILTER",714,757);

  ctx.font = "16px arial narrow";

  ctx.fillText("BEND +",217,784);
  ctx.fillText("BEND -",217,894);

  ctx.textAlign = "right";
  ctx.fillText("TO OSC.",172,840);

  ctx.textAlign = "left";
  ctx.fillText("TO FILTER",262,840);

  ctx.beginPath();
  ctx.moveTo(80,1360);
  ctx.lineTo(90,1348);
  ctx.lineTo(220,1348);
  ctx.lineTo(230,1360);
  ctx.stroke();

  this.drawsmalllogo(ctx, 2803, 989);

  ctx.restore();
};

//-----------------------------------------------------------
// This function draws the Synthex logo on the given position
//-----------------------------------------------------------
synthexfrontpanel.prototype.drawsmalllogo = function(ctx,xpos, ypos)
{
  ctx.translate(xpos, ypos);

  //Light collered parts
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#F5F9FC";
  ctx.fillStyle = "#F5F9FC";

  ctx.fillRect(0, 76, 610, 5);

  ctx.beginPath();
  ctx.moveTo(45,0);
  ctx.bezierCurveTo(-20,0,-20,72,45,72);
  ctx.bezierCurveTo(110,72,110,0,45,0);
  ctx.stroke();
  ctx.fill();

  ctx.fillRect(45,0,50,20);
  ctx.fillRect(90,0,340,72);

  ctx.beginPath();
  ctx.moveTo(475,0);
  ctx.bezierCurveTo(410,0,410,72,475,72);
  ctx.lineTo(608,72);
  ctx.lineTo(608,0);
  ctx.stroke();
  ctx.fill();

  //Background cutouts
  ctx.fillStyle = "#414244";

  ctx.beginPath();
  ctx.moveTo(89,21);
  ctx.lineTo(98,21);
  ctx.lineTo(115,38);
  ctx.lineTo(115,73);
  ctx.lineTo(89,73);
  ctx.lineTo(89,21);

  ctx.moveTo(108,-1);
  ctx.lineTo(152,-1);
  ctx.lineTo(130,21);
  ctx.lineTo(108,-1);

  ctx.moveTo(144,73);
  ctx.lineTo(144,38);
  ctx.lineTo(170,12);
  ctx.lineTo(170,73);
  ctx.lineTo(144,73);

  ctx.moveTo(199,73);
  ctx.lineTo(199,38);
  ctx.lineTo(207,38);
  ctx.lineTo(227,73);
  ctx.lineTo(199,73);

  ctx.moveTo(210,-1);
  ctx.lineTo(227,30);
  ctx.lineTo(236,30);
  ctx.lineTo(236,-1);
  ctx.lineTo(210,-1);

  ctx.moveTo(536,-1);
  ctx.lineTo(578,-1);
  ctx.lineTo(557,23);
  ctx.lineTo(536,-1);

  ctx.moveTo(611,-1);
  ctx.lineTo(611,73);
  ctx.lineTo(574,36);
  ctx.lineTo(611,-1);

  ctx.moveTo(536,73);
  ctx.lineTo(578,73);
  ctx.lineTo(557,51);
  ctx.lineTo(536,73);

  ctx.moveTo(461,23);
  ctx.lineTo(526,23);
  ctx.lineTo(539,36);
  ctx.lineTo(526,51);
  ctx.lineTo(461,51);
  ctx.lineTo(461,42);
  ctx.lineTo(518,42);
  ctx.lineTo(518,30);
  ctx.lineTo(461,30);
  ctx.lineTo(461,23);

  ctx.fill();

  ctx.fillRect(259, 21, 27, 52);
  ctx.fillRect(319, 21, 27, 52);
  ctx.fillRect(372, 38, 31, 35);
  ctx.fillRect(372, 16, 31, 14);

  ctx.fillRect(-10, 0, 10, 72);
  ctx.fillRect(33, 21, 65, 9);
  ctx.fillRect(-10, 44, 68, 9);

  ctx.fillRect(0, -2, 611, 2);
  ctx.fillRect(0, 3, 611, 4);
  ctx.fillRect(0, 9, 611, 4);
  ctx.fillRect(0, 15, 611, 4);
  ctx.fillRect(0, 72, 611, 4);
};

//-----------------------------------------------------------
// Generic function for drawing rounded rectangles
//-----------------------------------------------------------
synthexfrontpanel.prototype.drawroundedrect = function(ctx, width, height, radius, xpos, ypos, fillcolor, linecolor, linewidth)
{
  var c1 = 0.5 * Math.PI;
  var c2 = 1.0 * Math.PI;
  var c3 = 1.5 * Math.PI;
  var c4 = 2.0 * Math.PI;

  var x1 = xpos + radius;
  var x2 = xpos + width - radius;

  var y1 = ypos + radius;
  var y2 = ypos + height - radius;

  ctx.beginPath();
  ctx.arc(x1, y1, radius, c2, c3, false);
  ctx.arc(x2, y1, radius, c3, c4, false);
  ctx.arc(x2, y2, radius, c4, c1, false);
  ctx.arc(x1, y2, radius, c1, c2, false);
  ctx.closePath();

  ctx.fillStyle = fillcolor;
  ctx.fill();

  ctx.lineWidth = linewidth;
  ctx.strokeStyle = linecolor;
  ctx.stroke();
};

//-----------------------------------------------------------
synthexfrontpanel.prototype.updateleds = function(leds, data)
{
  switch(leds)
  {
    case 0x0C1B:
       this.buttons[60].setledstate((data & 0x01) ? 0: 1);
       this.buttons[61].setledstate((data & 0x02) ? 0: 1);
       this.buttons[62].setledstate((data & 0x04) ? 0: 1);
       this.buttons[63].setledstate((data & 0x08) ? 0: 1);
       this.buttons[37].setledstate((data & 0x10) ? 0: 1);
       this.buttons[38].setledstate((data & 0x20) ? 0: 1);
       break;

    case 0x0C10:
       this.buttons[22].setledstate((data & 0x01) ? 0: 1);
       this.buttons[23].setledstate((data & 0x02) ? 0: 1);
       this.buttons[24].setledstate((data & 0x04) ? 0: 1);
       this.buttons[25].setledstate((data & 0x08) ? 0: 1);
       this.buttons[32].setledstate((data & 0x10) ? 0: 1);
       break;

    case 0x0C12:
       this.buttons[26].setledstate((data & 0x01) ? 0: 1);
       this.buttons[27].setledstate((data & 0x02) ? 0: 1);
       this.buttons[28].setledstate((data & 0x04) ? 0: 1);
       this.buttons[29].setledstate((data & 0x20) ? 0: 1);
       this.buttons[30].setledstate((data & 0x10) ? 0: 1);
       this.buttons[31].setledstate((data & 0x08) ? 0: 1);
       break;

    case 0x0C11:
       this.buttons[50].setledstate((data & 0x01) ? 0: 1);
       this.buttons[51].setledstate((data & 0x02) ? 0: 1);
       this.buttons[52].setledstate((data & 0x04) ? 0: 1);
       this.buttons[53].setledstate((data & 0x08) ? 0: 1);
       this.buttons[35].setledstate((data & 0x10) ? 0: 1);
       this.buttons[36].setledstate((data & 0x20) ? 0: 1);
       break;

    case 0x0C13:
       this.buttons[54].setledstate((data & 0x01) ? 0: 1);
       this.buttons[55].setledstate((data & 0x02) ? 0: 1);
       this.buttons[56].setledstate((data & 0x04) ? 0: 1);
       this.buttons[57].setledstate((data & 0x08) ? 0: 1);
       this.buttons[58].setledstate((data & 0x10) ? 0: 1);
       this.buttons[59].setledstate((data & 0x20) ? 0: 1);
       break;

    case 0x0C08:
       this.buttons[5].setledstate((data & 0x01) ? 0: 1);
       this.buttons[6].setledstate((data & 0x02) ? 0: 1);
       this.buttons[7].setledstate((data & 0x04) ? 0: 1);
       this.buttons[8].setledstate((data & 0x08) ? 0: 1);
       this.buttons[9].setledstate((data & 0x10) ? 0: 1);
       this.buttons[10].setledstate((data & 0x20) ? 0: 1);
       break;

    case 0x0C0A:
       this.buttons[16].setledstate((data & 0x01) ? 0: 1);
       this.buttons[17].setledstate((data & 0x02) ? 0: 1);
       this.buttons[18].setledstate((data & 0x04) ? 0: 1);
       this.buttons[19].setledstate((data & 0x08) ? 0: 1);
       this.buttons[20].setledstate((data & 0x10) ? 0: 1);
       this.buttons[21].setledstate((data & 0x20) ? 0: 1);
       break;

    case 0x0C09:
       this.buttons[0].setledstate((data & 0x01) ? 0: 1);
       this.buttons[1].setledstate((data & 0x02) ? 0: 1);
       this.buttons[2].setledstate((data & 0x04) ? 0: 1);
       this.buttons[3].setledstate((data & 0x08) ? 0: 1);
       this.buttons[4].setledstate((data & 0x10) ? 0: 1);
       this.buttons[33].setledstate((data & 0x20) ? 0: 1);
       break;

    case 0x0C0B:
       this.buttons[11].setledstate((data & 0x01) ? 0: 1);
       this.buttons[12].setledstate((data & 0x02) ? 0: 1);
       this.buttons[13].setledstate((data & 0x04) ? 0: 1);
       this.buttons[14].setledstate((data & 0x08) ? 0: 1);
       this.buttons[15].setledstate((data & 0x10) ? 0: 1);
       this.buttons[34].setledstate((data & 0x20) ? 0: 1);
       break;

    case 0x0C00:
       this.buttons[44].setledstate((data & 0x01) ? 0: 1);
       this.buttons[45].setledstate((data & 0x02) ? 0: 1);
       this.buttons[46].setledstate((data & 0x04) ? 0: 1);
       this.buttons[47].setledstate((data & 0x08) ? 0: 1);
       this.buttons[48].setledstate((data & 0x10) ? 0: 1);
       this.buttons[49].setledstate((data & 0x20) ? 0: 1);
       break;

    case 0x0C02:
       this.buttons[64].setledstate((data & 0x01) ? 0: 1);
       this.buttons[65].setledstate((data & 0x02) ? 0: 1);
       this.buttons[66].setledstate((data & 0x04) ? 0: 1);
       this.buttons[67].setledstate((data & 0x08) ? 0: 1);
       break;

    case 0x0C04:
       this.buttons[68].setledstate((data & 0x08) ? 0: 1);
       this.buttons[69].setledstate((data & 0x04) ? 0: 1);
       this.buttons[70].setledstate((data & 0x02) ? 0: 1);
       this.buttons[71].setledstate((data & 0x01) ? 0: 1);
       break;

    case 0x0C06:
       this.buttons[39].setledstate((data & 0x01) ? 0: 1);
       this.buttons[40].setledstate((data & 0x02) ? 0: 1);
       this.buttons[41].setledstate((data & 0x04) ? 0: 1);
       this.buttons[42].setledstate((data & 0x08) ? 0: 1);
       this.buttons[43].setledstate((data & 0x10) ? 0: 1);
       break;

    case 0x0E00:
       this.buttons[77].setledstate((data & 0x04) ? 0: 1);
       this.buttons[78].setledstate((data & 0x08) ? 0: 1);
       this.buttons[79].setledstate((data & 0x10) ? 0: 1);
       this.buttons[80].setledstate((data & 0x20) ? 0: 1);
       this.buttons[72].setledstate((data & 0x40) ? 0: 1);
       this.buttons[73].setledstate((data & 0x80) ? 0: 1);
       break;

    case 0x0E08:
       this.buttons[74].setledstate((data & 0x04) ? 0: 1);
       this.buttons[75].setledstate((data & 0x20) ? 0: 1);
       this.buttons[76].setledstate((data & 0x40) ? 0: 1);
       break;
  }
};

//-----------------------------------------------------------
synthexfrontpanel.prototype.updateknobs = function(knob, data)
{
  switch(knob)
  {
    case 0:
       this.knobs[5].set(data); //Detune;
       break;

    case 1:
       this.knobs[2].set(data); //LFO_Depth_A;
       break;

    case 2:
       this.knobs[3].set(data); //LFO_Depth_B;
       break;

    case 3:
       this.knobs[0].set(data); //LFO_Frequency;
       break;

    case 4:
       this.knobs[1].set(data); //LFO_Delay;
       break;

    case 5:
       this.knobs[15].set(data); //Filter_Frequency;
       break;

    case 6:
       this.knobs[18].set(data); //Filter_Keyboard;
       break;

    case 7:
       this.knobs[16].set(data); //Filter_Envelope;
       break;

    case 8:
       this.knobs[21].set(data); //Filter_Sustain;
       break;

    case 9:
       this.knobs[25].set(data); //Amplifier_Sustain;
       break;

    case 10:
       this.knobs[17].set(data); //Filter_Resonance;
       break;

    case 11:
       this.knobs[7].set(data); //Osc_1_Pulse_Width;
       break;

    case 12:
       this.knobs[10].set(data); //Osc_2_Pulse_Width;
       break;

    case 13:
       this.knobs[13].set(data); //Glide_Amount;
       break;

    case 14:
       this.knobs[12].set(data); //Glide_Speed;
       break;

    case 15:
       this.knobs[6].set(data); //Osc_1_Transpose;
       break;

    case 16:
       this.knobs[9].set(data); //Osc_2_Transpose;
       break;

    case 17:
       this.knobs[8].set(data); //Osc_1_Volume;
       break;

    case 18:
       this.knobs[11].set(data); //Osc_2_Volume;
       break;

    case 19:
       this.knobs[14].set(data); //Noise_Volume;
       break;

    case 20:
       this.knobs[19].set(data); //Filter_Attack;
       break;

    case 21:
       this.knobs[23].set(data); //Amplifier_Attack;
       break;

    case 22:
       this.knobs[20].set(data); //Filter_Decay;
       break;

    case 23:
       this.knobs[24].set(data); //Amplifier_Decay;
       break;

    case 24:
       this.knobs[22].set(data); //Filter_Release;
       break;

    case 25:
       this.knobs[26].set(data); //Amplifier_Release;
       break;
  }
};