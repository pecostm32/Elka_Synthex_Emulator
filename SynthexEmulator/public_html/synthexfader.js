//-----------------------------------------------------------
// Functionality to draw a fader
//-----------------------------------------------------------

//-----------------------------------------------------------
// There are two types of legend markings
//  type
//   0 -> markers on right side with labels
//   1 -> markers on left side whitout labels
//-----------------------------------------------------------
function synthexfader(ctx, xpos, ypos, type, caption, style, position, scaler, mouseranges)
{
  this.ctx = ctx;
  this.xpos = xpos;
  this.ypos = ypos;
  this.type = type;
  this.caption = caption;
  this.style = style;
  this.position = position;

  this.setup(scaler, mouseranges);
}

function synthexfaderstyle(capcolor, bodycolor, slotcolor, ledgendcolor, legendwidth, fontname, fontsize)
{
  this.capcolor = capcolor;
  this.bodycolor = bodycolor;
  this.slotcolor = slotcolor;
  this.ledgendcolor = ledgendcolor;
  this.legendwidth = legendwidth;
  this.fontsize = fontsize;
  this.font = fontsize + "px " + fontname;
}

//-----------------------------------------------------------
// Function to setup everything for a single fader
//-----------------------------------------------------------
synthexfader.prototype.setup = function(scaler, mouseranges)
{
  var fader = this;
  var i = mouseranges.length;

  this.drawlegend();
  this.draw();

  var l = parseInt((this.xpos - 8) * scaler);
  var r = parseInt((this.xpos + 16) * scaler);
  this.t = parseInt(this.ypos * scaler);
  this.b = parseInt((this.ypos + 145) * scaler);
  this.l = this.b - this.t;

  mouseranges[i] = new range_item(l, r, this.t, this.b);

  mouseranges[i].down = function(event) { fader.down(event); };
  mouseranges[i].up = function(event) { fader.up(event); };

  this.mouse = mouseranges[i];
};

//------------------------------------------------------------------
// Function to handle the mouse down action
//------------------------------------------------------------------
synthexfader.prototype.down = function(event)
{
  var fader = this;

  //Starting with moving so draw a new position
  this.move(event);

  //Set the pointer for handling the moving
  this.mouse.move = function(event) { fader.move(event); };
};

//------------------------------------------------------------------
// Function to handle the mouse up action
//------------------------------------------------------------------
synthexfader.prototype.up = function(event)
{
  //Draw final position
  this.move(event);

  //Stop the moving of the knob
  this.mouse.move = null;
};

//-----------------------------------------------------------
// Function to draw a new position based on the mouse position
//-----------------------------------------------------------
synthexfader.prototype.move = function(event)
{
  var pos = event.offsetY - this.t;

  if(event.offsetY < this.t)
    pos = 255;
  else if(event.offsetY > this.b)
    pos = 0;
  else
    pos = 255 - parseInt(((event.offsetY - this.t) * 255) / this.l);

  this.position = pos;

  this.draw();
};

//-----------------------------------------------------------
// Function to draw the legend for a fader
//-----------------------------------------------------------
synthexfader.prototype.drawlegend = function()
{
  var ctx = this.ctx;
  var style = this.style;
  var x1 = this.xpos + 4;
  var y1 = this.ypos + 145 + style.fontsize;
  var i;

  ctx.fillStyle = style.ledgendcolor;
  ctx.font = style.font;
  ctx.textAlign = "center";
  ctx.fillText(this.caption,x1,y1);

  if(this.type == 0)
  {
    x1 = this.xpos + 38;
    y1 = this.ypos + 7 + (style.fontsize * 0.3);

    for(i=10;i>=0;i--)
    {
       ctx.fillText(i,x1,y1);
       y1 += 13.1;
    }
  }
};

//-----------------------------------------------------------
// Function to draw the actual fader
//-----------------------------------------------------------
synthexfader.prototype.draw = function()
{
  var ctx = this.ctx;
  var style = this.style;
  var x1 = this.xpos;
  var y1 = this.ypos;
  var i,x2,pos;

  //Draw the panel background
  if(this.type == 0)
    x2 = x1 - 15;
  else
    x2 = x1 - 23;

  ctx.fillStyle = "#414244";
  ctx.fillRect(x2,y1-2,46,149);

  //Draw the slot in the panel
  ctx.fillStyle = style.slotcolor;
  ctx.fillRect(x1,y1,8,145);

  ctx.lineWidth = style.legendwidth;
  ctx.strokeStyle = style.ledgendcolor;

  //Setup the positions for the range lines based on the type
  //0 -> lines on the right; 1 -> lines on the left
  y1 += 7;

  if(this.type == 0)
  {
    x1 += 9;
    x2 = x1 + 22;
  }
  else
  {
    x2 = x1 - 1;
    x1 -= 23;
  }

  //Draw the range lines
  ctx.beginPath();

  for(i=0;i<11;i++)
  {
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y1);

    y1 += 13;
  }

  ctx.stroke();

  pos = (this.position * 120) / 255;

  if(pos > 120)
    pos = 120;

  //Draw the actual knob
  x1 = this.xpos - 4;
  y1 = (this.ypos + 120) - pos;

  ctx.fillStyle = style.bodycolor;
  ctx.fillRect(x1,y1,16,24);

  ctx.fillStyle = style.capcolor;
  x1 += 3;
  y1 += 3;
  ctx.fillRect(x1,y1,10,18);
};

//-----------------------------------------------------------

