//-----------------------------------------------------------
// Functionality to draw a rotary knob
//-----------------------------------------------------------
function synthexknob(ctx, radius, xpos, ypos, type, caption, style, position, scaler, mouseranges)
{
  this.ctx = ctx;
  this.radius = radius;
  this.xpos = xpos;
  this.ypos = ypos;
  this.type = type;
  this.caption = caption;
  this.style = style;
  this.position = position;

  this.mouse = null;

  this.setup(scaler, mouseranges);
}

function synthexknobstyle(capcolor, bodycolor, linecolor, linewidth, pointercolor, pointerwidth, ledgendcolor, legendwidth, fontname, fontsize)
{
  this.capcolor = capcolor;
  this.bodycolor = bodycolor;
  this.linecolor = linecolor;
  this.linewidth = linewidth;
  this.pointercolor = pointercolor;
  this.pointerwidth = pointerwidth;
  this.ledgendcolor = ledgendcolor;
  this.legendwidth = legendwidth;
  this.fontsize = fontsize;

  this.font = fontsize + "px " + fontname;
}

//-----------------------------------------------------------
// Function to setup everything for a single knob
//-----------------------------------------------------------
synthexknob.prototype.setup = function(scaler, mouseranges)
{
  var knob = this;
  var i = mouseranges.length;

  //The 10 offset has to do with browser misalignment
  this.x = parseInt((this.xpos - ((3 / 12) * this.radius)) * scaler);
  this.y = parseInt((this.ypos - ((1 / 12) * this.radius)) * scaler);
  var o = parseInt(this.radius * scaler) + 5; //The plus 5 allows the user to be outside the knobcap for selecting it
  var l = this.x - o;
  var r = this.x + o;
  var t = this.y - o;
  var b = this.y + o;

  this.drawlegend();
  this.draw();

  mouseranges[i] = new range_item(l, r, t, b);
  mouseranges[i].down = function(event) { knob.down(event); };
  mouseranges[i].up = function(event) { knob.up(event); };

  this.mouse = mouseranges[i];
};

//------------------------------------------------------------------
// Function to handle the mouse down action
//------------------------------------------------------------------
synthexknob.prototype.down = function(event)
{
  var knob = this;

  //Starting with moving so draw a new position without delta checking
  this.drawpos(event, true);

  //Set the pointer for handling the moving
  this.mouse.move = function(event) { knob.move(event); };
};

//------------------------------------------------------------------
// Function to handle the mouse up action
//------------------------------------------------------------------
synthexknob.prototype.up = function(event)
{
  //Draw final position with delta checking
  this.drawpos(event, false);

  //Stop the moving of the knob
  this.mouse.move = null;
};

//------------------------------------------------------------------
// Function to handle the mouse move action
//------------------------------------------------------------------
synthexknob.prototype.move = function(event)
{
  //Draw new position with delta checking
  this.drawpos(event, false);
};

//------------------------------------------------------------------
// Function to handle the mouse move action
//------------------------------------------------------------------
synthexknob.prototype.set = function(pos)
{
  this.position = ((pos / 255) * 300) + 30;
  this.draw();
};

//------------------------------------------------------------------
// Function to draw a new position based on the mouse position
//------------------------------------------------------------------
synthexknob.prototype.drawpos = function(event, skip)
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

  //Filter out jumping through the end points when moving
  if((Math.abs(this.position - degree) < 30) || (skip == true))
  {
    if(degree < 30)
      degree = 30;
    else if(degree > 330)
      degree = 330;

    //Only draw when moved
    if(this.position != degree)
    {
      this.position = degree;
      this.draw();

      //Check if there is an action on this knob
      if((typeof this.action !== "undefined") && (this.action != null))
      {
        //Handle the coupled action
        this.action(parseInt(((degree - 30) / 300) * 255));
      }
    }
  }
};

//------------------------------------------------------------------
// Function to draw the legend for a knob
//
// Three types are offered
//  type 0: 0 - 10
//  type 1: 0 - 12
//  type 2: 5 - 0 - 5
//------------------------------------------------------------------
synthexknob.prototype.drawlegend = function()
{
  var ctx = this.ctx;
  var style = this.style;
  var x1 = this.xpos;
  var y1 = this.ypos;

  var r1 = this.radius + (this.radius / 2);
  var r2 = r1 + ((1 / 7) * this.radius);
  var i,rp,s,c,x2,t;

  var y2 = y1 + (1.8 * this.radius) + style.fontsize;

  ctx.fillStyle = style.ledgendcolor;
  ctx.font = style.font;
  ctx.textAlign = "center";
  ctx.fillText(this.caption,x1,y2);

  ctx.lineWidth = style.legendwidth;
  ctx.strokeStyle = style.ledgendcolor;

  switch(this.type)
  {
    default:
    case 0:
    case 2:
      ctx.textAlign = "right";

      for(i=0;i<11;i++)
      {
        rp = (360 - (((i * 30) + 30) / 180)) * Math.PI;
        s = Math.sin(rp);
        c = Math.cos(rp);
        x2 = x1 + (r1 * s);
        y2 = y1 + (r1 * c);

        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();

        x2 = x1 + (r2 * s);
        y2 = y1 + (r2 * c);

        switch(i)
        {
          case 0:
          case 10:
            y2 += style.fontsize * 0.6;
            break;

          case 1:
          case 9:
            y2 += style.fontsize * 0.4;
            break;

          case 2:
          case 8:
            y2 += style.fontsize * 0.35;
            break;

          case 3:
          case 7:
            y2 += style.fontsize * 0.3;
            break;

          case 4:
          case 6:
            y2 += style.fontsize * 0.25;
            break;

          case 5:
            ctx.textAlign = "center";
            break;
        }

        if(i == 6)
          ctx.textAlign = "left";

        if(this.type == 2)
          t = Math.abs(5 - i);
        else
          t = i.toString();

        ctx.fillText(t,x2,y2);
      }
      break;

    case 1:
      ctx.textAlign = "right";

      for(i=0;i<13;i++)
      {
        rp = (360 - (((i * (300 / 12)) + 30) / 180)) * Math.PI;
        s = Math.sin(rp);
        c = Math.cos(rp);
        x2 = x1 + (r1 * s);
        y2 = y1 + (r1 * c);

        ctx.beginPath();
        ctx.moveTo(x1,y1);
        ctx.lineTo(x2,y2);
        ctx.stroke();

        x2 = x1 + (r2 * s);
        y2 = y1 + (r2 * c);

        switch(i)
        {
          case 0:
          case 12:
            y2 += style.fontsize * 0.6;
            break;

          case 1:
          case 11:
            y2 += style.fontsize * 0.5;
            break;

          case 2:
          case 10:
            y2 += style.fontsize * 0.45;
            break;

          case 3:
          case 9:
            y2 += style.fontsize * 0.35;
            break;

          case 4:
          case 8:
            y2 += style.fontsize * 0.3;
            break;

          case 5:
          case 7:
            y2 += style.fontsize * 0.3;
            break;

          case 6:
            ctx.textAlign = "center";
            break;
        }

        if(i == 7)
          ctx.textAlign = "left";

        ctx.fillText(i.toString(),x2,y2);
      }
      break;
  }
};

//------------------------------------------------------------------
// Function to draw the actual knob
//------------------------------------------------------------------
synthexknob.prototype.draw = function()
{
  if(this.position < 30)
    this.position = 30;
  else if(this.position > 330)
    this.position = 330;

  var ctx = this.ctx;
  var style = this.style;
  var rp = ((360 - this.position) / 180) * Math.PI;
  var s = Math.sin(rp);
  var c = Math.cos(rp);
  var r1 = this.radius / 3;
  var r2 = this.radius - style.linewidth - 1;
  var c0 = 0;
  var c1 = 2.0 * Math.PI;

  var x1 = this.xpos - ((3 / 12) * this.radius);
  var y1 = this.ypos - ((1 / 12) * this.radius);

  var x2 = x1 + (r1 * s);
  var y2 = y1 + (r1 * c);
  var x3 = x1 + (r2 * s);
  var y3 = y1 + (r2 * c);

  ctx.beginPath();
  ctx.arc(this.xpos, this.ypos, this.radius, c0, c1, false);

  ctx.fillStyle = style.bodycolor;
  ctx.fill();

  ctx.lineWidth = style.linewidth;
  ctx.strokeStyle = style.linecolor;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x1, y1, this.radius, c0, c1, false);

  ctx.fillStyle = style.capcolor;
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2,y2);
  ctx.lineTo(x3,y3);

  ctx.lineWidth = style.pointerwidth;
  ctx.strokeStyle = style.pointercolor;
  ctx.stroke();
};

//---------------------------------------------------
