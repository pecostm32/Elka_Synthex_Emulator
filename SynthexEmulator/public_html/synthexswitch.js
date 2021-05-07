//------------------------------------------------------------
// Functionality to draw a slide switch with 2 or 3 positions
//------------------------------------------------------------
function synthexswitch(ctx, xpos, ypos, type, state, style, caption, scaler, mouseranges)
{
  this.ctx = ctx;
  this.xpos = xpos;
  this.ypos = ypos;
  this.type = type;
  this.state = state;
  this.style = style;
  this.caption = caption;

  this.setup(scaler, mouseranges);
}

function synthexswitchstyle(fontcolor, fontsize, fontname)
{
  this.fontcolor = fontcolor;
  this.fontsize = fontsize;
  this.font = fontsize + "px " + fontname;
}

//---------------------------------------------------
// Function to setup everything for a single switch
//---------------------------------------------------
synthexswitch.prototype.setup = function(scaler, mouseranges)
{
  var obj = this;
  var ctx = this.ctx;
  var i = mouseranges.length;
  var h = this.type == 0 ? 56 : 74;
  var l = parseInt(this.xpos * scaler);
  var r = parseInt((this.xpos + 25) * scaler);
  this.t = parseInt(this.ypos * scaler);
  this.b = parseInt((this.ypos + h) * scaler);
  this.l = this.b - this.t;

  this.drawlegend();
  this.draw();

  mouseranges[i] = new range_item(l, r, this.t, this.b);

  mouseranges[i].down = function(event) { obj.down(event); };
  mouseranges[i].up = function(event) { obj.up(event); };

  this.mouse = mouseranges[i];
};

//------------------------------------------------------------------
// Function to handle the mouse down action
//------------------------------------------------------------------
synthexswitch.prototype.down = function(event)
{
  var obj = this;

  //Perform an initial move
  this.move(event);

  //Set the pointer for handling the moving
  this.mouse.move = function(event) { obj.move(event); };
};

//------------------------------------------------------------------
// Function to handle the mouse up action
//------------------------------------------------------------------
synthexswitch.prototype.up = function(event)
{
  //Draw final position
  this.move(event);

  //Stop the moving of the switch
  this.mouse.move = null;

  //Check if there is an action on this switch
  if((typeof this.action !== "undefined") && (this.action != null))
  {
    //Handle the coupled action
    this.action(this.state);
  }
};

//------------------------------------------------------------------
// Function to handle the mouse move action
//------------------------------------------------------------------
synthexswitch.prototype.move = function(event)
{
  var y1,y2,o;

  if(this.type == 0)
  {
    y1 = this.t + parseInt(this.l / 2);

    if(event.clientY < y1)
      this.state = 0;
    else
      this.state = 1;
  }
  else
  {
    o = parseInt(this.l / 3);
    y1 = this.t + o;
    y2 = this.b - o;

    if(event.clientY < y1)
      this.state = 0;
    else if(event.clientY < y2)
      this.state = 1;
    else
      this.state = 2;
  }

  this.draw();
};

//---------------------------------------------------
// Function to draw the switch legend
//---------------------------------------------------
synthexswitch.prototype.drawlegend = function()
{
  var ctx = this.ctx;
  var style = this.style;
  var t = this.caption.split("<;>");
  var h = 58;
  var i,x,y;

  ctx.fillStyle = style.fontcolor;
  ctx.font = style.font;

  if(this.type == 1)
    h = 74;

  for(i=0;i<t.length;i++)
  {
    if((this.type == 1) && (i == 1))
    {
      ctx.textAlign = "left";
      x = this.xpos + 32;
      y = this.ypos + 37 + (style.fontsize * 0.5);
    }
    else
    {
      ctx.textAlign = "center";
      x = this.xpos + 12.5;

      if(i == 0)
        y = this.ypos - (style.fontsize * 0.6);
      else
        y = this.ypos + h + style.fontsize;
    }

    ctx.fillText(t[i],x,y);
  }
};

//---------------------------------------------------
// Function to draw the actual switch
//---------------------------------------------------
synthexswitch.prototype.draw = function()
{
  var ctx = this.ctx;
  var i,a;
  var w = 25;
  var h = 56;
  var x = [ (w - 2), (w - 4), (w - 7) ];
  var y = [ 3, 7, 11, 33, 36 ];

  if(this.type == 1)
    h = 74;

  switch(this.state)
  {
    default:
    case 0:
      a = 0;
      break;

    case 1:
      a = 18;
      break;

    case 2:
      if(this.type == 1)
        a = 36;
      else
        a = 18;
      break;
  }

  for(i=0;i<y.length;i++)
    y[i] += a;

  ctx.save();
  ctx.translate(this.xpos,this.ypos);

  //Switch background
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);

  //Edge line
  ctx.lineWidth = 1;
  ctx.strokeStyle = "#FFFFFF";

  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.lineTo(0,h);
  ctx.lineTo(w,h);
  ctx.stroke();

  //Switch
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#252525";
  ctx.fillStyle = "#151515";
  ctx.beginPath();
  ctx.moveTo(-1,y[1]);
  ctx.lineTo(x[1],y[1]);
  ctx.lineTo(x[1],y[3]);
  ctx.lineTo(-1,y[3]);
  ctx.lineTo(-1,y[1]);

  ctx.moveTo(-1,y[1]);
  ctx.lineTo(3,y[0]);
  ctx.lineTo(x[0],y[0]);
  ctx.lineTo(x[1],y[1]);

  ctx.moveTo(-1,y[3]);
  ctx.lineTo(3,y[4]);
  ctx.lineTo(x[0],y[4]);
  ctx.lineTo(x[1],y[3]);
  ctx.moveTo(x[0],y[0]);
  ctx.lineTo(x[0],y[4]);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#353535";
  ctx.beginPath();
  ctx.moveTo(-1,y[1]);
  ctx.lineTo(3,y[0]);
  ctx.lineTo(x[0],y[0]);
  ctx.lineTo(x[1],y[1]);
  ctx.fill();
  ctx.stroke();


  ctx.lineWidth = 3;
  ctx.strokeStyle = "#090909";
  ctx.beginPath();

  for(i=0;i<4;i++)
  {
    ctx.moveTo(2,y[2]);
    ctx.lineTo(x[2],y[2]);

    y[2] += 6;
  }

  ctx.stroke();
  ctx.restore();
};

//---------------------------------------------------

