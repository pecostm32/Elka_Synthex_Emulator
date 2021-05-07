//-----------------------------------------------------------
// Functionality to draw a pianokeyboard
//-----------------------------------------------------------
function pianokeyboard(ctx, octaves, xpos, ypos, scaler, mouseranges)
{
  this.ctx = ctx;
  this.octaves = octaves;
  this.xpos = xpos;
  this.ypos = ypos;

  this.keys = new Array();

  this.previouskey = null;

  this.whitekeyconvtab = [0,2,4,5,7,9,11];
  this.blackkeyconvtab = [1,3,6,8,10];
  this.blackkeyxstart = new Array();
  this.blackkeyxend = new Array();

  this.octavewidth;
  this.blackkeyheight;
  this.whitekeywidth;

  this.setup(scaler, mouseranges);
}

function pianokey(ctx, id, type, xpos, ypos, num, state)
{
  this.ctx = ctx;
  this.id = id;
  this.type = type;
  this.xpos = xpos;
  this.ypos = ypos;
  this.num = num;

  this.drawkey(state, null);
}

//---------------------------------------------------------------
// Function to setup everything needed for the pianokeyboard
//---------------------------------------------------------------
pianokeyboard.prototype.setup = function(scaler, mouseranges)
{
  var keyboard = this;
  var m = mouseranges.length;
  var i,x;
  var l = parseInt(this.xpos * scaler);
  var r = parseInt((this.xpos + (574 * this.octaves) + 82) * scaler);
  var t = parseInt(this.ypos * scaler);
  var b = parseInt((this.ypos + 450) * scaler);
  var n = 0;

  //Setup vars for mouse handling functions
  this.octavewidth = 574 * scaler;
  this.blackkeyheight = 282 * scaler;
  this.whitekeywidth = 82 * scaler;

  for(i=0; i<this.octaves; i++, n+=12)
  {
    this.drawoctave(n);
    this.xpos += 574;
  }

  //Upper C
  this.keys[this.keys.length] = new pianokey(this.ctx, 0, "white", this.xpos, this.ypos, n, 0);

  //Setup black key positions table
  for(x=53,i=0;i<5;i++)
  {
    this.blackkeyxstart[i] = parseInt(x * scaler);
    this.blackkeyxend[i] = parseInt((x + 46) * scaler);
    x += 92;

    if(i == 1)
      x += 57;
  }

  this.x = l;
  this.y = t;

  mouseranges[m] = new range_item(l, r, t, b);

  mouseranges[m].down = function(event) { keyboard.down(event); };
  mouseranges[m].up = function(event) { keyboard.up(event); };
  mouseranges[m].out = function(event) { keyboard.up(event); };

  this.mouse = mouseranges[m];
};

//------------------------------------------------------------------
// Function to handle the mouse down action
//------------------------------------------------------------------
pianokeyboard.prototype.down = function(event)
{
  var obj = this;
  var key = this.keys[this.getpianokeyindex(event)];
  var action = null;

  //Check if there is an action on the keyboard
  if((typeof this.action !== "undefined") && (this.action != null))
    action = this.action;

  //Key is down
  key.drawkey(1, action);

  //There is an active key
  this.previouskey = key;

  //Set the pointer for handling the moving
  this.mouse.move = function(event) { obj.move(event); };
};

//------------------------------------------------------------------
// Function to handle the mouse up action
//------------------------------------------------------------------
pianokeyboard.prototype.up = function(event)
{
  var key = this.keys[this.getpianokeyindex(event)];
  var action = null;

  //Check if there is an action on the keyboard
  if((typeof this.action !== "undefined") && (this.action != null))
    action = this.action;

  //Stop the handling of moving over the keys
  this.mouse.move = null;

  //Key no longer down
  key.drawkey(0, action);

  //So no longer an active key
  this.previouskey = null;
};

//---------------------------------------------------------------
// Function to hanlde the mouse move action
//---------------------------------------------------------------
pianokeyboard.prototype.move = function(event)
{
  var key = this.keys[this.getpianokeyindex(event)];
  var prevkey = this.previouskey;
  var action = null;

  //Check if there is an action on the keyboard
  if((typeof this.action !== "undefined") && (this.action != null))
    action = this.action;

  //Check if we moved on to an other key
  if(prevkey != key)
  {
    prevkey.drawkey(0, action);
    key.drawkey(1, action);
    this.previouskey = key;
  }
};

//---------------------------------------------------------------
// Function to derive the key index based on the mouse position
//---------------------------------------------------------------
pianokeyboard.prototype.getpianokeyindex = function(event)
{
  var key,octave,x,i;
  var xp = event.offsetX - this.x;

  //Get the key index for the white keys
  key = parseInt(xp / this.whitekeywidth);
  octave = parseInt(key / 7);
  key = this.whitekeyconvtab[key % 7];

  //Check if y position in black key range
  if((event.offsetY - this.y) < this.blackkeyheight)
  {
    x = xp - parseInt(octave * this.octavewidth);

    for(i=0;i<5;i++)
    {
      if((x > this.blackkeyxstart[i]) && (x < this.blackkeyxend[i]))
      {
        key = this.blackkeyconvtab[i];
        break;
      }
    }
  }

  return((octave * 12) + key);
};

//---------------------------------------------------
// Function to draw a whole octave
//---------------------------------------------------
pianokeyboard.prototype.drawoctave = function(idx)
{
  var i;
  var xb = this.xpos + 53;
  var xw = this.xpos;

  //12 keys per octave. 7 white and 5 black
  for(i=1;i<13;i++,idx++)
  {
    //Detect if this is a black key
    if((i == 2) || (i == 4) || (i == 7) || (i == 9) || (i == 11))
    {
      this.keys[this.keys.length] = new pianokey(this.ctx, i, "black", xb, this.ypos, idx, 0);
      xb += 92;

      if(i == 4)
        xb += 57;
    }
    else
    {
      this.keys[this.keys.length] = new pianokey(this.ctx, i, "white", xw, this.ypos, idx, 0);
      xw += 82;
    }
  }
};

//---------------------------------------------------
// Function to draw a single key
//---------------------------------------------------
pianokey.prototype.drawkey = function(state, action)
{
  if(this.state != state)
  {
    this.state = state;

    if(this.type == "white")
      this.drawwhitekey();
    else
      this.drawblackkey();

    if(action)
      action(this.num, state);
  }
};

//---------------------------------------------------
// Function to draw a single black key
//---------------------------------------------------
pianokey.prototype.drawblackkey = function()
{
  var ctx = this.ctx;
  var c0 = 0;
  var c1 = 0.5 * Math.PI;
  var c2 = 1.0 * Math.PI;

  var y1 = 277;
  var y2 = 249;
  var y3 = 282;

  ctx.save();
  ctx.translate(this.xpos,this.ypos);

  if(this.state == 1)
  {
    ctx.fillStyle = "#484A47";
    ctx.beginPath();
    ctx.moveTo(46,0);
    ctx.arc(40, y1, 6, c0, c1, false);
    ctx.arc(8, y1, 6, c1, c2, false);
    ctx.lineTo(2,0);
    ctx.fill();

    y1 = 273;
    y2 = 264;
    y3 = 276;
  }

  //Body of the key
  ctx.lineWidth = 2;

  ctx.fillStyle = "#0D0F0C";
  ctx.strokeStyle = "#60625F";
  ctx.beginPath();
  ctx.moveTo(46,0);
  ctx.arc(40, y1, 6, c0, c1, false);
  ctx.arc(8, y1, 6, c1, c2, false);
  ctx.lineTo(2,0);
  ctx.fill();

  ctx.moveTo(2,0);
  ctx.lineTo(13,y2);
  ctx.lineTo(35,y2);
  ctx.lineTo(46,0);
  ctx.moveTo(13,y2);
  ctx.lineTo(4,y3);
  ctx.moveTo(35,y2);
  ctx.lineTo(44,y3);
  ctx.stroke();

  ctx.restore();
};

//---------------------------------------------------
// Funtion to draw a single white key
//
// Key numbers
// 1 - 7 for C,D,E,F,G,A,B with cutouts for black keys
// 0 for key without cutouts (Upper C on most keyboards)
//---------------------------------------------------
pianokey.prototype.drawwhitekey = function()
{
  var ctx = this.ctx;
  var i, l = 1;
  var cl = 0;
  var cr = 0;

  var x1 = 16;
  var x2 = 66;
  var y1 = 440;
  var y2 = 286;

  var x3 = 0, x4 = 0, xc1, xc2;

  var clr = 0x1E1E1E1;

  ctx.save();
  ctx.translate(this.xpos,this.ypos);

  if(this.state == 1)
  {

    ctx.fillStyle = "#A56241";
    ctx.fillRect(0, 420, 82, 40);

    y1 -= 4;
    l = 7;
    clr = 0x1BEBEBE;
  }

  //Body of the key
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#000000";
  ctx.fillStyle = "#F0F0F0";

  switch(this.id)
  {
    default:
    case 0:
      x3 = 82;
      break;

    case 1:
      x3 = 5;
    case 6:
      x3 += 48;
      cr = 1;
      break;

    case 10:
      x3 = 5;
      x4 = 5;
    case 3:
      x3 += 5;
      x4 += 5;
    case 8:
      x3 += 58;
      x4 += 14;
      cr = 1;
      cl = 1;
      break;

    case 12:
      x4 = 5;
    case 5:
      x3 = 82;
      x4 += 29;
      cl = 1;
      break;
  }

  this.createpath(x3, 72, 10, x4, 6, 6, y1, 280, cr, cl);
  ctx.fill();
  ctx.stroke();

  y1 -= 2;
  x3 -= 2;
  x4 += 2;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "#999999";
  this.createpath(x3, 70, 12, x4, 6, 6, y1, 282, cr, cl);
  ctx.stroke();

  y1 -= 2;
  x3 -= 2;
  x4 += 2;
  ctx.strokeStyle = "#B9B9B9";
  this.createpath(x3, 68, 14, x4, 6, 6, y1, 284, cr, cl);
  ctx.stroke();

  ctx.lineWidth = 2;

  x1 = 16;
  x2 = 66;
  x3 -= 2;
  x4 += 2;
  y1 -= 2;
  xc1 = 6;
  xc2 = 6;
  for(i=0;i<l;i++)
  {
    ctx.strokeStyle = "#" + clr.toString(16).slice(1,7);
    this.createpath(x3, x2, x1, x4, xc1, xc2, y1, 286, cr, cl);
    ctx.stroke();

    x1 += 1;
    x2 -= 1;
    xc1 -= 0.66;
    xc2 += 0.33;
    clr += 0x050505;
  }

  ctx.restore();
};

//---------------------------------------------------
// Function to create the drawing path of a white key
//---------------------------------------------------
pianokey.prototype.createpath = function(x1, x2, x3, x4, xc1, xc2, y1, y2, cr, cl)
{
  var ctx = this.ctx;
  var c0 = 0;
  var c1 = 0.5 * Math.PI;
  var c2 = 1.0 * Math.PI;
  var c3 = 1.5 * Math.PI;
  var c4 = 2.0 * Math.PI;
  var y3 = y2 + 10;

  ctx.beginPath();
  ctx.moveTo(x1,0);

  if(cr == 1)
  {
    ctx.arc(x1+xc1, y2, 6, c2, c1, true);
    ctx.arc(x2+xc2, y3, 4, c3, c4, false);
  }

  ctx.arc(x2, y1, 10, c0, c1, false);
  ctx.arc(x3, y1, 10, c1, c2, false);

  if(cl == 1)
  {
    ctx.arc(x3-xc2, y3, 4, c2, c3, false);
    ctx.arc(x4-xc1, y2, 6, c1, c0, true);
  }

  ctx.lineTo(x4,0);
};

//---------------------------------------------------
