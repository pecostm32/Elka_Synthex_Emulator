//================================================================================
// Elka Synthex hardware setup
//================================================================================
function SynthexHardware()
{
  this.handlehardware = null; //Function pointer for hardware handling functions

  this.voicecardid = 0; //Id of the currently selected voice card

  this.peripheraladdress = 0; //Address of the currently selected peripheral

  this.synthex5800data = []; //Data for the four 5800 boards
  this.synthex5800data[0] = new Synthex5800();
  this.synthex5800data[1] = new Synthex5800();
  this.synthex5800data[2] = new Synthex5800();
  this.synthex5800data[3] = new Synthex5800();
  this.synthex581Xdata = new Synthex581X(); //Data for the 581X boards
  this.synthex5831data = new Synthex5831(); //Data for the 5831 board
  this.synthex5850data = new Synthex5850(); //Data for the 5850 board
  this.synthex5870data = new Synthex5870(); //Data for the 5870 board
  this.synthex5890data = new Synthex5890(); //Data for the 5890 board

  //Variables for non CPU controled knobs
  this.mastervolume = 0;
  this.mastervolumechange = 0;
  this.masterbalance = 0;
  this.masterbalancechange = 0;
  this.mastertune = 0;
  this.mastertunechange = 0;
  this.outputmode = 0;

  this.systeminit = true; //Flag to signal system is in initialisation phase
  this.analogupdate = false;  //Flag to signal updating analog display is needed

  this.digitalupdate = false;  //Flag to signal digital data needs to be updated
  this.digitaldata = 0;    //Digital data to display
  this.digitaladdress = 0; //Address of the data to be updated

  this.updateleds = null;    //Function pointers for
  this.updateknobs = null;   //panel control updates
  this.updatedigital = null;
  this.updateanalog = null;

  this.tapecycledata = 0; //Input and output to / from CPU are set here
  this.tapewavedata = 0;  //Data to / from wave file is set here

  this.adsrcounter = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]]; //Counters for ADSR timing
  this.adsrstate = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];   //State of the ADSR's

  //Table with cpu cycle count values for the different ADSR settings
  this.synthexadsrcounts = [3102,6204,14520,29040,36960,73920,99000,198000,257400,514800,660000,1320000,1782000,3564000,6600000,13200000];

  this.seqoscsignal = 0;     //Variables for running the
  this.seqoscincrement = 0;  //sequencer oscillator
  this.seqgatethreshold = 0; //and gate comparator
  this.seqgatetriggered = 0; //Variable to make single shot clock pulse for gate flipflop

  this.glideuppersignal = 0;    //Variables for running the
  this.glideupperincrement = 0; //glide oscillators
  this.glideuppercounter = 0;
  this.glideupperdivider = 0;
  this.glidelowersignal = 0;
  this.glidelowerincrement = 0;
  this.glidelowercounter = 0;
  this.glidelowerdivider = 0;

  //MIDI window update flags
  this.mididatachanged = 0; //Flag to signal that some midi data has changed
  this.midibytesend = 0;    //Flag to signal a byte has been send
};

//------------------------------------------------------------------------------------------------------------------------------
//Check the Synthex hardware function
SynthexHardware.prototype.check = function(cpu)
{
  var synthex = cpu.pdata;

  //Check if no peripheral hardware addressed
  if((cpu.address < 0x0C00) || (cpu.address > 0x1FFF))
  {
    //Signal no peripheral board selected
    synthex.handlehardware = null;

    //Check if ROM is being addressed and set to read only if so
    if(cpu.address >= 0xD000)
      cpu.mam = 1;
  }
  else
  {
    var synthex5870 = synthex.synthex5870data;

    //Set function pointer for handling 5870 board
    synthex.handlehardware = synthex5870.handle;

    //Process address decoder 5870 IC 2F
    switch(cpu.address & 0xFC00)
    {
      case 0x0C00:
        //Process address decoder 5870 IC 2E
        switch(cpu.address & 0xFE00)
        {
          case 0x0C00:
            synthex.synthex581Xdata.check(cpu);
            break;

          case 0x0E00:
            synthex.synthex5831data.check(cpu);
            break;
        }
        break;

      case 0x1000:
        //Check if 5850 board selected
        if((cpu.address & 0xFE00) == 0x1000)
        {
          var synthex5850 = synthex.synthex5850data;

          //Set function pointer for handling 5850 board
          synthex.handlehardware = synthex5850.handle;

          //All actions on 5850 board are write only
          cpu.mam = 2;

          //Set the possible peripheral address
          synthex.peripheraladdress = cpu.address & 0xFE70;

          //Process address decoder 5850 IC 5B
          switch(synthex.peripheraladdress)
          {
            case 0x1000:
              //Set R3 buffer as destination
              cpu.write = function(cpu, data) { cpu.data = data; synthex5850.register3 = data; };
              break;

            case 0x1010:
              //Set R4 buffer as destination
              cpu.write = function(cpu, data) { cpu.data = data; synthex5850.register4 = data; };
              break;

            case 0x1020:
              //Set R1 buffer as destination
              cpu.write = function(cpu, data) { cpu.data = data; synthex5850.register1 = data; };
              break;

            case 0x1030:
              //Set R5 buffer as destination
              cpu.write = function(cpu, data) { cpu.data = data; synthex5850.register5 = data; };
              break;

            case 0x1040:
              //Set R6 buffer as destination
              cpu.write = function(cpu, data) { cpu.data = data; synthex5850.register6 = data; };
              break;

            case 0x1050:
              //Set sync upper buffer as destination
              cpu.write = function(cpu, data) { cpu.data = data; synthex5850.SyncUpper = data; };
              break;

            case 0x1060:
              //Set R2 buffer as destination
              cpu.write = function(cpu, data) { cpu.data = data; synthex5850.register2 = data; };
              break;

            case 0x1070:
              //Set sync lower buffer as destination
              cpu.write = function(cpu, data) { cpu.data = data; synthex5850.SyncLower = data; };
              break;
           }
        }
        else
        {
          //Process address decoder 5870 IC 4E
          switch(cpu.address & 0xFE06)
          {
            case 0x1200:
              synthex.synthex5800data[0].check(cpu, 0);
              break;

            case 0x1202:
              synthex.synthex5800data[1].check(cpu, 1);
              break;

            case 0x1204:
              synthex.synthex5800data[2].check(cpu, 2);
              break;

            case 0x1206:
              synthex.synthex5800data[3].check(cpu, 3);
              break;
          }
        }
        break;

      case 0x1400:
        //All actions on 5870 board T2 signal are write only
        cpu.mam = 2;

        //Set the possible peripheral address
        synthex.peripheraladdress = cpu.address & 0xFFE0;

        //Process address decoder 5870 IC 4F
        switch(synthex.peripheraladdress)
        {
          case 0x14E0:
            //Set digital to analog converter control 1 as destination
            cpu.write = function(cpu, data) { cpu.data = data; synthex5870.dacctrl1 = data; };
            break;

          case 0x1460:
            //Set digital to analog converter control 2 as destination
            cpu.write = function(cpu, data) { cpu.data = data; synthex5870.dacctrl2 = data; };
            break;

          case 0x1560:
            //Set upper glide interrupt reset as destination
            cpu.write = function(cpu, data) { cpu.data = data; synthex5870.glideresetupper = data; };
            break;

          case 0x15E0:
            //Set lower glide interrupt reset as destination
            cpu.write = function(cpu, data) { cpu.data = data; synthex5870.glideresetlower = data; };
            break;

          case 0x1660:
            //Set sample and hold select as destination
            cpu.write = function(cpu, data) { cpu.data = data; synthex5870.shselect = data; };
            break;

          case 0x16E0:
            //Set chorus control as destination
            cpu.write = function(cpu, data) { cpu.data = data; synthex5870.chorusctrl = data; };
            break;

          case 0x1760:
            //Set oscillator control as destination
            cpu.write = function(cpu, data) { cpu.data = data; synthex5870.oscillatorctrl = data; };
            break;

          case 0x17E0:
            //Set CPU reset as destination
            //Is used as refresh for a watchdog timer. Not implemented here.
            cpu.write = function(cpu, data) { cpu.data = data; synthex5870.cpureset = data; };
            break;
        }
        break;

      case 0x1800:
        //Set the possible peripheral address
        synthex.peripheraladdress = cpu.address & 0xFFE0;

        //These addresses are read only
        cpu.mam = 1;
        cpu.write = null;

        //Process address decoder 5870 IC 4F
        switch(synthex.peripheraladdress)
        {
          case 0x1A80:
            //Pulse enable of battery backed up RAM
            //Has no use here
            break;

          case 0x1AE0:
            //Set analog to digital signal as source
            cpu.data = synthex5870.adcsignal;
            break;
        }
        break;

      case 0x1C00:
        //Set the peripheral address
        synthex.peripheraladdress = 0x1C00;

        //Set glide interrupt readback as source
        cpu.mam = 1;
        cpu.data = synthex5870.glidereadback;
        cpu.write = null;
        break;
    }
  }
};

//------------------------------------------------------------------------------------------------------------------------------
//Handle the Synthex hardware function
SynthexHardware.prototype.handle = function(cpu)
{
  var synthex = cpu.pdata;
  var synthex581X = synthex.synthex581Xdata;
  var synthex5890 = synthex.synthex5890data;
  var uk = false;
  var vcid,pb,pm,md,st,i;

  //Check if hardware has been addressed and process if so
  if(synthex.handlehardware)
    synthex.handlehardware(cpu);

  //After handling a peripheral clear the function pointer to avoid double handling on next instruction
  synthex.handlehardware = null;

  //Check if digital outputs screen needs updating
  if(synthex.digitalupdate == true)
  {
    synthex.digitalupdate = false;

    if(synthex.updatedigital)
      synthex.updatedigital(synthex);
  }

  //Check if analog outputs screen needs updating
  if(synthex.analogupdate == true)
  {
    synthex.analogupdate = false;

    if(synthex.updateanalog)
      synthex.updateanalog(synthex);
  }

  //Check if a sound patch has been loaded. Not actual hardware but needed to update the knobs
  if((cpu.pc == 0xE0EE) && ((cpu.x == 0x00) || (cpu.x == 0x3C)))
  {
    //Signal updating
    uk = true;

    //Select the data set to display (upper or lower)
    if(cpu.x == 0x3C)
      pb = 0x74;
    else
      pb = 0x38;
  }

  //Get the current selected play mode (split or double) and the selected set (upper or lower)
  md = synthex581X.modeleds & 0x0C;
  st = synthex581X.modeleds & 0x03;
  pm = synthex581X.casleds & 0x04;

  //Check if switched between sets (upper or lower)
  if((st != synthex581X.prevset) && (st != 0x03))
  {
    //Save new set for next check and signal updating
    synthex581X.prevset = st;
    uk = true;

    //Select the data set to display (upper or lower)
    if(st == 0x02)
      pb = 0x74;
    else
      pb = 0x38;
  }

  //Check if split or double switched off
  if(md != synthex581X.prevmode)
  {
    //Save mode for next check
    synthex581X.prevmode = md;

    if(md == 0x0C)
    {
      uk = true;

      //When switching back to normal mode use the upper set
      pb = 0x74;
    }
  }

  //Check if switched to panel mode
  if(pm != synthex581X.prevpgm)
  {
    //Save mode for next check
    synthex581X.prevpgm = pm;

    if(pm != 0x04)
    {
      uk = true;

      //When switching back to panel mode use check if lower set in use
      if(st == 0x01)
        pb = 0x38;
      else
        pb = 0x74;
    }
  }

  //Check if update needed and there is a function to call
  if((uk == true) && (synthex.updateknobs))
  {
    //On system init use the upper patch
    if(synthex.systeminit == true)
    {
      synthex.systeminit = false;
      pb = 0x74;
    }

    for(i=0;i<26;i++)
      synthex.updateknobs(i, cpu.mem[pb++]);
  }

  //Update the output mode
//  SynthexSetOutputMode((synthex.outputmode & 0x01) == 0x01);

  //Detect change in master volume
  if(synthex.mastervolume != synthex.mastervolumechange)
  {
    synthex.mastervolumechange = synthex.mastervolume;
//    SynthexSetMasterVolume(synthex.mastervolume, synthex.masterbalance);
  }

  //Detect change in master balance
  if(synthex.masterbalance != synthex.masterbalancechange)
  {
    synthex.masterbalancechange = synthex.masterbalance;
//    SynthexSetMasterVolume(synthex.mastervolume, synthex.masterbalance);
  }

  //Detect change in master tune
  if(synthex.mastertune != synthex.mastertunechange)
  {
    synthex.mastertunechange = synthex.mastertune;
//    SynthexSetMasterTune(synthex.mastertune);
  }

  //ADSR feedback part
  {
    //Process the 4 voice cards
    for(vcid=0;vcid<4;vcid++)
    {
      //Process the first filter envelope
      if(synthex.processadsr(vcid, 0, synthex.synthex5800data[vcid].fltenv1, cpu.cycles) == true)
         synthex.synthex5800data[vcid].envcmp &= 0x7F;
      else
         synthex.synthex5800data[vcid].envcmp |= 0x80;

      //Process the first amplifier envelope
      if(synthex.processadsr(vcid, 1, synthex.synthex5800data[vcid].ampenv1, cpu.cycles) == true)
         synthex.synthex5800data[vcid].envcmp &= 0xBF;
      else
         synthex.synthex5800data[vcid].envcmp |= 0x40;

      //Process the second filter envelope
      if(synthex.processadsr(vcid, 2, synthex.synthex5800data[vcid].fltenv2, cpu.cycles) == true)
         synthex.synthex5800data[vcid].envcmp &= 0xDF;
      else
         synthex.synthex5800data[vcid].envcmp |= 0x20;

      //Process the second amplifier envelope
      if(synthex.processadsr(vcid, 3, synthex.synthex5800data[vcid].ampenv2, cpu.cycles) == true)
         synthex.synthex5800data[vcid].envcmp &= 0xEF;
      else
         synthex.synthex5800data[vcid].envcmp |= 0x10;
    }
  }

  //Glide and portamento oscillators part
  //Increment the upper signal with the needed amount for the set frequency
  synthex.glideuppersignal += (synthex.glideupperincrement * cpu.cycles);

  //Keep it in allowed range
  if(synthex.glideuppersignal > 256)
  {
    //By subtracting the max there is no error in frequency
    synthex.glideuppersignal -= 256;

    //Divide the signal
    if(--synthex.glideuppercounter <= 0)
    {
      //Reset the counter
      synthex.glideuppercounter = synthex.glideupperdivider;

      //Signal end of period interrupt
      synthex.synthex5870data.glidereadback &= 0x7F;

      //Interrupt the CPU
      cpu.irq = true;
    }
  }

  //Increment the lower signal with the needed amount for the set frequency
  synthex.glidelowersignal += (synthex.glidelowerincrement * cpu.cycles);

  //Keep it in allowed range
  if(synthex.glidelowersignal > 256)
  {
    //By subtracting the max there is no error in frequency
    synthex.glidelowersignal -= 256;

    //Divide the signal
    if(--synthex.glidelowercounter <= 0)
    {
      //Reset the counter
      synthex.glidelowercounter = synthex.glidelowerdivider;

      //Signal end of period interrupt
      synthex.synthex5870data.glidereadback &= 0xBF;

      //Interrupt the CPU
      cpu.irq = true;
    }
  }

  //Sequencer oscillator part
  //Check if CPU allows oscillator to run
  if((synthex.synthex5831data.extwrite2 & 0x80) == 0x80)
  {
    //Increment the signal with the needed amount for the set frequency
    synthex.seqoscsignal += (synthex.seqoscincrement * cpu.cycles);

    //Keep it in allowed range
    if(synthex.seqoscsignal > 256)
    {
      //By subtracting the max there is no error in frequency
      synthex.seqoscsignal -= 256;

      //At the end of a full period the gate can be triggered again
      synthex.seqgatetriggered = false;

      //Signal end of period interrupt
      synthex.synthex5831data.extread1 |= 0x20;

      //When no longer above threshold signal the CPU of such
      synthex.synthex5831data.extread3 |= 0x80;

      //Interrupt the CPU
      cpu.irq = true;
    }

    //Check if gate activated
    if(synthex.seqoscsignal > synthex.seqgatethreshold)
    {
      //Check if not already triggered
      if(synthex.seqgatetriggered == false)
      {
        //Make it single shot triggering
        synthex.seqgatetriggered = true;

        //Signal CPU the state of the gate and interrupt signal
        synthex.synthex5831data.extread1 |= 0x20;
        synthex.synthex5831data.extread3 &= 0x7F;

        //Interrupt the CPU
        cpu.irq = true;
      }
    }
  }
  else
  {
    //Reset the oscillator to sync it
    synthex.seqoscsignal = 0;
  }

  //Midi handling part
  //Handle transmitting only when busy with transmitting
  if(synthex5890.miditransmittingflag == true)
  {
     //Process transmit clock
     synthex5890.miditransmitclock -= cpu.cycles;
     if(synthex5890.miditransmitclock <= 0)
     {
        //Set transmit interrupt when interrupt enabled
        if((synthex5890.midicontrol & 0x60) == 0x20)
        {
           synthex5890.midistatus |= 0x80;

           //Signal byte send via NMI
           cpu.nmi = true;
        }

        //Signal data has changed and byte was send
        synthex.mididatachanged = true;
        synthex.midibytesend = true;

        //Check if more to send. Clear the transmitting flag when not
        if((synthex5890.midistatus &= 0x02) == 0x00)
        {
           //Load the shifter with the next byte
           synthex5890.miditransmitShifter = synthex5890.miditransmitbuffer;

           //Reset the transmit clock
           synthex5890.miditransmitclock += (synthex5890.midibaudratedivider * synthex5890.mididatabits);

           //Set the transmit register empty flag
           synthex5890.midistatus |= 0x02;
        }
        else
           synthex5890.miditransmittingflag = false;
     }
  }

  //Handle receiving only when busy with receiving
  if(synthex5890.midireceivingflag == true)
  {
    //Process receive clock
    synthex5890.midireceiveclock -= cpu.cycles;
    if(synthex5890.midireceiveclock <= 0)
    {
      //Set receive interrupt when interrupt enabled
      if((synthex5890.midicontrol & 0x80) == 0x80)
      {
        synthex5890.midistatus |= 0x80;

        //Signal the CPU via non maskable interrupt byte is received
        cpu.nmi = true;
      }

      //Signal data has changed
      synthex.mididatachanged = true;

      synthex5890.midireceive = synthex5890.midireceiveshifter;

      //Check on overrun
      if(synthex5890.midistatus & 0x01)
        synthex5890.midistatus |= 0x20;
      else
        synthex5890.midistatus |= 0x01;

       //Reset the receiving flag to signal next byte can be send
      synthex5890.midireceivingflag = false;
    }
  }
};

//------------------------------------------------------------------------------------------------------------------------------
SynthexHardware.prototype.init = function(cpu)
{
  var idx;

  //Hook functions and data onto peripheral system of the core
  cpu.pdata = this;
  cpu.pcheck = this.check;
  cpu.phandle = this.handle;

  //No peripheral handler yet
  this.handlehardware = null;

  this.synthex5870data.glidereadback = 0xFF;

  this.synthex5831data.extread1 = 0xDF; //Sequencer interrupt off
  this.synthex5831data.extread2 = 0xFF;
  this.synthex5831data.extread3 = 0xFF;

  this.synthex5831data.extcaswrite = 0xFF;

  for(idx=0;idx<4;idx++)
     this.synthex5800data[idx].envcmp = 0xFF;

  this.systeminit = true;
  this.analogupdate = false;
  this.digitalupdate = false;

  this.masterbalance = 128;
  this.mastervolume = 150;
  this.outputmode = 1;
  this.mastertune = 128;

  //All panel keys are off
  this.synthex581Xdata.prgkeys2 = 0xFF;
  this.synthex581Xdata.lfowavekeys = 0xFF;
  this.synthex581Xdata.lforoutingkeys = 0xFF;
  this.synthex581Xdata.bankkeys = 0xFF;
  this.synthex581Xdata.prgkeys1 = 0xFF;
  this.synthex581Xdata.wavekeys1 = 0xFF;
  this.synthex581Xdata.wavekeys2 = 0xFF;
  this.synthex581Xdata.octkeys1 = 0xFF;
  this.synthex581Xdata.octkeys2 = 0xFF;
  this.synthex581Xdata.choruskeys = 0xFF;
  this.synthex581Xdata.caskeys = 0xFF;
  this.synthex581Xdata.modekeys = 0xFF;
  this.synthex581Xdata.fltmdkeys = 0xFF;

  //Setup filter system for detecting program and mode changes
  this.synthex581Xdata.modeleds = 0x0F;
  this.synthex581Xdata.prevmode = 0x0C;
  this.synthex581Xdata.prevset  = 0x03;

  this.synthex5870data.anlsig[0x30] = 0xFF;
  this.synthex5870data.anlsig[0x31] = 0xFF;

  this.seqoscsignal     = 0.0;
  this.seqoscincrement  = 0.0000128;
  this.seqgatethreshold = 22;
  this.seqgatetriggered = false;

  this.glideuppersignal    = 0.0;
  this.glideupperincrement = 0.000128;
  this.glidelowersignal    = 0.0;
  this.glidelowerincrement = 0.000128;
};

//------------------------------------------------------------------------------------------------------------------------------
//Process ADSR function
SynthexHardware.prototype.processadsr = function(vcid, adsrid, setting, cycles)
{
  //Check if attack phase since this is the only one needed for the CPU process
  if((setting & 0x0C) == 0x08)
  {
    //Check if first time
    if(this.adsrstate[vcid][adsrid] != 1)
    {
      //If so block it and reset the counter
      this.adsrstate[vcid][adsrid] = 1;
      this.adsrcounter[vcid][adsrid] = 0;
    }

    //Do the count
    this.adsrcounter[vcid][adsrid] += cycles;

    //Check if end reached
    if(this.adsrcounter[vcid][adsrid] > this.synthexadsrcounts[(setting & 0xF0) >> 4])
      return(true);
  }
  else
    this.adsrstate[vcid][adsrid] = 0;

  return(false);
};

//================================================================================
//Voice card section
//================================================================================
function Synthex5800()
{
  this.keya1 = 0;   //buffer for oscillator A1 key frequency selection (5800 IC2E)
  this.keya2 = 0;   //buffer for oscillator A2 key frequency selection (5800 IC6E)
  this.keyb1 = 0;   //buffer for oscillator B1 key frequency selection (5800 IC3E)
  this.keyb2 = 0;   //buffer for oscillator B2 key frequency selection (5800 IC7E)
  this.octa1 = 0;   //buffer for oscillator A1 octave frequency selection (5800 IC1E)
  this.octa2 = 0;   //buffer for oscillator A2 octave frequency selection (5800 IC5E)
  this.octb1 = 0;   //buffer for oscillator B1 octave frequency selection (5800 IC4E)
  this.octb2 = 0;   //buffer for oscillator B2 octave frequency selection (5800 IC8E)
  this.ampenv1 = 0; //buffer for amplifier 1 envelope settings (5800 IC4C)
  this.ampenv2 = 0; //buffer for amplifier 2 envelope settings (5800 IC8C)
  this.fltenv1 = 0; //buffer for filter 1 envelope settings (5800 IC1C)
  this.fltenv2 = 0; //buffer for filter 2 envelope settings (5800 IC5C)
  this.envcmp = 0;  //buffer for envelope comparator readback (5800 IC9C)
  this.synthsettings = [0,0,0,0,0]; //buffer for several synthesizer settings (5800 IC9M, 9N, 9O, 9P, 9Q)
}

//------------------------------------------------------------------------------------------------------------------------------
//Check voice card hardware function
Synthex5800.prototype.check = function(cpu, voicecardid)
{
  var synthex = cpu.pdata;

  //Set voice card id
  synthex.voicecardid = voicecardid & 0x03;

  //Get the voicecard hardware struct pointer
  var synthex5800 = synthex.synthex5800data[synthex.voicecardid];

  //Set function pointer for handling 5800 voice card
  synthex.handlehardware = synthex5800.handle;

  //Set memory access mode to write only since the majority is write only
  cpu.mam = 2;

  //Set the possible peripheral address
  synthex.peripheraladdress = cpu.address & 0xFE60;

  //Process address decoder 5800 IC 9I
  switch(synthex.peripheraladdress)
  {
    case 0x1200:
      //Set the possible peripheral address
      synthex.peripheraladdress = cpu.address & 0xFE79;

      //Process address decoder 5800 IC 9G
      switch(synthex.peripheraladdress)
      {
        case 0x1200:
          //Set octave frequency selection of oscillator A1 as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.octa1 = data; };
          break;

        case 0x1210:
          //Set key frequency selection of oscillator A1 as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.keya1 = data; };
          break;

        case 0x1208:
          //Set octave frequency selection of oscillator B1 as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.octb1 = data; };
          break;

        case 0x1218:
          //Set key frequency selection of oscillator B1 as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.keyb1 = data; };
          break;

        case 0x1201:
          //Set octave frequency selection of oscillator A2 as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.octa2 = data; };
          break;

        case 0x1211:
          //Set key frequency selection of oscillator A2 as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.keya2 = data; };
          break;

        case 0x1209:
          //Set octave frequency selection of oscillator B2 as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.octb2 = data; };
          break;

        case 0x1219:
          //Set key frequency selection of oscillator B2 as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.keyb2 = data; };
          break;
      }
      break;

    case 0x1220:
      //Set the possible peripheral address
      synthex.peripheraladdress = cpu.address & 0xFE79;

      //Process address decoder 5800 IC 9H
      switch(synthex.peripheraladdress)
      {
        case 0x1220:
          //Set filter 1 envelope as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.fltenv1 = data; };
          break;

        case 0x1230:
          //Set synthesizer settings 1 as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.synthsettings[0] = data; };
          break;

        case 0x1228:
          //Set amplifier 1 envelope as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.ampenv1 = data; };
          break;

        case 0x1238:
          //Set synthesizer settings 3 as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.synthsettings[2] = data; };
          break;

        case 0x1221:
          //Set filter 2 envelope as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.fltenv2 = data; };
          break;

        case 0x1231:
          //Set synthesizer settings 2 as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.synthsettings[1] = data; };
          break;

        case 0x1229:
          //Set amplifier 2 envelope as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.ampenv2 = data; };
          break;

        case 0x1239:
          //Set synthesizer settings 4 as destination
          cpu.write = function(cpu, data) { cpu.data = data; synthex5800.synthsettings[3] = data; };
          break;
      }
      break;

    case 0x1240:
      //Set synthesizer settings 5 as destination
      cpu.write = function(cpu, data) { cpu.data = data; synthex5800.synthsettings[4] = data; };
      break;

    case 0x1260:
      //Set the envelope comparator readback as source
      cpu.write = null;
      cpu.data = synthex5800.envcmp;

      //Can only be read
      cpu.mam = 1;
      break;
  }
};

//------------------------------------------------------------------------------------------------------------------------------
//Handle voice card hardware function
Synthex5800.prototype.handle = function(cpu)
{
  var synthex = cpu.pdata;
  var synthex5800 = synthex.synthex5800data[synthex.voicecardid];
  var bank;
  var voice;

  //Check if data was written
  if(cpu.pmode & 2)
  {
    //Setup digital data display
    synthex.digitaladdress = synthex.peripheraladdress;
    synthex.digitaldata = cpu.data;
    synthex.digitalupdate = true;

    //First two card's make upper bank
    bank = synthex.voicecardid / 2;

    //Two voices per card, 4 voices per bank
    voice = (synthex.voicecardid * 2) % 4;

    //Handle the selected register
    switch(synthex.peripheraladdress)
    {
      case 0x1200:
      case 0x1210:
        //Set the frequency for first oscillator of first voice
//        SynthexSetOscFreq(bank, voice, 0, synthex5800.octa1, synthex5800.keya1);
        break;

      case 0x1208:
      case 0x1218:
        //Set the frequency for second oscillator of first voice
//        SynthexSetOscFreq(bank, voice, 1, synthex5800.octb1, synthex5800.keyb1);
        break;

      case 0x1201:
      case 0x1211:
        //Set the frequency for first oscillator of second voice
//        SynthexSetOscFreq(bank, voice + 1, 0, synthex5800.octa2, synthex5800.keya2);
        break;

      case 0x1209:
      case 0x1219:
        //Set the frequency for second oscillator of second voice
//        SynthexSetOscFreq(bank, voice + 1, 1, synthex5800.octb2, synthex5800.keyb2);
        break;

      case 0x1230:
        //Set oscillator 1 waveform
//        SynthexSetOsc1Waveform(bank, synthex5800.synthsettings[0]);
        break;

      case 0x1231:
        //Set oscillator 2 waveform
//        SynthexSetOsc2Waveform(bank, synthex5800.synthsettings[1]);
        break;

      case 0x1238:
        //Set oscillator 1 volume
//        SynthexSetOsc1Volume(bank, synthex5800.synthsettings[2]);
        break;

      case 0x1239:
        //Set oscillator 2 volume
//        SynthexSetOsc2Volume(bank, synthex5800.synthsettings[3]);
        break;

      case 0x1240:
        //Set filter mode
//        SynthexSetVcfMode(bank, synthex5800.synthsettings[4]);
        break;

      case 0x1220:
        //Set the first filter adsr
//        SynthexSetFilterAdsr(bank, voice, synthex5800.fltenv1);
        break;

      case 0x1228:
        //Set the first amplifier adsr
//        SynthexSetAmplifierAdsr(bank, voice, synthex5800.ampenv1);
        break;

      case 0x1221:
        //Set the second filter adsr
//        SynthexSetFilterAdsr(bank, voice + 1, synthex5800.fltenv2);
        break;

      case 0x1229:
        //Set the second amplifier adsr
//        SynthexSetAmplifierAdsr(bank, voice + 1, synthex5800.ampenv2);
        break;
    }
  }
};

//================================================================================
//Front and rear panel section
//================================================================================
function Synthex581X()
{
  this.anlsel = 0; //6 bit buffer for analog signal selection (5810 IC8)
  this.anlsig = new Array(64); //buffers for the 26 (64 addresses) analog inputs (5810 IC9, 10, 11, 12)

  this.lfowaveleds = 0;    //buffer for LFO waveform select leds (5811 IC4)
  this.lfowavekeys = 0;    //buffer for LFO waveform select keys (5811 IC3)
  this.lforoutingleds = 0; //buffer for LFO routing select leds (5811 IC2)
  this.lforoutingkeys = 0; //buffer for LFO routing select keys (5811 IC1)

  this.octleds1 = 0; //buffer for octave select leds (5812 IC4)
  this.octleds2 = 0; //buffer for octave select leds (5812 IC2)
  this.octkeys1 = 0; //buffer for octave select keys (5812 IC3)
  this.octkeys2 = 0; //buffer for octave select keys (5812 IC1)

  this.waveleds1 = 0; //buffer for waveform select leds (5813 IC4)
  this.waveleds2 = 0; //buffer for waveform select leds (5813 IC2)
  this.wavekeys1 = 0; //buffer for waveform select keys (5813 IC3)
  this.wavekeys2 = 0; //buffer for waveform select keys (5813 IC1)

  this.fltmdleds = 0; //buffer for filter mode select leds (5816 IC2)
  this.fltmdkeys = 0; //buffer for filter mode select keys (5816 IC1)

  this.chorusleds = 0; //buffer for filter mode select leds (5817 IC2)
  this.choruskeys = 0; //buffer for filter mode select keys (5817 IC1)

  this.bankleds = 0; //buffer for bank select leds (5818 IC2)
  this.bankkeys = 0; //buffer for bank select keys (5818 IC1)
  this.prgleds1 = 0; //buffer for program select leds (5818 IC4)
  this.prgleds2 = 0; //buffer for program select leds (5818 IC6)
  this.prgkeys1 = 0; //buffer for program select keys (5818 IC3)
  this.prgkeys2 = 0; //buffer for program select keys (5818 IC5)

  this.casleds = 0;  //buffer for cassette select leds (5819 IC2)
  this.caskeys = 0;  //buffer for cassette select keys (5819 IC1)
  this.modeleds = 0; //buffer for mode select leds (5819 IC4)
  this.modekeys = 0; //buffer for mode select keys (5819 IC3)

  this.prevmode = 0; //Variable to allow change in mode (split / double) detect
  this.prevset = 0;  //Variable to allow change in set (upper / lower) detect
  this.prevpgm = 0;  //Variable to allow change in program mode (memory / preset / panel) detect

  var i;

  for(i=0;i<this.anlsig.length;i++)
    this.anlsig[i] = 0;
}

//------------------------------------------------------------------------------------------------------------------------------
//Check front / rear panel hardware function
Synthex581X.prototype.check = function(cpu)
{
  var synthex = cpu.pdata;
  var synthex581X = synthex.synthex581Xdata;

  //Set function pointer for handling 5810 board
  synthex.handlehardware = synthex581X.handle;

  //Default memory access mode read only
  cpu.mam = 1;
  cpu.write = null;

  //Process address decoder 5810 IC 2A
  switch(cpu.address & 0xFE18)
  {
    case 0x0C00:
      //Set the possible peripheral address
      synthex.peripheraladdress = cpu.address & 0xFE1F;

      //Process address decoder 5810 IC 5
      switch(synthex.peripheraladdress)
      {
        case 0x0C00:
          //Set chorus leds as destination
          cpu.mam = 2;
          cpu.write = function(cpu, data) { cpu.data = data; synthex581X.chorusleds = data; };
          break;

        case 0x0C01:
          //Set chorus keys as source
          cpu.data = synthex581X.choruskeys;

          //Not in actual hardware but done here to make keys work as latches
          synthex581X.choruskeys = 0xFF;
          break;

        case 0x0C02:
          //Set cassette leds as destination
          cpu.mam = 2;
          cpu.write = function(cpu, data) { cpu.data = data; synthex581X.casleds = data; };
          break;

        case 0x0C03:
          //Set cassette keys as source
          cpu.data = synthex581X.caskeys;

          //Not in actual hardware but done here to make keys work as latches
          synthex581X.caskeys = 0xFF;
          break;

        case 0x0C04:
          //Set mode leds as destination
          cpu.mam = 2;
          cpu.write = function(cpu, data) { cpu.data = data; synthex581X.modeleds = data; };
          break;

        case 0x0C05:
          //Set mode keys as source
          cpu.data = synthex581X.modekeys;

          //Not in actual hardware but done here to make keys work as latches
          synthex581X.modekeys = 0xFF;
          break;

        case 0x0C06:
          //Set filter mode leds as destination
          cpu.mam = 2;
          cpu.write = function(cpu, data) { cpu.data = data; synthex581X.fltmdleds = data; };
          break;

        case 0x0C07:
          //Set filter mode keys as source
          cpu.data = synthex581X.fltmdkeys;

          //Not in actual hardware but done here to make keys work as latches
          synthex581X.fltmdkeys = 0xFF;
          break;
      }
      break;

    case 0x0C08:
       //Set the possible peripheral address
       synthex.peripheraladdress = cpu.address & 0xFE1F;

       //Process address decoder 5810 IC 4
       switch(synthex.peripheraladdress)
       {
        case 0x0C08:
          //Set wafeform 1 leds as destination
          cpu.mam = 2;
          cpu.write = function(cpu, data) { cpu.data = data; synthex581X.waveleds1 = data; };
          break;

        case 0x0C0C:
          //Set wafeworm 1 keys as source
          cpu.data = synthex581X.wavekeys1;

          //Not in actual hardware but done here to make keys work as latches
          synthex581X.wavekeys1 = 0xFF;
          break;

        case 0x0C0A:
          //Set wafeform 2 leds as destination
          cpu.mam = 2;
          cpu.write = function(cpu, data) { cpu.data = data; synthex581X.waveleds2 = data; };
          break;

        case 0x0C0E:
          //Set wafeworm 2 keys as source
          cpu.data = synthex581X.wavekeys2;

          //Not in actual hardware but done here to make keys work as latches
          synthex581X.wavekeys2 = 0xFF;
          break;

        case 0x0C09:
          //Set octave select 1 leds as destination
          cpu.mam = 2;
          cpu.write = function(cpu, data) { cpu.data = data; synthex581X.octleds1 = data; };
          break;

        case 0x0C0D:
          //Set octave select 1 keys as source
          cpu.data = synthex581X.octkeys1;

          //Not in actual hardware but done here to make keys work as latches
          synthex581X.octkeys1 = 0xFF;
          break;

        case 0x0C0B:
          //Set octave select 2 leds as destination
          cpu.mam = 2;
          cpu.write = function(cpu, data) { cpu.data = data; synthex581X.octleds2 = data; };
          break;

        case 0x0C0F:
          //Set octave select 2 keys as source
          cpu.data = synthex581X.octkeys2;

          //Not in actual hardware but done here to make keys work as latches
          synthex581X.octkeys2 = 0xFF;
          break;
      }
      break;

    case 0x0C10:
      //Set the possible peripheral address
      synthex.peripheraladdress = cpu.address & 0xFE1F;

      //Process address decoder 5810 IC 3
      switch(synthex.peripheraladdress)
      {
        case 0x0C10:
          //Set LFO waveform select leds as destination
          cpu.mam = 2;
          cpu.write = function(cpu, data) { cpu.data = data; synthex581X.lfowaveleds = data; };
          break;

        case 0x0C14:
          //Set LFO waveform select keys as source
          cpu.data = synthex581X.lfowavekeys;

          //Not in actual hardware but done here to make keys work as latches
          synthex581X.lfowavekeys = 0xFF;
          break;

        case 0x0C12:
          //Set LFO routing select leds as destination
          cpu.mam = 2;
          cpu.write = function(cpu, data) { cpu.data = data; synthex581X.lforoutingleds = data; };
          break;

        case 0x0C16:
          //Set LFO routing select keys as source
          cpu.data = synthex581X.lforoutingkeys;

          //Not in actual hardware but done here to make keys work as latches
          synthex581X.lforoutingkeys = 0xFF;
          break;

        case 0x0C11:
          //Set bank select leds as destination
          cpu.mam = 2;
          cpu.write = function(cpu, data) { cpu.data = data; synthex581X.bankleds = data; };
          break;

        case 0x0C15:
          //Set bank select keys as source
          cpu.data = synthex581X.bankkeys;

          //Not in actual hardware but done here to make keys work as latches
          synthex581X.bankkeys = 0xFF;
          break;

        case 0x0C13:
          //Set program select 1 leds as destination
          cpu.mam = 2;
          cpu.write = function(cpu, data) { cpu.data = data; synthex581X.prgleds1 = data; };
          break;

        case 0x0C17:
          //Set program select 1 keys as source
          cpu.data = synthex581X.prgkeys1;

          //Not in actual hardware but done here to make keys work as latches
          synthex581X.prgkeys1 = 0xFF;
          break;
      }
      break;

    case 0x0C18:
      //Set the possible peripheral address
      synthex.peripheraladdress = cpu.address & 0xFE1B;

      //Process address decoder 5810 IC 2B
      switch(synthex.peripheraladdress)
      {
        case 0x0C18:
          //Set analog signal select as destination
          cpu.mam = 2;
          cpu.write = function(cpu, data) { cpu.data = data; synthex581X.anlsel = data; };
          break;

        case 0x0C1A:
          //Set program select 2 keys as source
          cpu.data =  synthex581X.prgkeys2;

          //Not in actual hardware but done here to make keys work as latches
          synthex581X.prgkeys2 = 0xFF;
          break;

        case 0x0C1B:
          //Set program select 2 leds as destination
          cpu.mam = 2;
          cpu.write = function(cpu, data) { cpu.data = data; synthex581X.prgleds2 = data; };
          break;
      }
      break;
  }
};

//------------------------------------------------------------------------------------------------------------------------------
//Handle panels hardware function
Synthex581X.prototype.handle = function(cpu)
{
  var synthex = cpu.pdata;
  var synthex581X = synthex.synthex581Xdata;

  //Check if data was written
  if((cpu.pmode & 2) && synthex.updateleds)
  {
    //Handle the selected panel part for updating the leds
    switch(synthex.peripheraladdress)
    {
      case 0x0C1B:
        synthex.updateleds(0x0C1B, synthex581X.prgleds2);
        break;

      case 0x0C10:
        synthex.updateleds(0x0C10, synthex581X.lfowaveleds);
        break;

      case 0x0C12:
        synthex.updateleds(0x0C12, synthex581X.lforoutingleds);
        break;

      case 0x0C11:
        synthex.updateleds(0x0C11, synthex581X.bankleds);
        break;

      case 0x0C13:
        synthex.updateleds(0x0C13, synthex581X.prgleds1);
        break;

      case 0x0C08:
        synthex.updateleds(0x0C08, synthex581X.waveleds1);
        break;

      case 0x0C0A:
        synthex.updateleds(0x0C0A, synthex581X.waveleds2);
        break;

      case 0x0C09:
        synthex.updateleds(0x0C09, synthex581X.octleds1);
        break;

      case 0x0C0B:
        synthex.updateleds(0x0C0B, synthex581X.octleds2);
        break;

      case 0x0C00:
        synthex.updateleds(0x0C00, synthex581X.chorusleds);
        break;

      case 0x0C02:
        synthex.updateleds(0x0C02, synthex581X.casleds);
        break;

      case 0x0C04:
        synthex.updateleds(0x0C04, synthex581X.modeleds);
        break;

      case 0x0C06:
        synthex.updateleds(0x0C06, synthex581X.fltmdleds);
        break;
    }
  }
};

//================================================================================
//Sequencer, midi and keyboard section
//================================================================================
function Synthex5831()
{
  this.buffer1 = 0; //buffer for address select 1 on schematic 5831
  this.buffer2 = 0; //buffer for address select 2 on schematic 5831
  this.buffer3 = 0; //buffer for address select 3 on schematic 5831
  this.buffer4 = 0; //buffer for address select 4 on schematic 5831

  this.keyboarddata = [0,0,0,0,0,0,0,0]; //The piano keys are scanned in 8 rows

  this.extwrite1 = 0;   //buffer for led's on frontpannel
  this.extwrite2 = 0;   //buffer for led's on frontpannel
  this.extcaswrite = 0; //Cassette output. No data buffered but flipflop on write

  this.extread1 = 0; //buffer for reading sequencer and external signals (5831 IC3A)
  this.extread2 = 0; //buffer for reading sequencer and external signals (5831 IC2A)
  this.extread3 = 0; //buffer for reading sequencer and external signals (5831 IC3D)
}

function Synthex5890()
{
  this.midicontrol = 0;  //Midi control register (5890 IC7)
  this.miditransmit = 0; //Midi transmit register (5890 IC7)
  this.midistatus = 0;   //Midi status register (5890 IC7)
  this.midireceive = 0;  //Midi receive register (5890 IC7)

  //MC6850 (MIDI) registers
  this.midibaudratedivider = 0; //Baudrate divider used to reset receive and transmit clocks
  this.midireceiveclock = 0;    //Counter for receive speed handling
  this.miditransmitclock = 0;   //Counter for transmit speed handling
  this.mididatabits = 0;        //Number of bits to transmit or receive
  this.midireceiveshifter = 0;  //buffer for receive data
  this.miditransmitbuffer = 0;  //buffer for transmit data
  this.miditransmitshifter = 0; //Second buffer for transmit data

  //MC6850 (MIDI) flags
  this.miditransmittingflag = 0; //Flag to signal transmit shift register is full
  this.midireceivingflag = 0;    //Flag to signal receive shift register is full
};

//------------------------------------------------------------------------------------------------------------------------------
//Check sequencer, midi and keyboard hardware function
Synthex5831.prototype.check = function(cpu)
{
  var synthex = cpu.pdata;

  //Check if MIDI or sequencer, keyboard addressed
  if((cpu.address & 0xFE1C) == 0x0E00)
  {
    var synthex5890 = synthex.synthex5890data;

    //Set function pointer for handling 5890 board
    synthex.handlehardware = synthex5890.handle;

    //Set the possible peripheral address
    synthex.peripheraladdress = cpu.address & 0xFE1F;

    //Default memory access mode read only
    cpu.mam = 1;
    cpu.write = null;

    //Process midi address decoding
    switch(synthex.peripheraladdress)
    {
      case 0x0E00:
        //Set midi control register as destination
        cpu.mam = 2;
        cpu.write = function(cpu, data) { cpu.data = data; synthex5890.midicontrol = data; };
        break;

      case 0x0E02:
        //Set midi status register as source
        cpu.data = synthex5890.midistatus;
        break;

      case 0x0E01:
        //Set midi transmit register as destination
        cpu.mam = 2;
        cpu.write = function(cpu, data) { cpu.data = data; synthex5890.miditransmit = data; };
        break;

      case 0x0E03:
        //Set midi receive register as source
        cpu.data = synthex5890.midireceive;
        break;
    }
  }
  else
  {
    var synthex5831 = synthex.synthex5831data;

    //Set function pointer for handling 5831 board
    synthex.handlehardware = synthex5831.handle;

    //Set the possible peripheral address
    synthex.peripheraladdress = cpu.address & 0xFE18;

    //Process sequencer and keyboard address decoding
    switch(synthex.peripheraladdress)
    {
      case 0x0E00:
        //Copy data for reading
        synthex5831.buffer1 = synthex5831.extread1;

        //Not in actual hardware but done here to make keys work as latches
        synthex5831.extread1 |= 0x0E;

        //Set 1st buffer as source / destination
        cpu.data = synthex5831.buffer1;
        cpu.write = function(cpu, data) { cpu.data = data; synthex5831.buffer1 = data; };
        break;

      case 0x0E08:
        //Copy data for reading
        synthex5831.buffer2 = synthex5831.extread2;

        //Not in actual hardware but done here to make keys work as latches
        synthex5831.extread2 |= 0xFC;

        //Set 2nd buffer as source / destination
        cpu.data = synthex5831.buffer2;
        cpu.write = function(cpu, data) { cpu.data = data; synthex5831.buffer2 = data; };
        break;

      case 0x0E10:
        //Copy data for reading and invert write enable to match the switch
        synthex5831.buffer3 = synthex5831.extread3 ^ 0x08;

        //Set 3rd buffer as  source / destination
        cpu.data = synthex5831.buffer3;
        cpu.write = function(cpu, data) { cpu.data = data; synthex5831.buffer3 = data; };
        break;

      case 0x0E18:
        //Copy data for reading. For keyboard 8 possible registers to read
        synthex5831.buffer4 = synthex5831.keyboarddata[cpu.address & 0x0007];

        //Set 4th buffer as source / destination
        cpu.data = synthex5831.buffer4;
        cpu.write = function(cpu, data) { cpu.data = data; synthex5831.buffer4 = data; };
        break;
    }
  }
};

//------------------------------------------------------------------------------------------------------------------------------
//Handle sequencer and keyboard hardware function
Synthex5831.prototype.handle = function(cpu)
{
  var synthex = cpu.pdata;
  var synthex5831 = synthex.synthex5831data;

  //Check if data was written
  if(cpu.pmode & 2)
  {
    //Handle the selected sequencer part
    switch(synthex.peripheraladdress)
    {
      case 0x0E00:
        //Copy written data
        synthex5831.extwrite1 = synthex5831.buffer1;

        //Update the frontpanel leds
        if(synthex.updateleds)
          synthex.updateleds(0x0E00, synthex5831.buffer1);
        break;

      case 0x0E08:
        //Copy written data
        synthex5831.extwrite2 = synthex5831.buffer2;

        //Update the frontpanel leds
        if(synthex.updateleds)
          synthex.updateleds(0x0E08, synthex5831.buffer2);
        break;

      case 0x0E10:
        //Cassette write clocks a flipflop with toggle feedback
        synthex5831.extcaswrite ^= 0xFF;
        break;

      case 0x0E18:
        //Clear the sequencer interrupt
        synthex.synthex5831data.extread1 &= 0xDF;
        cpu.irq = false;
        break;
    }
  }
};

//------------------------------------------------------------------------------------------------------------------------------
//Handle midi hardware function
Synthex5890.prototype.handle = function(cpu)
{
  var synthex = cpu.pdata;
  var synthex5890 = synthex.synthex5890data;

  //Handling of MC6850 MIDI chip
  //DCD and CTS are set low in hardware
  //Parity handling and framing error are not implemented

  //Check if data was read
  if(cpu.pmode & 1)
  {
    //Process midi read registers
    switch(synthex.peripheraladdress)
    {
      case 0x0E02:
        //Need to process internal 6850 status on status read
        //DCD and CTS are tied low in hardware so keep them low
        //Framing error is not implemented so kept low
        synthex5890.midistatus &= 0xE3;
        break;

      case 0x0E03:
        //Need to process internal 6850 status on receiver read
        //DCD and CTS are tied low in hardware so keep them low
        //Framing error is not implemented so kept low
        //Overrun is cleared on receiver read
        //Interrupt request is also cleared
        synthex5890.midistatus &= 0x42;
        break;
    }
  }

  //Check if data was written
  if(cpu.pmode & 2)
  {
    //Process midi write registers
    switch(synthex.peripheraladdress)
    {
      case 0x0E00:
        //Signal MIDI window data has changed
        synthex.mididatachanged = true;

        //Process baudrate setting or perform master reset
        switch(synthex5890.midicontrol & 0x03)
        {
          case 0x00:
            synthex5890.midibaudratedivider = 2;
            break;

          case 0x01:
            synthex5890.midibaudratedivider = 32;
            break;

          case 0x02:
            synthex5890.midibaudratedivider = 128;
            break;

          case 0x03:
            //Perform master reset
            synthex5890.midireceive = 0x00;
            synthex5890.miditransmit = 0x00;
            synthex5890.midistatus = 0x02;
            synthex5890.miditransmittingflag = false;
            break;
        }

        //Set the number of databits. Only used for timing
        switch(synthex5890.midicontrol & 0x1C)
        {
          case 0x00:
          case 0x04:
          case 0x10:
          case 0x18:
          case 0x1C:
            synthex5890.mididatabits = 10;
            break;

          case 0x08:
          case 0x0C:
          case 0x14:
            synthex5890.mididatabits = 9;
            break;
        }

        //Trigger interrupt when transmit enabled
        //Not sure about this since it is not in the MC6850 specs
        //But the original synthex software seems to need it to work.
        if((synthex5890.midicontrol & 0x60) == 0x20)
        {
//          synthex5890.midistatus |= 0x80;

          //Send interrupt to CPU
//          cpu.nmi = true;
        }
        break;

      case 0x0E01:
        //Signal MIDI window data has changed
        synthex.mididatachanged = true;

        //Ignore write when buffer not empty
        if((synthex5890.midistatus & 0x02) == 0x02)
        {
          //Transfer the written data to the first buffer
          synthex5890.miditransmitbuffer = synthex5890.miditransmit;

          //Clear the interrupt request
          synthex5890.midistatus &= 0x7F;

          //Check if transmit shifter is free. Else clear the transmit register empty flag.
          if(synthex5890.miditransmittingflag == false)
          {
            synthex5890.miditransmittingflag = true;
            synthex5890.miditransmitShifter = synthex5890.miditransmitbuffer;

            //Reset the transmit clock
            synthex5890.miditransmitclock = synthex5890.midibaudratedivider * synthex5890.mididatabits;
          }
          else
            synthex5890.midistatus &= 0xFD;
        }
        break;
    }
  }
};

//================================================================================
//LFO board section
//================================================================================
function Synthex5850()
{
  this.register1 = 0; //buffer for control signals (5850 IC2A)
  this.register2 = 0; //buffer for control signals (5850 IC5A)
  this.register3 = 0; //buffer for control signals (5850 IC3A)
  this.register4 = 0; //buffer for control signals (5850 IC4A)
  this.register5 = 0; //buffer for control signals (5850 IC1A)
  this.register6 = 0; //buffer for control signals (5850 IC1B)
  this.syncupper = 0; //buffer for upper LFO sync signal
  this.synclower = 0; //buffer for lower LFO sync signal
}

//------------------------------------------------------------------------------------------------------------------------------
//Handle LFO board hardware function
Synthex5850.prototype.handle = function(cpu)
{
  var synthex = cpu.pdata;
  var synthex5850 = synthex.synthex5850data;

  //Check if data was written
  if(cpu.pmode & 2)
  {
    //Setup digital data display
    synthex.digitaladdress = synthex.peripheraladdress;
    synthex.digitaldata = cpu.data;
    synthex.digitalupdate = true;

    switch(synthex.peripheraladdress)
    {
      case 0x1020:
        //Set the upper glide divider based on the given setting
        switch(synthex5850.register1 & 0x0C0)
        {
          case 0x00:
            synthex.glideupperdivider = 4;
            break;

          case 0x40:
          case 0x80:
            synthex.glideupperdivider = 2;
            break;

          case 0xC0:
            synthex.glideupperdivider = 1;
            break;
        }

        //Set the selected upper LFO waveform
//        SynthexSetUpperLfoWaveform(synthex5850.register1);
        break;

      case 0x1060:
        //Set the lower glide divider based on the given setting
        switch(synthex5850.register2 & 0x0C0)
        {
          case 0x00:
            synthex.glidelowerdivider = 4;
            break;

          case 0x40:
          case 0x80:
            synthex.glidelowerdivider = 2;
            break;

          case 0xC0:
            synthex.glidelowerdivider = 1;
            break;
        }

        //Set the selected lower LFO waveform
//        SynthexSetLowerLfoWaveform(synthex5850.register2);
        break;

      case 0x1000:
        //Set upper LFO routing from the 5850 board
//        SynthexSetUpperLfo5850Routing(synthex5850.register3);
        break;

      case 0x1010:
        //Set lower LFO routing from the 5850 board
//        SynthexSetLowerLfo5850Routing(synthex5850.register4);
        break;

      case 0x1030:
        //Set upper noise parameters
//        SynthexSetUpperNoise(synthex5850.register5);
        break;

      case 0x1040:
        //Set lower noise parameters
//        SynthexSetLowerNoise(synthex5850.register6);
        break;

      case 0x1050:
        //Sync upper LFO
//        SynthexSyncUpperLfo();
        break;

      case 0x1070:
        //Sync lower LFO
//        SynthexSyncLowerLfo();
        break;
    }
  }
};

//================================================================================
//Main control board section
//================================================================================
function Synthex5870()
{
  this.dacvalue = 0; //Output value of the DAC

  this.dacctrl1 = 0; //buffer for DAC control signals (5870 IC3H)
  this.dacctrl2 = 0; //buffer for DAC control signals (5870 IC3G)
  this.shselect = 0; //buffer for sample and hold select (5870 IC5G)

  this.anlsel = 0; //Analog output signal select.
  this.anlsig = new Array(64); //buffers for the analog output signals (5870 IC4M, 4N, 4P, 5M, 5P)
  this.anlsrc = new Array(64); //buffers for the analog source signal display
  this.anldct = new Array(64); //buffers for filter for change detect

  this.adcsignal = 0; //buffer for ADC comparator signal (5870 IC3F)

  this.chorusctrl = 0; //buffer for chorus control signals (5870 IC5C)

  this.oscillatorctrl = 0; //buffer for main oscillator control signals (5870 IC5F)

  this.glideresetupper = 0; //buffer for upper glide reset signal (5870 IC3E)
  this.glideresetlower = 0; //buffer for lower glide reset signal (5870 IC3E)
  this.glidereadback = 0;   //buffer for glide interrupt signals (5870 IC3F)

  this.cpureset = 0; //buffer for reset signal

  //Setup table for selecting DAC reference signal
  this.refsignaltab = [ 0x30, 0x02, 0x31, 0x06, 0x01, 0x15, 0x03, 0x14 ];

  var i;

  for(i=0;i<this.anlsig.length;i++)
  {
    this.anlsig[i] = 0;
    this.anlsrc[i] = 0;
    this.anldct[i] = 0xEA;
  }
};

//------------------------------------------------------------------------------------------------------------------------------
//Handle main board hardware function
Synthex5870.prototype.handle = function(cpu)
{
  var synthex = cpu.pdata;
  var synthex581X = synthex.synthex581Xdata;
  var synthex5870 = synthex.synthex5870data;
  var analogsource;

  //Check if data was written
  if(cpu.pmode & 2)
  {
    //Setup digital data display
    synthex.digitaladdress = synthex.peripheraladdress;
    synthex.digitaldata = cpu.data;

    //Process the addressed peripheral
    switch(synthex.peripheraladdress)
    {
      //Update the analog system depending on the control bytes
      case 0x14E0:
      case 0x1460:
      case 0x1660:
        //Combine the two control values to 8 bits for the DAC
        synthex5870.dacvalue = (synthex5870.dacctrl1 & 0x3F) | (synthex5870.dacctrl2 & 0xC0);

        //Get the index of the analog source
        analogsource = synthex5870.dacctrl2 & 0x07;

        //Analog output select based on sample and hold select shifted down by two bits
        synthex5870.anlsel = ((synthex5870.shselect >> 2) & 0x3F);

        //Only update when in range of the available sample and holds
        if(synthex5870.anlsel < 0x28)
        {
          //Set the new output value
          synthex5870.anlsig[synthex5870.anlsel] = synthex5870.dacvalue;

          //Check if data has changed
          if(synthex5870.anlsig[synthex5870.anlsel] != synthex5870.anldct[synthex5870.anlsel])
          {
            //Update the change detect filter on change detected
            synthex5870.anldct[synthex5870.anlsel] = synthex5870.anlsig[synthex5870.anlsel];

            //Set the source indicator
            synthex5870.anlsrc[synthex5870.anlsel] = analogsource;

            //Signal update the display
            synthex.analogupdate = true;

            //For the synthesis engine multiply with the selected reference voltage
            synthex5870.dacvalue = (synthex5870.dacvalue * synthex5870.anlsig[synthex5870.refsignaltab[analogsource]]) / 255;

            //Update the sound generation
            switch(synthex5870.anlsel)
            {
              case 0x1E:
//                SynthexSetUpperDetune(synthex5870.dacvalue);
                break;

              case 0x1F:
//                SynthexSetLowerDetune(synthex5870.dacvalue);
                break;

              case 0x18:
//                SynthexSetUpperLfoSpeed(synthex5870.dacvalue);
                break;

              case 0x19:
//                SynthexSetLowerLfoSpeed(synthex5870.dacvalue);
                break;

              case 0x0B:
//                SynthexSetUpperLfoDelay(synthex5870.dacvalue);
                break;

              case 0x0D:
//                SynthexSetLowerLfoDelay(synthex5870.dacvalue);
                break;

              case 0x10:
//                SynthexSetUpperLfoDepthA(synthex5870.dacvalue);
                break;

              case 0x16:
//                SynthexSetLowerLfoDepthA(synthex5870.dacvalue);
                break;

              case 0x11:
//                SynthexSetUpperLfoDepthB(synthex5870.dacvalue);
                break;

              case 0x12:
//                SynthexSetLowerLfoDepthB(synthex5870.dacvalue);
                break;

              case 0x08:
//                SynthexSetUpperOsc1PulseWidth(synthex5870.dacvalue);
                break;

              case 0x27:
//                SynthexSetLowerOsc1PulseWidth(synthex5870.dacvalue);
                break;

              case 0x0A:
//                SynthexSetUpperOsc2PulseWidth(synthex5870.dacvalue);
                break;

              case 0x09:
//                SynthexSetLowerOsc2PulseWidth(synthex5870.dacvalue);
                break;

              case 0x0F:
//                SynthexSetUpperVcfCutOff(synthex5870.dacvalue);
                break;

              case 0x24:
//                SynthexSetLowerVcfCutOff(synthex5870.dacvalue);
                break;

              case 0x04:
//                SynthexSetUpperVcfResonance(synthex5870.dacvalue);
                break;

              case 0x00:
//                SynthexSetLowerVcfResonance(synthex5870.dacvalue);
                break;

              case 0x03:
//                SynthexSetUpperFilterAdsrLevel(synthex5870.dacvalue);
                break;

              case 0x06:
//                SynthexSetLowerFilterAdsrLevel(synthex5870.dacvalue);
                break;

              case 0x22:
//                SynthexSetUpperFilterSustain(synthex5870.dacvalue);
                break;

              case 0x23:
//                SynthexSetLowerFilterSustain(synthex5870.dacvalue);
                break;

              case 0x0C:
//                SynthexSetUpperAmplifierSustain(synthex5870.dacvalue);
                break;

              case 0x0E:
//                SynthexSetLowerAmplifierSustain(synthex5870.dacvalue);
                break;

              case 0x26:
//                SynthexSetLowerKeyTrack(0, synthex5870.dacvalue);
                break;

              case 0x25:
//                SynthexSetLowerKeyTrack(1, synthex5870.dacvalue);
                break;

              case 0x1B:
//                SynthexSetLowerKeyTrack(2, synthex5870.dacvalue);
                break;

              case 0x21:
//                SynthexSetLowerKeyTrack(3, synthex5870.dacvalue);
                break;

              case 0x05:
//                SynthexSetUpperKeyTrack(0, synthex5870.dacvalue);
                break;

              case 0x20:
//                SynthexSetUpperKeyTrack(1, synthex5870.dacvalue);
                break;

              case 0x07:
//                SynthexSetUpperKeyTrack(2, synthex5870.dacvalue);
                break;

              case 0x1D:
//                SynthexSetUpperKeyTrack(3, synthex5870.dacvalue);
                break;

              case 0x1C:
                synthex.glideupperincrement = 0.000128 + ((0.00256 * synthex5870.dacvalue) / 255.0);
                break;

              case 0x1A:
                synthex.glidelowerincrement = 0.000128 + ((0.00256 * synthex5870.dacvalue) / 255.0);
                break;
            }
          }
        }

        //Ignore the sub mux channel select bits when LFO signals are selected
        if(synthex581X.anlsel < 0x20)
          synthex581X.anlsel &= 0x18;

        //Compare the DAC signal with the selected panel signal
        if(synthex581X.anlsig[synthex581X.anlsel & 0x3F] > synthex5870.dacvalue)
          synthex5870.adcsignal &= 0x7F;
        else
          synthex5870.adcsignal |= 0x80;
        break;

      case 0x1560:
        //Clear the upper glide interrupt
        synthex5870.glidereadback |= 0x80;
        cpu.irq = false;
        break;

      case 0x15E0:
        //Clear the lower glide interrupt
        synthex5870.glidereadback |= 0x40;
        cpu.irq = false;
        break;

      case 0x16E0:
        synthex.digitalupdate = true;

        //Set upper chorus mode
//        SynthexSetUpperChorusMode(synthex5870.chorusctrl >> 5);

        //Set lower chorus mode
//        SynthexSetLowerChorusMode(synthex5870.chorusctrl >> 2);
        break;
/*
B2    F2   -> Upper osc 1 lfo on/off
B3    M2   -> Upper osc 2 lfo on/off
B4    F4   -> Lower osc 1 lfo on/off
B5    M4   -> Lower osc 2 lfo on/off
B6    SEL  -> select main osc for voice boards 0 use upper for all. 1 separate lower and upper.
B7    SPO  -> Stereo/mono control?? External filter control??? 1 in normal mode 0 in split or double
*/
      case 0x1760:
        synthex.digitalupdate = true;

        //Set upper LFO routing from the 5870 board
//        SynthexSetUpperLfo5870Routing(synthex5870.oscillatorctrl >> 2);

        //Set lower LFO routing from the 5870 board
//        SynthexSetLowerLfo5870Routing(synthex5870.oscillatorctrl >> 4);

        //Set stereo control
//        SynthexSetStereoMode((synthex5870.oscillatorctrl & 0x80) == 0x00);
        break;
    }
  }
};

//================================================================================

//------------------------------------------------------------------------------------------------------------------------------
/*
BOOL SynthexTapeConvertWave2Data(PWAVEDATA pWaveData, PSYNTHEX_TAPEDATA pTapeCycleData)
{
   PSYNTHEX_TAPESAMPLE tapedata;
   PSYNTHEX_TAPESAMPLE dptr;
   PSYNTHEX_TAPESAMPLE lptr;
   this.       data = 0;
   this.   idx;
   this.   datasize;
   this.   newsize;
   this.   tapesamples = 1;
   this.   samples = 0.0;
   this.   samplespersecond = pWaveData->SamplesPerSec;
   this.   vuconstant = 0.075;
   this.   vulevel = 0.0;
   this.   vuinput = 0.0;

   datasize = 256;
   tapedata = (PSYNTHEX_TAPESAMPLE)malloc(datasize * sizeof(SYNTHEX_TAPESAMPLE));

   if(tapedata == null)
      return(false);

   dptr = tapedata;
   lptr = tapedata + (datasize - 1);

   if(pWaveData->BitsPerSample == 16)
   {
      short min_threshold = -50;
      short max_threshold = 50;
      short *sptr = (short *)pWaveData->WaveDatabuffer;

      dptr->cycles = 0;
      dptr->Data = 0;

      //For stereo only left channel is used
      for(idx=0;idx<pWaveData->NumberOfSamples;idx+=pWaveData->NumOfChannels)
      {
         if(sptr[idx] > max_threshold)
            data = 0x80;
         else if(sptr[idx] < min_threshold)
            data = 0x00;

         //Track the volume level
         vuinput = (double)(abs(sptr[idx])) / 32678.0;
         vulevel += vuconstant * (vuinput - vulevel);

         samples++;

         //Check if change detected
         if(data != dptr->Data)
         {
            if(dptr == lptr)
            {
               PSYNTHEX_TAPESAMPLE newdata;

               newsize = datasize + 256;
               newdata = (PSYNTHEX_TAPESAMPLE)malloc(newsize * sizeof(SYNTHEX_TAPESAMPLE));

               if(newdata == null)
               {
                  free(tapedata);
                  return(false);
               }

               memcpy(newdata, tapedata, datasize * sizeof(SYNTHEX_TAPESAMPLE));
               dptr = newdata + datasize;
               lptr = newdata + (newsize - 1);

               free(tapedata);

               tapedata = newdata;
               datasize = newsize;
            }
            else
               dptr++;

            dptr->Data = data;
            dptr->cycles = int((samples / samplespersecond) / SYNTHEX_CYCLE_TIME);
            dptr->Volume = (int)(vulevel * 18);
            tapesamples++;
            samples = 0.0;
         }
      }
   }
   else
   {
      unsigned char min_threshold = 108;
      unsigned char max_threshold = 148;
      unsigned char *sptr = (unsigned char *)pWaveData->WaveDatabuffer;

      vuconstant = 0.0005;

      dptr->cycles = 0;
      dptr->Data = 0;

      //For stereo only left channel is used
      for(idx=0;idx<pWaveData->NumberOfSamples;idx+=pWaveData->NumOfChannels)
      {
         if(sptr[idx] > max_threshold)
            data = 0x80;
         else if(sptr[idx] < min_threshold)
            data = 0x00;

         //Track the volume level
         vuinput = (double)(abs(sptr[idx] - 128)) / 128.0;
         vulevel += vuconstant * (vuinput - vulevel);

         samples++;

         //Check if change detected
         if(data != dptr->Data)
         {
            if(dptr == lptr)
            {
               PSYNTHEX_TAPESAMPLE newdata;

               newsize = datasize + 256;
               newdata = (PSYNTHEX_TAPESAMPLE)malloc(newsize * sizeof(SYNTHEX_TAPESAMPLE));

               if(newdata == null)
               {
                  free(tapedata);
                  return(false);
               }

               memcpy(newdata, tapedata, datasize * sizeof(SYNTHEX_TAPESAMPLE));
               dptr = newdata + datasize;
               lptr = newdata + (newsize - 1);

               free(tapedata);

               tapedata = newdata;
               datasize = newsize;
            }
            else
               dptr++;

            dptr->Data = data;
            dptr->cycles = int((samples / samplespersecond) / SYNTHEX_CYCLE_TIME);
            dptr->Volume = (int)(vulevel * 8);
            tapesamples++;
            samples = 0.0;
         }
      }
   }

   //Release the wave data
   free(pWaveData->WaveDatabuffer);
   pWaveData->WaveDatabuffer = null;

   //Check if previous data set and release if so
   if(pTapeCycleData->Samples)
      free(pTapeCycleData->Samples);

   //Output the data
   pTapeCycleData->MaxSamples = tapesamples;
   pTapeCycleData->NofSamples = 0;
   pTapeCycleData->Samples = tapedata;
   return(true);
}

//------------------------------------------------------------------------------------------------------------------------------

BOOL SynthexTapeConvertData2Wave(PWAVEDATA pWaveData, PSYNTHEX_TAPEDATA pTapeCycleData)
{
   CPU_UDWORD     idx;
   int            cnt;
   int            samples;
   unsigned char  sample;
   unsigned char *dptr;
   unsigned char *eptr;

   //Fixed samples per second, 8 bits per sample and mono output
   pWaveData->SamplesPerSec = 44100;
   pWaveData->BitsPerSample = 8;
   pWaveData->NumOfChannels = 1;

   //Based on 1us cycle time calculate the needed number of samples
   pWaveData->NumberOfSamples = pWaveData->SamplesPerSec;

   pWaveData->WaveDatabuffer = malloc(pWaveData->NumberOfSamples * sizeof(unsigned char));

   if(pWaveData->WaveDatabuffer == null)
      return(false);

   dptr = (unsigned char *)pWaveData->WaveDatabuffer;
   eptr = (unsigned char *)pWaveData->WaveDatabuffer + pWaveData->NumberOfSamples;

   for(idx=0;idx<pTapeCycleData->NofSamples;idx++)
   {
      //Calculate number of samples needed for current data
      samples = (int)((pTapeCycleData->Samples[idx].cycles * SYNTHEX_CYCLE_TIME) * pWaveData->SamplesPerSec);
      sample = pTapeCycleData->Samples[idx].Data == 0 ? 20 : 235;

      //Check if we need a new buffer
      if((dptr + samples) >= eptr)
      {
         unsigned char *buffer;
         int            nofsamples;

         pWaveData->NumberOfSamples += (samples + pWaveData->SamplesPerSec);

         buffer = (unsigned char*)malloc(pWaveData->NumberOfSamples * sizeof(unsigned char));

         if(buffer == null)
            return(false);

         nofsamples = (int)(dptr - (unsigned char *)pWaveData->WaveDatabuffer);
         memcpy(buffer, pWaveData->WaveDatabuffer, nofsamples);

         free(pWaveData->WaveDatabuffer);

         pWaveData->WaveDatabuffer = buffer;

         dptr = (unsigned char *)pWaveData->WaveDatabuffer + nofsamples;
         eptr = (unsigned char *)pWaveData->WaveDatabuffer + pWaveData->NumberOfSamples;
      }

      //Write samples to buffer
      for(cnt=0;cnt<samples;cnt++)
         *dptr++ = sample;

      if(dptr == eptr)
         break;
   }

   //Set the actual number of samples
   pWaveData->NumberOfSamples = (int)(dptr - (unsigned char *)pWaveData->WaveDatabuffer);

   return(true);
}
*/
//------------------------------------------------------------------------------------------------------------------------------
//To Do
//Fill in remaining hardware handling functions as part of audio generation
//Sequencer feedback to pianokeys
//Route midi back to pianokeys (need visual mode without feedback to scanarray)
//Joy stick control
//Fader control
//Finish hardware init function
//Comment the code where needed
//Oscilloscope to view signals ??? maybe
//Sound generation