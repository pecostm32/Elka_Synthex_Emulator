//-----------------------------------------------------------
// Code for showing a separate panel that displays info
// for all the analog signal on the CPU card
//-----------------------------------------------------------
function ANALOGPANEL(divobj, canvas, mouse)
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
  divobj.x = 840;
  divobj.y = 20;
  divobj.style.left = divobj.x + "px";
  divobj.style.top  = divobj.y + "px";

  var screen = this;

  this.mouse.down = function(event) { screen.movescreenstart(event); };
  this.mouse.up = function(event) { screen.movescreenstop(event); };
  this.mouse.over = function(event) { screen.cursormove(event); };
  this.mouse.out = function(event) { screen.cursordefault(event); };

  this.drawfrontpanel();

  this.display = [];
  this.display[0] = this.drawvoicecard(35,55,"Upper Voices");
  this.display[1] = this.drawvoicecard(395,55,"Lower Voices");

  this.display[2] = new LCDisplay(this.ctx, 276, 385, 1.6, 18, 8, "#000000");

  this.power = new Button(this.ctx, 720, 25, 18, 18, 5, mouse.ranges);
}

//-----------------------------------------------------------
//-----------------------------------------------------------
ANALOGPANEL.prototype.disp = function(synthex, idx)
{
  var b = synthex.synthex5870data;
  var j = b.anlsrc[idx];
  var s = ["REF_5V  ", "TRACK_L ", "OCT_F   ", "VP_L    ", "TRACK_U ", "GLI_VL  ", "VP_U    ", "GLI_VU  "];
  var r = [0x30,0x02,0x31,0x06,0x01,0x15,0x03,0x14];
  var d = (b.anlsig[idx] + 0x100).toString(16).slice(-2).toUpperCase() + " ";
  var v = ((b.anlsig[idx] * b.anlsig[r[j]]) / 255) * 0.01953125;
  var t = (s[j] + d + v.toString().slice(0,6) + "V     ").slice(0,18);

  var l = [8,9,9,10,8,4,10,6,4,5,5,1,12,1,12,7,2,3,3,0,14,14,2,0,0,0,13,2,13,7,6,6,5,3,11,11,7,1,0,4];
  var o = [1,0,1,0,0,2,1,2,0,1,0,0,0,1,1,0,0,0,1,3,0,1,1,3,0,1,1,2,0,2,0,1,2,2,0,1,1,2,2,1];

  if(o[idx] < 3)
    this.display[o[idx]].displaytext(0,l[idx],t);
};

//-----------------------------------------------------------
//-----------------------------------------------------------
ANALOGPANEL.prototype.update = function(synthex)
{
  var b = synthex.synthex5870data;
  var r = [0x30,0x02,0x31,0x06,0x01,0x15,0x03,0x14];
  var i,s;

  this.disp(synthex,b.anlsel);

  //See if current channel is a reference source
  for(i=0,s=-1;i<r.length;i++)
  {
    if(r[i] == b.anlsel)
    {
      s = i;
      break;
    }
  }

  //Only when current is a reference source
  if(s != -1)
  {
    //Update channels that use the current channel as reference source
    for(i=0;i<0x28;i++)
    {
      if(b.anlsrc[i] == s)
        this.disp(synthex,i);
    }
  }
};

//-----------------------------------------------------------
//-----------------------------------------------------------
ANALOGPANEL.prototype.cursormove = function(event)
{
  this.divobj.style.cursor = "move";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
ANALOGPANEL.prototype.cursorpointer = function(event)
{
  this.divobj.style.cursor = "pointer";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
ANALOGPANEL.prototype.cursordefault = function(event)
{
  this.divobj.style.cursor = "default";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
ANALOGPANEL.prototype.movescreenstart = function(event)
{
  var screen = this;

  this.screenx = event.clientX - this.divobj.x;
  this.screeny = event.clientY - this.divobj.y;

  this.mouse.move = function(event) { screen.movescreen(event); };
};

//-----------------------------------------------------------
//-----------------------------------------------------------
ANALOGPANEL.prototype.movescreenstop = function(event)
{
  this.mouse.move = null;
};

//-----------------------------------------------------------
//-----------------------------------------------------------
ANALOGPANEL.prototype.movescreen = function(event)
{
  this.divobj.x = event.clientX - this.screenx;
  this.divobj.y = event.clientY - this.screeny;
  this.divobj.style.left = this.divobj.x + "px";
  this.divobj.style.top  = this.divobj.y + "px";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
ANALOGPANEL.prototype.hidescreen = function()
{
  this.divobj.style.visibility="hidden";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
ANALOGPANEL.prototype.showscreen = function(synthex)
{
  var i;

  for(i=0;i<0x28;i++)
    this.disp(synthex,i);

  this.power.drawbutton(0);
  this.divobj.style.visibility="visible";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
ANALOGPANEL.prototype.drawfrontpanel = function()
{
  var ctx = this.ctx;
  var y = 400;
  var i;

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
  ctx.strokeRect(265,345,250,180);

  ctx.fillStyle = "#F5F9FC";
  ctx.textAlign = "center";
  ctx.font = "Bold 18px Arial";
  ctx.fillText("Analog Outputs",390,35);

  ctx.font = "Bold 14px Arial";
  ctx.fillText("Keyboard Voltages",390,362);

  ctx.textAlign = "left";
  ctx.font = "Bold 12px Arial";
  ctx.fillText("Source",282,379);
  ctx.fillText("Data",353,379);
  ctx.fillText("Output",389,379);
  ctx.fillText("Signal",467,379);

  ctx.font = "Bold 10px Arial";

  for(i=1;i<=8;i++)
  {
    ctx.fillText("Key " + i,467,y);
    y += 14.6;
  }

  ctx.restore();
};

//-----------------------------------------------------------
//-----------------------------------------------------------
ANALOGPANEL.prototype.drawvoicecard = function(xpos, ypos, caption)
{
  var ctx = this.ctx;
  var x = xpos + 202;
  var y = ypos + 55;
  var i;
  var t =
  [
    "LFO Frequency",
    "LFO Delay",
    "LFO Depth A",
    "LFO Depth B",
    "OSC1 Pulse Width",
    "OSC2 Pulse Width",
    "Detune",
    "Filter Frequency",
    "Filter Resonance",
    "Filter Keyboard",
    "Filter Envelope Level",
    "Filter Envelope Sustain",
    "Amplifier Envelope Sustain",
    "Glide Frequency",
    "Glide Voltage"
  ];

  ctx.save();

  ctx.strokeStyle = "#F5F9FC";
  ctx.lineWidth = 2;
  ctx.strokeRect(xpos,ypos,350,280);

  ctx.fillStyle = "#F5F9FC";
  ctx.textAlign = "center";
  ctx.font = "Bold 14px Arial";
  ctx.fillText(caption,xpos+175,ypos+17);

  ctx.textAlign = "left";
  ctx.font = "Bold 12px Arial";
  ctx.fillText("Source",xpos+17,ypos+34);
  ctx.fillText("Data",xpos+88,ypos+34);
  ctx.fillText("Output",xpos+124,ypos+34);
  ctx.fillText("Signal",xpos+202,ypos+34);

  ctx.font = "Bold 10px Arial";

  for(i=0;i<t.length;i++)
  {
    ctx.fillText(t[i],x,y);
    y += 14.6;
  }

  ctx.restore();

  return(new LCDisplay(ctx,xpos+11, ypos+40, 1.6, 18, 15, "#000000"));
};

//-----------------------------------------------------------
//-----------------------------------------------------------
ANALOGPANEL.prototype.drawroundedrect = function(width, height, radius, xpos, ypos)
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
