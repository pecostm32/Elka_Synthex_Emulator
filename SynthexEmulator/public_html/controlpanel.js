//-----------------------------------------------------------
//-----------------------------------------------------------
function ControlPanel(canvas, mouse)
{
  this.fillcolor = "#A56241";
  this.strokecolor = "#000000";
  this.linewidth = 1;
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");

  //Set the canvas to the needed dimensions
  canvas.width = 460;
  canvas.height = 140;

  this.drawpanel();

  this.buttonstyle = new synthexbuttonstyle("arial", 14, "Bold", "#F5F9FC");

  this.cpumonitor = new synthexbutton(this.ctx,90,45,0,this.buttonstyle,0,"CPU Monitor",1,mouse.ranges);
  this.digitalout = new synthexbutton(this.ctx,210,45,0,this.buttonstyle,0,"Digital Outputs",1,mouse.ranges);
  this.analogout = new synthexbutton(this.ctx,330,45,0,this.buttonstyle,0,"Analog Outputs",1,mouse.ranges);
}

//-----------------------------------------------------------
//-----------------------------------------------------------
ControlPanel.prototype.drawpanel = function()
{
  var ctx = this.ctx;

  ctx.save();

  //Wooden parts
  this.drawroundedrect(20, 140, 8, 0, 0);
  this.drawroundedrect(20, 140, 8, 440, 0);

  //Metal part
  ctx.fillStyle = "#414244";
  ctx.fillRect(20,10,420,120);
  ctx.strokeRect(20,10,420,120);

  ctx.restore();
};

//-----------------------------------------------------------
//-----------------------------------------------------------
ControlPanel.prototype.drawroundedrect = function (width, height, radius, xpos, ypos)
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
