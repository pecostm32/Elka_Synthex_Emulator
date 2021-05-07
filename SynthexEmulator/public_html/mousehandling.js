//-----------------------------------------------------------
// Functionality for handling mouse clicks and movement
//-----------------------------------------------------------
function mousehandling()
{
  this.ranges = new Array();

  this.currentrange = null;
}

//---------------------------------------------------------------------------------
// Handling is done based on range items
// For each object on the screen that needs handling a range item needs to be added
// To speed up searching regions can be defined with separate scan ranges
//---------------------------------------------------------------------------------
function range_item(left,right,top,bottom,type,action)
{
  this.left = left;
  this.right = right;
  this.top = top;
  this.bottom = bottom;

  switch(type)
  {
    case "scan":
      this.scan = action;
      break;

    case "down":
      this.down = action;
      break;

    case "up":
      this.up = action;
      break;

    case "move":
      this.move = action;
      break;

    case "over":
      this.over = action;
      break;

    case "out":
      this.out = action;
      break;
  }
}

//-----------------------------------------------------------
// Function to scale coordinates based on a given scaler
// and set them into a range item
//-----------------------------------------------------------
mousehandling.prototype.setrange = function(left, right, top, bottom, scaler, type, action)
{
  var i = this.ranges.length;

  var l = parseInt(left * scaler);
  var r = parseInt(right * scaler);
  var t = parseInt(top * scaler);
  var b = parseInt(bottom * scaler);

  this.ranges[i] = new range_item(l, r, t, b, type, action);

  return(this.ranges[i]);
};

//-----------------------------------------------------------
// Function to be coupled to div onmousedown call
//-----------------------------------------------------------
mousehandling.prototype.down = function(event)
{
  var range = this.currentrange;

  //Handle only left button actions
  if(event.button == 0)
  {
    //Check if there is an action for the down event
    if((typeof range.down !== "undefined") && (range.down != null))
    {
      //Handle the coupled action
      range.down(event);
    }
  }

  event.preventDefault();
};

//-----------------------------------------------------------
// Function to be coupled to div onmouseup call
//-----------------------------------------------------------
mousehandling.prototype.up = function(event)
{
  var range = this.currentrange;

  //Check if this up is for a previous found object
  if(range)
  {
    //Check if there is an action for the up event
    if((typeof range.up !== "undefined") && (range.up != null))
    {
      //Handle the coupled action
      range.up(event);
    }
  }

  event.preventDefault();
};

//-----------------------------------------------------------
// Function to be coupled to div onmousemove call
//-----------------------------------------------------------
mousehandling.prototype.move = function(event)
{
  //Scan the ranges from top level down to see if the mouse is on an object
  var range = this.scan(event, this.ranges);

  //Check if the found range not the current one
  if(range != this.currentrange)
  {
    //If so call the out function
    this.out(event);

    if((!((event.buttons) && this.currentrange) && range))
    {
      //When not handling any mousedown action or a mouseout action was set there is a new range
      this.currentrange = range;

      //So check if there is an action for the over event
      if((typeof range.over !== "undefined") && (range.over != null))
      {
        //Handle the coupled action
        range.over(event);
      }
    }
  }

  //Now handle the move for either the old or the new range
  range = this.currentrange;

  //Check if this move is for a previous found object
  if(range)
  {
    //Check if there is an action for the move event
    if((typeof range.move !== "undefined") && (range.move != null))
    {
      //Handle the coupled action
      range.move(event);
    }
  }

  event.preventDefault();
};

//-----------------------------------------------------------
// Function to be coupled to div onmouseout call
//-----------------------------------------------------------
mousehandling.prototype.out = function(event)
{
  var range = this.currentrange;

  //Check if this out is for a previous found object
  if(range)
  {
    //Check if there is an action for the move event
    if((typeof range.out !== "undefined") && (range.out != null))
    {
      //Clear the set range
      this.currentrange = null;

      //Handle the coupled action
      range.out(event);
    }
  }

  event.preventDefault();
};

//-----------------------------------------------------------
// This function is used to check if current mouse position
// is in range of one of the set ranges
//-----------------------------------------------------------
mousehandling.prototype.scan = function(event, ranges)
{
  var i;
  var range;
  var x = event.offsetX;
  var y = event.offsetY;

  for(i=0;i<ranges.length;i++)
  {
    range = ranges[i];

    if((x >= range.left) && (x <= range.right) && (y >= range.top) && (y <= range.bottom))
      break;
  }

  //Check if a range is found
  if(i<ranges.length)
  {
    //When a range is found check if it is a region or an object
    if((typeof range.scan !== "undefined") && (range.scan != null))
    {
      //For a region further scanning is needed
      range = range.scan(event);
    }
  }
  else
    range = null;

  return(range);
};
