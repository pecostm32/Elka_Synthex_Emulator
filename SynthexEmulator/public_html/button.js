//===============================================================================
function Button(ctx, xpos, ypos, width, height, style, mouseranges)
{
  this.ctx = ctx;
  this.xpos = xpos;
  this.ypos = ypos;
  this.width = width;
  this.height = height;
  this.style = style;

  this.r1 = width / 7;
  this.r2 = this.r1 + 3;

  switch(this.style)
  {
    case 0: //Rounded rect
      this.x1 = xpos + this.r1;
      this.x2 = xpos + width - this.r1;

      this.y1 = ypos + this.r1;
      this.y2 = ypos + height - this.r1;

      this.arc1 = 1.0 * Math.PI;
      this.arc2 = 1.5 * Math.PI;
      this.arc3 = 2.0 * Math.PI;
      this.arc4 = 0.5 * Math.PI;
      break;

    case 1: //Arrow up
      this.x1 = xpos + this.r1;
      this.y1 = ypos + width - this.r1;

      this.x2 = xpos + (width / 2);
      this.y2 = ypos + this.r1;

      this.x3 = xpos + width - this.r1;
      this.y3 = this.y1;

      this.arc1 = 0.5 * Math.PI;
      this.arc2 = 1.1666 * Math.PI;
      this.arc3 = 1.8333 * Math.PI;
      break;

    case 2: //Arrow down
      this.x1 = xpos + this.r1;
      this.y1 = ypos + this.r1;

      this.x2 = xpos + width - this.r1;
      this.y2 = this.y1;

      this.x3 = xpos + (width / 2);
      this.y3 = ypos + width - this.r1;

      this.arc1 = 0.8333 * Math.PI;
      this.arc2 = 1.5 * Math.PI;
      this.arc3 = 0.1666 * Math.PI;
      break;

    case 3: //Arrow left
      this.x1 = xpos + width - this.r1;
      this.y1 = ypos + this.r1;

      this.x2 = this.x1;
      this.y2 = ypos + width - this.r1;

      this.x3 = xpos + this.r1;
      this.y3 = ypos + (width / 2);

      this.arc1 = 1.3333 * Math.PI;
      this.arc2 = 2.0 * Math.PI;
      this.arc3 = 0.6666 * Math.PI;
      break;

    case 4: //Arrow right
      this.x1 = xpos + this.r1;
      this.y1 = ypos + this.r1;

      this.x2 = xpos + width - this.r1;
      this.y2 = ypos + (width / 2);

      this.x3 = this.x1;
      this.y3 = ypos + width - this.r1;

      this.arc1 = 1.0 * Math.PI;
      this.arc2 = 1.6666 * Math.PI;
      this.arc3 = 0.3333 * Math.PI;
      break;

    case 5: //Power switch
      this.r1 = width / 2;
      this.r2 = this.r1 / 1.6;

      this.x1 = xpos + this.r1;
      this.y1 = ypos + this.r1;

      this.y2 = ypos + (this.r1 * 0.2);
      this.y3 = ypos + (this.r1 * 0.85);

      this.arc1 = 0;
      this.arc2 = 2 * Math.PI;
      this.arc3 = 1.6666 * Math.PI;
      this.arc4 = 1.3333 * Math.PI;
      break;
  }

  var i = mouseranges.length;
  var button = this;

  this.x = xpos - 4;
  this.y = ypos - 4;
  this.w = width + 6;
  this.h = height + 6;

  mouseranges[i] = new range_item(this.x, this.x + this.w, this.y, this.y + this.h);

  mouseranges[i].down = function(event) { button.down(); };
  mouseranges[i].up = function(event) { button.up(); };

  this.drawbutton(0);
}

//-----------------------------------------------------------
//-----------------------------------------------------------
Button.prototype.down = function()
{
  this.drawbutton(1);

  //Check if there is an action on this button
  if((typeof this.action !== "undefined") && (this.action != null))
  {
    //Handle the coupled action
    this.action(1);
  }
};

//-----------------------------------------------------------
//-----------------------------------------------------------
Button.prototype.up = function()
{
  this.drawbutton(0);

  //Check if there is an action on this button
  if((typeof this.action !== "undefined") && (this.action != null))
  {
    //Handle the coupled action
    this.action(0);
  }
};

//-----------------------------------------------------------
//-----------------------------------------------------------
Button.prototype.drawbutton = function(state)
{
  var ctx = this.ctx;

  ctx.fillStyle = "#414244";
  ctx.fillRect(this.x,this.y,this.w,this.h);

  switch(this.style)
  {
    case 0: //Rounded rect
      this.drawroundedrect(state);
      break;

    case 1: //Arrow up
      this.drawarrow(state);
      break;

    case 2: //Arrow down
      this.drawarrow(state);
      break;

    case 3: //Arrow left
      this.drawarrow(state);
      break;

    case 4: //Arrow right
      this.drawarrow(state);
      break;

    case 5: //Power switch
      this.drawpowerswitch(state);
      break;
  }
};

//-----------------------------------------------------------
//-----------------------------------------------------------
Button.prototype.drawroundedrect = function(state)
{
  var ctx = this.ctx;

  ctx.fillStyle = "#202020";

  ctx.beginPath();
  ctx.arc(this.x1, this.y1, this.r2, this.arc1, this.arc2, false);
  ctx.arc(this.x2, this.y1, this.r2, this.arc2, this.arc3, false);
  ctx.arc(this.x2, this.y2, this.r2, this.arc3, this.arc4, false);
  ctx.arc(this.x1, this.y2, this.r2, this.arc4, this.arc1, false);
  ctx.closePath();

  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#C8B393";
  ctx.fillStyle = "#DBCDB9";

  ctx.beginPath();
  ctx.arc(this.x1, this.y1, this.r1, this.arc1, this.arc2, false);
  ctx.arc(this.x2, this.y1, this.r1, this.arc2, this.arc3, false);
  ctx.arc(this.x2, this.y2, this.r1, this.arc3, this.arc4, false);
  ctx.arc(this.x1, this.y2, this.r1, this.arc4, this.arc1, false);
  ctx.closePath();

  ctx.stroke();
  ctx.fill();

  if(state == 0)
  {
    var x1 = this.x1 - 2;
    var x2 = this.x2 - 2;
    var y1 = this.y1 - 1;
    var y2 = this.y2 - 1;

    ctx.strokeStyle = "#C8B393";
    ctx.fillStyle = "#E3D9CA";

    ctx.beginPath();
    ctx.arc(x1, y1, this.r1, this.arc1, this.arc2, false);
    ctx.arc(x2, y1, this.r1, this.arc2, this.arc3, false);
    ctx.arc(x2, y2, this.r1, this.arc3, this.arc4, false);
    ctx.arc(x1, y2, this.r1, this.arc4, this.arc1, false);
    ctx.closePath();

    ctx.stroke();
    ctx.fill();
  }
};

//-----------------------------------------------------------
//-----------------------------------------------------------
Button.prototype.drawarrow = function(state)
{
  var ctx = this.ctx;

  ctx.fillStyle = "#202020";

  ctx.beginPath();
  ctx.arc(this.x1, this.y1, this.r2, this.arc1, this.arc2, false);
  ctx.arc(this.x2, this.y2, this.r2, this.arc2, this.arc3, false);
  ctx.arc(this.x3, this.y3, this.r2, this.arc3, this.arc1, false);
  ctx.closePath();

  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#C8B393";
  ctx.fillStyle = "#DBCDB9";

  ctx.beginPath();
  ctx.arc(this.x1, this.y1, this.r1, this.arc1, this.arc2, false);
  ctx.arc(this.x2, this.y2, this.r1, this.arc2, this.arc3, false);
  ctx.arc(this.x3, this.y3, this.r1, this.arc3, this.arc1, false);
  ctx.closePath();

  ctx.stroke();
  ctx.fill();

  if(state == 0)
  {
    ctx.strokeStyle = "#C8B393";
    ctx.fillStyle = "#E3D9CA";

    ctx.beginPath();
    ctx.arc(this.x1 - 2, this.y1 - 1, this.r1, this.arc1, this.arc2, false);
    ctx.arc(this.x2 - 2, this.y2 - 1, this.r1, this.arc2, this.arc3, false);
    ctx.arc(this.x3 - 2, this.y3 - 1, this.r1, this.arc3, this.arc1, false);
    ctx.closePath();

    ctx.stroke();
    ctx.fill();
  }
};

//-----------------------------------------------------------
//-----------------------------------------------------------
Button.prototype.drawpowerswitch = function(state)
{
  var ctx = this.ctx;
  var x1 = this.x1;
  var y1 = this.y1;
  var y2 = this.y2;
  var y3 = this.y3;

  ctx.fillStyle = "#202020";

  ctx.beginPath();
  ctx.arc(x1, y1, this.r1 + 3, this.arc1, this.arc2, false);
  ctx.closePath();

  ctx.fill();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#C8B393";
  ctx.fillStyle = "#DBCDB9";

  ctx.beginPath();
  ctx.arc(x1, y1, this.r1, this.arc1, this.arc2, false);
  ctx.closePath();

  ctx.stroke();
  ctx.fill();

  if(state == 0)
  {
    x1 -= 2;
    y1 -= 1;
    y2 -= 1;
    y3 -= 1;

    ctx.strokeStyle = "#C8B393";
    ctx.fillStyle = "#E3D9CA";

    ctx.beginPath();
    ctx.arc(x1, y1, this.r1, this.arc1, this.arc2, false);
    ctx.closePath();

    ctx.stroke();
    ctx.fill();

    ctx.strokeStyle = "#78C800";  //Green indicating power on
  }
  else
    ctx.strokeStyle = "#303030";  //Dark indicating power off

    ctx.beginPath();
    ctx.arc(x1, y1, this.r2, this.arc3, this.arc4, false);
    ctx.moveTo(x1,y2);
    ctx.lineTo(x1,y3);

    ctx.stroke();
};

//===============================================================================

