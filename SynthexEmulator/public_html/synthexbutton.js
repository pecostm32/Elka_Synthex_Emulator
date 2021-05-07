//-----------------------------------------------------------
// Functionality to draw a button
//-----------------------------------------------------------
function synthexbutton(ctx, xpos, ypos, orientation, style, legendtype, legendtext, scaler, mouseranges)
{
  this.ctx = ctx;
  this.xpos = xpos;
  this.ypos = ypos;
  this.orientation = orientation;
  this.style = style;
  this.state = 0;
  this.ledstate = 0;
  this.legendtype = legendtype;
  this.legendtext = legendtext;

  this.setup(scaler, mouseranges);
}

function synthexbuttonstyle(fontname, fontsize, fontweight, fontcolor)
{
  this.fontsize = fontsize;
  this.fontcolor = fontcolor;
  this.font = fontweight + " " + fontsize + "px " + fontname;
}

//---------------------------------------------------
// Function to handle mouse down
//---------------------------------------------------
synthexbutton.prototype.down = function(event)
{
  this.state = 1;
  this.draw();
};

//---------------------------------------------------
// Function to handle mouse up
//---------------------------------------------------
synthexbutton.prototype.up = function(event)
{
  this.state = 0;
  this.draw();

  //Check if there is an action on this button
  if((typeof this.action !== "undefined") && (this.action != null))
  {
    //Handle the coupled action
    this.action();
  }
};

//---------------------------------------------------
// Function to set the led state
//---------------------------------------------------
synthexbutton.prototype.setledstate = function(state)
{
  if(state != this.ledstate)
  {
    this.ledstate = state;
    this.draw();
  }
};

//---------------------------------------------------
// Function to setup everything for a single button
//---------------------------------------------------
synthexbutton.prototype.setup = function(scaler, mouseranges)
{
  var button = this;
  var ctx = this.ctx;
  var style = this.style;
  var i = mouseranges.length;
  var x = this.xpos;
  var y = this.ypos - 10;
  var l,r,t,b;

  if(this.orientation == 1)
  {
    l = parseInt(this.xpos * scaler);
    r = parseInt((this.xpos + 64) * scaler);
    t = parseInt(this.ypos * scaler);
    b = parseInt((this.ypos + 49) * scaler);
  }
  else
  {
    l = parseInt(this.xpos * scaler);
    r = parseInt((this.xpos + 49) * scaler);
    t = parseInt(this.ypos * scaler);
    b = parseInt((this.ypos + 64) * scaler);
  }

  mouseranges[i] = new range_item(l, r, t, b);

  mouseranges[i].down = function(event) { button.down(event); };
  mouseranges[i].up = function(event) { button.up(event); };

  ctx.lineWidth = 2;
  ctx.strokeStyle = style.fontcolor;
  ctx.fillStyle = style.fontcolor;
  ctx.font = style.font;

  switch(this.legendtype)
  {
    default:
      break;

    //Text center aligned
    case 0:
      x += 24.5;
      ctx.textAlign = "center";
      ctx.fillText(this.legendtext,x,y);
      break;

    //Text right aligned
    case 1:
      x += 47;
      ctx.textAlign = "right";
      ctx.fillText(this.legendtext,x,y);
      break;

    //Text left aligned
    case 2:
      x += 2;
      ctx.textAlign = "left";
      ctx.fillText(this.legendtext,x,y);
      break;

    //Multiple text lines center aligned
    case 3:
      var t = this.legendtext.split("<;>");
      var i;
      x += 24.5;
      y -= style.fontsize * (t.length - 1);
      ctx.textAlign = "center";

      for(i=0;i<t.length;i++)
      {
        ctx.fillText(t[i],x,y);
        y += style.fontsize;
      }
      break;

    //Triangle wave
    case 4:
      y -= 8;
      x += 10.5;
      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.lineTo(x+7,y-7);
      ctx.lineTo(x+21,y+7);
      ctx.lineTo(x+28,y);
      ctx.stroke();
      break;

    //Falling sawtooth
    case 5:
      y -= 1;
      x += 10.5;
      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.lineTo(x,y-14);
      ctx.lineTo(x+28,y);
      ctx.stroke();
      break;

    //Rising sawtouth
    case 6:
      y -= 1;
      x += 10.5;
      ctx.beginPath();
      ctx.moveTo(x,y);
      x += 28;
      ctx.lineTo(x,y-14);
      ctx.lineTo(x,y);
      ctx.stroke();
      break;

    //Square wave
    case 7:
      y -= 8;
      x += 10.5;
      ctx.beginPath();
      ctx.moveTo(x,y);
      y -= 7;
      ctx.lineTo(x,y);
      x += 14;
      ctx.lineTo(x,y);
      y += 14;
      ctx.lineTo(x,y);
      x += 14;
      ctx.lineTo(x,y);
      y -= 7;
      ctx.lineTo(x,y);
      ctx.stroke();
      break;

    //Pulse wave
    case 8:
      y -= 1;
      x += 10.5;
      ctx.beginPath();
      ctx.moveTo(x,y);
      y -= 14;
      ctx.lineTo(x,y);
      x += 6;
      ctx.lineTo(x,y);
      y += 14;
      ctx.lineTo(x,y);
      x += 22;
      ctx.lineTo(x,y);
      ctx.stroke();
      break;

    //Text right aligned on the left of the key
    case 9:
      x -= 10;
      y += 42 - (style.fontsize * 0.2);
      ctx.textAlign = "right";
      ctx.fillText(this.legendtext,x,y);
      break;
  }

  this.draw();
};

//---------------------------------------------------
// Function to draw the actual button
//---------------------------------------------------
synthexbutton.prototype.draw = function()
{
  var ctx = this.ctx;
  var x1 = 8;
  var x2 = 40;

  var y1 = 24;
  var y2 = 54;

  if(this.state == 1)
  {
    x1 -= 2;
    x2 += 2;
    y1 += 3;
    y2 += 4;
  }

  ctx.save();

  if(this.orientation == 1)
  {
    ctx.rotate(-90 * Math.PI / 180);
    ctx.translate(-1 * (this.ypos + 49), this.xpos);
  }
  else
  {
    ctx.translate(this.xpos, this.ypos);
  }

  //Button body
  ctx.fillStyle = "#F5F5DC";  //#F3F3F3
  ctx.fillRect(0, 0, 49, 64);

  //Actual button lines
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#C9C9A9";

  ctx.beginPath();
  ctx.moveTo(3,3);
  ctx.lineTo(46,3);
  ctx.lineTo(46,61);
  ctx.lineTo(3,61);
  ctx.lineTo(3,3);

  ctx.moveTo(3,18);
  ctx.lineTo(46,18);
  ctx.lineTo(40,y1);
  ctx.lineTo(8,y1);
  ctx.lineTo(3,18);

  ctx.moveTo(8,y1);
  ctx.lineTo(x1,y2);

  ctx.moveTo(40,y1);
  ctx.lineTo(x2,y2);

  ctx.moveTo(3,61);
  ctx.lineTo(x1,y2);
  ctx.lineTo(x2,y2);
  ctx.lineTo(46,61);
  ctx.stroke();

  //Black outer part
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#000000";
  ctx.strokeRect(0, 0, 49, 64);

  //Led
  if(this.ledstate == 1)
  {
//    ctx.shadowBlur = 3;
//    ctx.shadowColor = "#E0301D";
    ctx.fillStyle = "#F82809";
  }
  else
    ctx.fillStyle = "#591419";

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#731A20";
  ctx.beginPath();
  ctx.arc(24.5, 11, 7, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
};

//---------------------------------------------------
// Function to draw the text below a button
//---------------------------------------------------
function drawbuttonsubscript(ctx, xpos, ypos, span, style, text, line)
{
  var w = span * 50;
  var hw = w / 2;
  var x = xpos + hw;
  var y = ypos + 73 + style.fontsize;
  var ll;

  ctx.lineWidth = 2;
  ctx.strokeStyle = style.fontcolor;
  ctx.fillStyle = style.fontcolor;
  ctx.font = style.font;

  ctx.textAlign = "center";
  ctx.fillText(text,x,y);

  //When a line either side of the text is needed
  if(line == 1)
  {
    ll = hw - (ctx.measureText(text).width / 2) - 3;
    y -= (style.fontsize * 0.4);
    x = xpos;

    ctx.beginPath();
    ctx.moveTo(x,y);
    x += ll;
    ctx.lineTo(x,y);
    x = xpos + w;
    ctx.moveTo(x,y);
    x -= ll;
    ctx.lineTo(x,y);
    ctx.stroke();
  }
}

//---------------------------------------------------
