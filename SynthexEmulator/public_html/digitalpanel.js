//-----------------------------------------------------------
//-----------------------------------------------------------
function DIGITALPANEL(divobj, canvas, mouse)
{
  this.fillcolor = "#A56241";
  this.strokecolor = "#000000";
  this.linewidth = 1;
  this.divobj = divobj;
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");

  //Range for moving the panel
  this.mouse = mouse.setrange(10, 700, 5, 165, 1);

  this.screenx;
  this.screeny;

  //Set the canvas to the needed dimensions
  canvas.width = 780;
  canvas.height = 545;

  //Set the div position info for moving it
  divobj.x = 440;
  divobj.y = 20;
  divobj.style.left = divobj.x + "px";
  divobj.style.top  = divobj.y + "px";

  var screen = this;

  this.mouse.down = function(event) { screen.movescreenstart(event); };
  this.mouse.up = function(event) { screen.movescreenstop(event); };
  this.mouse.over = function(event) { screen.cursormove(event); };
  this.mouse.out = function(event) { screen.cursordefault(event); };

  this.drawfrontpanel();

  var i,x;
  this.vcdisplay = [];

  for(i=0,x=35;i<4;)
  {
    this.vcdisplay[i++] = this.drawvoicecard(x,55,i);
    x += 180;
  }

  this.maindisplay = new LCDisplay(this.ctx, 217, 447, 2, 2, 3, "#000000");
  this.upperdisplay = new LCDisplay(this.ctx, 457, 447, 2, 2, 3, "#000000");
  this.lowerdisplay = new LCDisplay(this.ctx, 697, 447, 2, 2, 3, "#000000");

  this.power = new Button(this.ctx, 720, 25, 18, 18, 5, mouse.ranges);
}

//-----------------------------------------------------------
//-----------------------------------------------------------
DIGITALPANEL.prototype.display = function(disp, line, data)
{
  disp.displaytext(0, line, (data + 0x100).toString(16).slice(-2).toUpperCase());
};

//-----------------------------------------------------------
//-----------------------------------------------------------
DIGITALPANEL.prototype.update = function(synthex)
{
  var s = (synthex.digitaldata + 0x100).toString(16).slice(-2).toUpperCase();
  var i = synthex.voicecardid;

  switch(synthex.digitaladdress)
  {
    case 0x1760:
      this.maindisplay.displaytext(0,0,s);
      break;

    case 0x16E0:
      this.maindisplay.displaytext(0,2,s);
      break;

    case 0x1020:
      this.upperdisplay.displaytext(0,0,s);
      break;

    case 0x1060:
      this.lowerdisplay.displaytext(0,0,s);
      break;

    case 0x1000:
      this.upperdisplay.displaytext(0,1,s);
      break;

    case 0x1010:
      this.lowerdisplay.displaytext(0,1,s);
      break;

    case 0x1030:
      this.upperdisplay.displaytext(0,2,s);
      break;

    case 0x1040:
      this.lowerdisplay.displaytext(0,2,s);
      break;

    case 0x1230:
      this.vcdisplay[i].displaytext(0,0,s);
      break;

    case 0x1231:
      this.vcdisplay[i].displaytext(0,1,s);
      break;

    case 0x1238:
      this.vcdisplay[i].displaytext(0,2,s);
      break;

    case 0x1239:
      this.vcdisplay[i].displaytext(0,3,s);
      break;

    case 0x1240:
      this.vcdisplay[i].displaytext(0,4,s);
      break;

    case 0x1220:
      this.vcdisplay[i].displaytext(0,5,s);
      break;

    case 0x1221:
      this.vcdisplay[i].displaytext(0,6,s);
      break;

    case 0x1228:
      this.vcdisplay[i].displaytext(0,7,s);
      break;

    case 0x1229:
      this.vcdisplay[i].displaytext(0,8,s);
      break;

    case 0x1200:
      this.vcdisplay[i].displaytext(0,9,s);
      break;

    case 0x1210:
      this.vcdisplay[i].displaytext(0,10,s);
      break;

    case 0x1208:
      this.vcdisplay[i].displaytext(0,11,s);
      break;

    case 0x1218:
      this.vcdisplay[i].displaytext(0,12,s);
      break;

    case 0x1201:
      this.vcdisplay[i].displaytext(0,13,s);
      break;

    case 0x1211:
      this.vcdisplay[i].displaytext(0,14,s);
      break;

    case 0x1209:
      this.vcdisplay[i].displaytext(0,15,s);
      break;

    case 0x1219:
      this.vcdisplay[i].displaytext(0,16,s);
      break;
  }
};

//-----------------------------------------------------------
//-----------------------------------------------------------
DIGITALPANEL.prototype.cursormove = function(event)
{
  this.divobj.style.cursor = "move";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
DIGITALPANEL.prototype.cursorpointer = function(event)
{
  this.divobj.style.cursor = "pointer";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
DIGITALPANEL.prototype.cursordefault = function(event)
{
  this.divobj.style.cursor = "default";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
DIGITALPANEL.prototype.movescreenstart = function(event)
{
  var screen = this;

  this.screenx = event.clientX - this.divobj.x;
  this.screeny = event.clientY - this.divobj.y;

  this.mouse.move = function(event) { screen.movescreen(event); };
};

//-----------------------------------------------------------
//-----------------------------------------------------------
DIGITALPANEL.prototype.movescreenstop = function(event)
{
  this.mouse.move = null;
};

//-----------------------------------------------------------
//-----------------------------------------------------------
DIGITALPANEL.prototype.movescreen = function(event)
{
  this.divobj.x = event.clientX - this.screenx;
  this.divobj.y = event.clientY - this.screeny;
  this.divobj.style.left = this.divobj.x + "px";
  this.divobj.style.top  = this.divobj.y + "px";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
DIGITALPANEL.prototype.hidescreen = function()
{
  this.divobj.style.visibility="hidden";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
DIGITALPANEL.prototype.showscreen = function(synthex)
{
  var i;

  this.display(this.maindisplay, 0, synthex.synthex5870data.oscillatorctrl);
  this.display(this.maindisplay, 2, synthex.synthex5870data.chorusctrl);

  this.display(this.upperdisplay, 0, synthex.synthex5850data.register1);
  this.display(this.upperdisplay, 1, synthex.synthex5850data.register3);
  this.display(this.upperdisplay, 2, synthex.synthex5850data.register5);

  this.display(this.lowerdisplay, 0, synthex.synthex5850data.register2);
  this.display(this.lowerdisplay, 1, synthex.synthex5850data.register4);
  this.display(this.lowerdisplay, 2, synthex.synthex5850data.register6);

  for(i=0;i<4;i++)
  {
    this.display(this.vcdisplay[i], 0, synthex.synthex5800data[i].synthsettings[0]);
    this.display(this.vcdisplay[i], 1, synthex.synthex5800data[i].synthsettings[1]);
    this.display(this.vcdisplay[i], 2, synthex.synthex5800data[i].synthsettings[2]);
    this.display(this.vcdisplay[i], 3, synthex.synthex5800data[i].synthsettings[3]);
    this.display(this.vcdisplay[i], 4, synthex.synthex5800data[i].synthsettings[4]);
    this.display(this.vcdisplay[i], 5, synthex.synthex5800data[i].fltenv1);
    this.display(this.vcdisplay[i], 6, synthex.synthex5800data[i].fltenv2);
    this.display(this.vcdisplay[i], 7, synthex.synthex5800data[i].ampenv1);
    this.display(this.vcdisplay[i], 8, synthex.synthex5800data[i].ampenv2);
    this.display(this.vcdisplay[i], 9, synthex.synthex5800data[i].octa1);
    this.display(this.vcdisplay[i], 10, synthex.synthex5800data[i].keya1);
    this.display(this.vcdisplay[i], 11, synthex.synthex5800data[i].octb1);
    this.display(this.vcdisplay[i], 12, synthex.synthex5800data[i].keyb1);
    this.display(this.vcdisplay[i], 13, synthex.synthex5800data[i].octa2);
    this.display(this.vcdisplay[i], 14, synthex.synthex5800data[i].keya2);
    this.display(this.vcdisplay[i], 15, synthex.synthex5800data[i].octb2);
    this.display(this.vcdisplay[i], 16, synthex.synthex5800data[i].keyb2);
  }

  this.power.drawbutton(0);
  this.divobj.style.visibility="visible";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
DIGITALPANEL.prototype.drawfrontpanel = function()
{
  var ctx = this.ctx;

  ctx.save();

  //Transparent shade bit at the bottom of the panel
  ctx.fillStyle = "rgba(0,0,0,0.95)";
  ctx.fillRect(12,525,756,20);

  //Wooden parts
  this.drawroundedrect(24, 545, 8, 0, 0);
  this.drawroundedrect(24, 545, 8, 756, 0);

  //Metal part
  ctx.fillStyle = "#414244";
  ctx.strokeStyle = "#000000";
  ctx.fillRect(24,10,732,525);
  ctx.strokeRect(24,10,732,525);

  //Text part
  ctx.strokeStyle = "#F5F9FC";
  ctx.lineWidth = 2;
  ctx.strokeRect(35,420,230,105);
  ctx.strokeRect(275,420,230,105);
  ctx.strokeRect(515,420,230,105);


  ctx.fillStyle = "#F5F9FC";
  ctx.textAlign = "center";
  ctx.font = "Bold 18px Arial";
  ctx.fillText("Digital Outputs",390,35);

  ctx.font = "Bold 14px Arial";
  ctx.fillText("Main Oscillator / Chorus",150,437);
  ctx.fillText("Upper LFO / Noise",390,437);
  ctx.fillText("Lower LFO / Noise",630,437);

  ctx.textAlign = "right";
  ctx.font = "Bold 10px Arial";
  ctx.fillText("(Oscillator control) F1",211,464);
  ctx.fillText("(Chorus control) DELY",211,500);
  ctx.fillText("(LFO waveform) R1",451,464);
  ctx.fillText("(LFO Routing) R3",451,482);
  ctx.fillText("(Noise control) R5",451,500);
  ctx.fillText("(LFO waveform) R2",691,464);
  ctx.fillText("(LFO Routing) R4",691,482);
  ctx.fillText("(Noise control) R6",691,500);

  ctx.restore();
};

//-----------------------------------------------------------
//-----------------------------------------------------------
DIGITALPANEL.prototype.drawvoicecard = function(xpos, ypos, id)
{
  var ctx = this.ctx;
  var x = xpos + 116;
  var y = ypos + 42;
  var i;
  var t =
  [
    "(OSC1 waveform) P1",
    "(OSC2 waveform) P2",
    "(OSC1 volume) P3",
    "(OSC2 volume) P4",
    "(Filter modes) P5",
    "ENV F1",
    "ENV F2",
    "ENV A1",
    "ENV A2",
    "OCT A1",
    "ST A1",
    "OCT B1",
    "ST B1",
    "OCT A2",
    "ST A2",
    "OCT B2",
    "ST B2"
  ];

  ctx.save();

  ctx.strokeStyle = "#F5F9FC";
  ctx.lineWidth = 2;
  ctx.strokeRect(xpos,ypos,170,355);

  ctx.fillStyle = "#F5F9FC";
  ctx.textAlign = "center";
  ctx.font = "Bold 14px Arial";
  ctx.fillText("Voice Card " + id,xpos+85,ypos+17);

  ctx.font = "Bold 10px Arial";
  ctx.textAlign = "right";

  for(i=0;i<t.length;i++)
  {
    ctx.fillText(t[i],x,y);
    y += 18;
  }

  ctx.restore();

  return(new LCDisplay(ctx,xpos+123, ypos+25, 2, 2, 17, "#000000"));
};

//-----------------------------------------------------------
//-----------------------------------------------------------
DIGITALPANEL.prototype.drawroundedrect = function(width, height, radius, xpos, ypos)
{
  var ctx = this.ctx;
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

  ctx.fillStyle = this.fillcolor;
  ctx.fill();

  ctx.lineWidth = this.linewidth;
  ctx.strokeStyle = this.strokecolor;
  ctx.stroke();
};
