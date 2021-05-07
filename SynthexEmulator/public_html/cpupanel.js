//-----------------------------------------------------------
//
// For disassem scrolling the number of bytes per instruction are needed
// so need to get this from the cpu part
//
// this is easy for forward scrolling, backward is difficult
// need to make sure that there is no strange change in the code
//
//-----------------------------------------------------------
function CPUPANEL(divobj, canvas, mouse)
{
  this.fillcolor = "#A56241";
  this.strokecolor = "#000000";
  this.linewidth = 1;
  this.divobj = divobj;
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");

  //Range for moving the panel
  this.mouse = mouse.setrange(10, 520, 5, 65, 1);

  this.screenx;
  this.screeny;

  //Set the canvas to the needed dimensions
  canvas.width = 600;
  canvas.height = 500;

  //Set the div position info for moving it
  divobj.x = 20;
  divobj.y = 20;
  divobj.style.left = divobj.x + "px";
  divobj.style.top  = divobj.y + "px";

  var screen = this;

  this.mouse.down = function(event) { screen.movescreenstart(event); };
  this.mouse.up = function(event) { screen.movescreenstop(event); };
  this.mouse.over = function(event) { screen.cursormove(event); };
  this.mouse.out = function(event) { screen.cursordefault(event); };

  this.drawfrontpanel();

  this.mddisplay = new LCDisplay(this.ctx,50, 40, 1.5, 28, 21, "#000000");
  this.mmidisplay = new LCDisplay(this.ctx,50, 365, 1.5, 22, 4, "#000000");

  this.stackdisplay = new LCDisplay(this.ctx, 370, 40, 1.5, 16, 8, "#000000");
  this.zpdisplay = new LCDisplay(this.ctx, 370, 195, 1.5, 16, 8, "#000000");

  this.regdisplay = new LCDisplay(this.ctx, 370, 350, 1.5, 16, 2, "#000000");
  this.flagdisplay = new LCDisplay(this.ctx,370, 420, 1.5, 16, 2, "#000000");

  this.power = new Button(this.ctx, 543, 30, 18, 18, 5, mouse.ranges);

  this.mdup = new Button(this.ctx, 335, 165, 15, 15, 1, mouse.ranges);
  this.mddown = new Button(this.ctx, 335, 205, 15, 15, 2, mouse.ranges);

  this.stup = new Button(this.ctx, 545, 75, 15, 15, 1, mouse.ranges);
  this.stdown = new Button(this.ctx, 545, 115, 15, 15, 2, mouse.ranges);

  this.zpup = new Button(this.ctx, 545, 230, 15, 15, 1, mouse.ranges);
  this.zpdown = new Button(this.ctx, 545, 270, 15, 15, 2, mouse.ranges);

  this.mdtm = null;
  this.zptm = null;
  this.sttm = null;

  this.zpup.action = function(state)
  {
    if(state == 1)
    {
      screen.zeropageup();

      screen.zptm = setInterval(function() { screen.zeropageup(); }, 100);
    }
    else
      clearInterval(screen.zptm);
  };

  this.zpdown.action = function(state)
  {
    if(state == 1)
    {
      screen.zeropagedown();

      screen.zptm = setInterval(function() { screen.zeropagedown(); }, 100);
    }
    else
      clearInterval(screen.zptm);
  };

  this.stup.action = function(state)
  {
    if(state == 1)
    {
      screen.stackup();

      screen.sttm = setInterval(function() { screen.stackup(); }, 100);
    }
    else
      clearInterval(screen.sttm);
  };

  this.stdown.action = function(state)
  {
    if(state == 1)
    {
      screen.stackdown();

      screen.sttm = setInterval(function() { screen.stackdown(); }, 100);
    }
    else
      clearInterval(screen.sttm);
  };

  this.up = new Button(this.ctx, 305, 367, 15, 15, 1, mouse.ranges);
  this.down = new Button(this.ctx, 305, 417, 15, 15, 2, mouse.ranges);
  this.left = new Button(this.ctx, 280, 392, 15, 15, 3, mouse.ranges);
  this.right = new Button(this.ctx, 330, 392, 15, 15, 4, mouse.ranges);
  this.go = new Button(this.ctx, 305, 392, 15, 15, 0, mouse.ranges);

  this.mode = new Button(this.ctx, 100, 445, 15, 15, 0, mouse.ranges);
  this.func = new Button(this.ctx, 200, 445, 15, 15, 0, mouse.ranges);

  this.regdisplay.displaytext(0,0,"A  X  Y  S  PC");
  this.regdisplay.displaytext(0,1,"00 00 00 00 0000");

  this.flagdisplay.displaytext(0,0,"N V   B D I Z C");
  this.flagdisplay.displaytext(0,1,"0 0   0 0 0 0 0");

  this.zpidx = 0;  //Index into zero page to set starting point for displaying the zero page data
  this.stidx = 0;  //Index into stack page to set starting point for displaying the stack page data
  this.mdidx = 0xE9D1;

  this.mdm = 1; //Memory / Disassembly Mode
}

//-----------------------------------------------------------
//-----------------------------------------------------------
CPUPANEL.prototype.update = function(cpu)
{
  var i,j,n,s,d,c;
  var o = new Disasm_item();

  s = (cpu.a + 0x100).toString(16).slice(-2) + " ";
  s += (cpu.x + 0x100).toString(16).slice(-2) + " ";
  s += (cpu.y + 0x100).toString(16).slice(-2) + " ";
  s += (cpu.s + 0x100).toString(16).slice(-2) + " ";
  s += (cpu.pc + 0x10000).toString(16).slice(-4);
  s = s.toUpperCase();
  this.regdisplay.displaytext(0,1,s);

  s = cpu.n + " " + cpu.v + "   " + cpu.b + " " + cpu.d + " " + cpu.i + " " + cpu.z + " " + cpu.c;
  this.flagdisplay.displaytext(0,1,s);

  for(i=0,j=this.zpidx;i<8;i++,j++)
  {
    j &= 0xFF;
    d = cpu.mem[j];
    s = (j + 0x10000).toString(16).slice(-4).toUpperCase() + ": 0x";
    s += (d + 0x100).toString(16).slice(-2).toUpperCase() + " ";
    s += (d + 1000).toString().slice(-3) + " ";
    s += String.fromCharCode(d);

    this.zpdisplay.displaytext(0,i,s);
  }

  for(i=0,j=this.stidx;i<8;i++,j++)
  {
    j = (j & 0xFF) + 0x100;
    d = cpu.mem[j];
    s = (j + 0x10000).toString(16).slice(-4).toUpperCase() + ": 0x";
    s += (d + 0x100).toString(16).slice(-2).toUpperCase() + " ";
    s += (d + 1000).toString().slice(-3) + " ";
    s += String.fromCharCode(d);

    this.stackdisplay.displaytext(0,i,s);
  }

  if(this.mdm == 0)
  {
    for(i=0,j=this.mdidx;i<21;i++)
    {
      j &= 0xFFFF;
      s = "0x" + (j + 0x10000).toString(16).slice(-4).toUpperCase() + ": ";
      c = "    ";

      for(n=0;n<4;n++)
      {
        d = cpu.mem[j++];
        j &= 0xFFFF;

        s += (d + 0x100).toString(16).slice(-2).toUpperCase() + " ";
        c += String.fromCharCode(d);
      }

      s += c;

      this.mddisplay.displaytext(0,i,s);
    }
  }
  else
  {
    for(i=0,o.address=this.mdidx;i<21;i++)
    {
      cpu.disassemble(o);

      s = (o.string + "                     ").slice(0,21);

      this.mddisplay.displaytext(0,i,s);
    }
  }

};

//-----------------------------------------------------------
//-----------------------------------------------------------
CPUPANEL.prototype.cursormove = function(event)
{
  this.divobj.style.cursor = "move";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
CPUPANEL.prototype.cursorpointer = function(event)
{
  this.divobj.style.cursor = "pointer";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
CPUPANEL.prototype.cursordefault = function(event)
{
  this.divobj.style.cursor = "default";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
CPUPANEL.prototype.movescreenstart = function(event)
{
  var screen = this;

  this.screenx = event.clientX - this.divobj.x;
  this.screeny = event.clientY - this.divobj.y;

  this.mouse.move = function(event) { screen.movescreen(event); };
};

//-----------------------------------------------------------
//-----------------------------------------------------------
CPUPANEL.prototype.movescreenstop = function(event)
{
  this.mouse.move = null;
};

//-----------------------------------------------------------
//-----------------------------------------------------------
CPUPANEL.prototype.movescreen = function(event)
{
  this.divobj.x = event.clientX - this.screenx;
  this.divobj.y = event.clientY - this.screeny;
  this.divobj.style.left = this.divobj.x + "px";
  this.divobj.style.top  = this.divobj.y + "px";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
CPUPANEL.prototype.hidescreen = function()
{
  this.divobj.style.visibility="hidden";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
CPUPANEL.prototype.showscreen = function()
{
  this.power.drawbutton(0);
  this.divobj.style.visibility="visible";
};

//-----------------------------------------------------------
//-----------------------------------------------------------
CPUPANEL.prototype.zeropageup = function()
{
  this.zpidx -= 1;

  if(this.zpidx < 0)
    this.zpidx = 0xFF;
};

//-----------------------------------------------------------
//-----------------------------------------------------------
CPUPANEL.prototype.zeropagedown = function()
{
  this.zpidx += 1;

  if(this.zpidx > 0xFF)
    this.zpidx = 0;
};

//-----------------------------------------------------------
//-----------------------------------------------------------
CPUPANEL.prototype.stackup = function()
{
  this.stidx -= 1;

  if(this.stidx < 0)
    this.stidx = 0xFF;
};

//-----------------------------------------------------------
//-----------------------------------------------------------
CPUPANEL.prototype.stackdown = function()
{
  this.stidx += 1;

  if(this.stidx > 0xFF)
    this.stidx = 0;
};

//-----------------------------------------------------------
//-----------------------------------------------------------
CPUPANEL.prototype.drawfrontpanel = function()
{
  var ctx = this.ctx;

  ctx.save();

  //Transparent shade bit at the bottom of the panel
  ctx.fillStyle = "rgba(0,0,0,0.95)";
  ctx.fillRect(12,480,576,20);

  //Wooden parts
  this.drawroundedrect(24, 500, 8, 0, 0);
  this.drawroundedrect(24, 500, 8, 576, 0);

  //Metal part
  ctx.fillStyle = "#414244";
  ctx.strokeStyle = "#000000";
  ctx.fillRect(24,10,552,480);
  ctx.strokeRect(24,10,552,480);

  //Text part
  ctx.fillStyle = "#F5F9FC";

  ctx.textAlign = "center";
  ctx.font = "Bold 14px Arial";

  ctx.fillText("Memory / Disassembly",182,32);
  ctx.fillText("Stack page",448,32);
  ctx.fillText("Zero page",448,187);
  ctx.fillText("Registers",448,342);
  ctx.fillText("Flags",448,412);

  ctx.font = "Bold 12px Arial";
  ctx.fillText("Scroll",340,196);
  ctx.fillText("Scroll",550,106);
  ctx.fillText("Scroll",550,261);

  ctx.fillText("Select / OK",312,451);
  ctx.fillText("Mode",107,477);
  ctx.fillText("Function",207,477);

  ctx.restore();
};

//-----------------------------------------------------------
//-----------------------------------------------------------
CPUPANEL.prototype.drawroundedrect = function (width, height, radius, xpos, ypos)
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
