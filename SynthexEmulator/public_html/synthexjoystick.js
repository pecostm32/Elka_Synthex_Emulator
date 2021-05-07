//------------------------------------------------------------
// Functionality to draw a joystick
//------------------------------------------------------------
function synthexjoystick(ctx, xpos, ypos, topx, topy, style, xval, yval, scaler, mouseranges)
{
  this.ctx = ctx;
  this.xpos = xpos;
  this.ypos = ypos;
  this.topx = topx;
  this.topy = topy;
  this.style = style;
  this.xval = xval;
  this.yval = yval;

  this.setup(scaler, mouseranges);
}

function synthexjoystickstyle(capcolor, bodycolor, linecolor, linewidth, shaftcolor)
{
  this.capcolor = capcolor;
  this.bodycolor = bodycolor;
  this.linecolor = linecolor;
  this.linewidth = linewidth;
  this.shaftcolor = shaftcolor;
}

//-----------------------------------------------------------
// Function to setup everything for a single joystick
//-----------------------------------------------------------
synthexjoystick.prototype.setup = function(scaler, mouseranges)
{
  var stick = this;

  this.x = parseInt(this.xpos * scaler);
  this.y = parseInt(this.ypos * scaler);
  var o = parseInt(20 * scaler) + 5; //The plus 5 allows the user to be outside the joystickcap for selecting it
  var l = this.x - o;
  var r = this.x + o;
  var t = this.y - o;
  var b = this.y + o;

  this.draw();

  mouseranges[mouseranges.length] = new range_item(l, r, t, b);
};

//------------------------------------------------------------------
// Function to handle the mouse actions
//------------------------------------------------------------------
synthexjoystick.prototype.move = function(event)
{
  var degree, rad;

  //For x on vertical center line the angle is either 0 or 180 degree
  if(event.offsetX == this.x)
  {
    //Below and on the horizontal center line 0 degree
    if(event.offsetY <= this.y)
      degree = 180;
    else
      degree = 0;
  }
  //For x left of the vertical center line the range is 1 to 179 degree
  else if(event.offsetX < this.x)
  {
    //For y on the horizontal center line the angle is 90 degree
    if(event.offsetY == this.y)
      degree = 90;
    else
    {
      //Y below or above the horizontal center line gives 1 to 89 and 91 to 179 degree
      rad = Math.atan((this.y - event.offsetY) / (this.x - event.offsetX));
      degree = parseInt(90 + (rad * (180 / Math.PI)));
    }
  }
  //For x right of the vertical center line the range is 181 to 359 degree
  else
  {
    //For y on the horizontal center line the angle is 270 degree
    if(event.offsetY == this.y)
      degree = 270;
    else
    {
      //Y below the horizontal center line gives 181 to 269 and 271 to 359 degree
      rad = Math.atan((event.offsetY - this.y) / (event.offsetX - this.x));
      degree = parseInt(270 + (rad * (180 / Math.PI)));
    }
  }

  this.position = degree;

  this.draw();
};

//------------------------------------------------------------------
// Function to draw the actual joystick
//------------------------------------------------------------------
synthexjoystick.prototype.draw = function()
{
  var ctx = this.ctx;
  var style = this.style;
  var c0 = 0;
  var c1 = 2.0 * Math.PI;

  ctx.beginPath();
  ctx.arc(this.xpos, this.ypos, 20, c0, c1, false);

  ctx.fillStyle = style.bodycolor;
  ctx.fill();

  ctx.lineWidth = style.linewidth;
  ctx.strokeStyle = style.linecolor;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(this.topx, this.topy, 8, c0, c1, false);

  ctx.fillStyle = style.capcolor;
  ctx.fill();
};

//---------------------------------------------------
