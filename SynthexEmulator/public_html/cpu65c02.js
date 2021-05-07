//================================================================================
// 65C02 Central Processing Unit
//================================================================================
function Opcode(ins,amd,nbt,ncl,opc,ops)
{
  this.ins = ins;  //Function for this instruction
  this.amd = amd;  //Addressing mode for this instruction
  this.nbt = nbt;  //Number of bytes used for this instruction
  this.ncl = ncl;  //Number of cycles this instruction takes
  this.opc = opc;  //Opcode for disassembly
  this.ops = ops;  //Operand string for disassembly
}

function Disasm_item(address, string)
{
  this.address = address;
  this.string = string;
}

//------------------------------------------------------------------------------------------------------------------------------
// Main constructor
//------------------------------------------------------------------------------------------------------------------------------
function CPU65C02()
{
  this.pc = 0; //Program counter

  this.a = 0; //Accumulator
  this.x = 0; //X index register
  this.y = 0; //Y index register
  this.s = 0; //Stack pointer

  this.n = 0; //Negative flag
  this.z = 1; //Zero flag
  this.c = 0; //Carry flag
  this.v = 0; //Overflow flag
  this.b = 0; //Break flag
  this.i = 0; //Interrupt enable flag
  this.d = 0; //Decimal mode flag

  this.reset = true; //Reset flag
  this.nmi = false;  //Non maskable interrupt flag
  this.irq = false;  //Maskable interrupt flag

  this.mem = new Array(0x10000); //System memory to be filled by the user

  this.address = 0;  //Current data address
  this.data = 0;     //Data to be used in instructions
  this.tmp = 0;      //Temporarily variable

  this.write = null; //Pointer for write functions

  this.mam = 3;  //Memory access mode either 1 -> read, 2 -> write or 3 both
  this.coa = 0;  //Check on address mode either 0 -> don't check or 1 -> check

  this.pmode = 0;      //Peripheral access mode either 1 -> read, 2 -> write or 3 both
  this.pcheck = null;  //Pointer for hardware peripheral address checking
  this.phandle = null; //Pointer for hardware peripheral address handling
  this.pdata = null;   //Pointer for hardware data

  this.mmi = null;  //Pointer for mam machine interface handling

  this.cycles = 0;  //Cycles counter
  this.opcode = 0;  //Current opcode

  var i;

  for(i=0;i<this.mem.length;i++)
    this.mem[i] = 0;

  //-------------------------------------------------------------------------------------------------------------------------------
  this.instable = new Array();

  this.instable[0x00] = new Opcode( this.brk, null,     2, 7, "BRK", this.d_imm );  //Break
  this.instable[0x01] = new Opcode( this.ora, this.iix, 2, 6, "ORA", this.d_iix );  //Or memory and accumulator
  this.instable[0x02] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x03] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x04] = new Opcode( this.tsb, this.zpg, 2, 5, "TSB", this.d_zpg );  //Test and set bit in memory
  this.instable[0x05] = new Opcode( this.ora, this.zpg, 2, 3, "ORA", this.d_zpg );  //Or memory and accumulator
  this.instable[0x06] = new Opcode( this.asl, this.zpg, 2, 5, "ASL", this.d_zpg );  //Arithmetic shift left Zero Page
  this.instable[0x07] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x08] = new Opcode( this.php, null,     1, 3, "PHP", null       );  //Push processor status
  this.instable[0x09] = new Opcode( this.ora, this.imm, 2, 2, "ORA", this.d_imm );  //Or memory and accumulator
  this.instable[0x0A] = new Opcode( this.asl, this.acc, 1, 2, "ASL", this.d_acc );  //Arithmetic shift left Accumulator
  this.instable[0x0B] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x0C] = new Opcode( this.tsb, this.abs, 3, 6, "TSB", this.d_abs );  //Test and set bit in memory
  this.instable[0x0D] = new Opcode( this.ora, this.abs, 3, 4, "ORA", this.d_abs );  //Or memory and accumulator
  this.instable[0x0E] = new Opcode( this.asl, this.abs, 3, 6, "ASL", this.d_abs );  //Arithmetic shift left Absolute
  this.instable[0x0F] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x10] = new Opcode( this.bpl, this.rel, 2, 2, "BPL", this.d_rel );  //Branch on plus
  this.instable[0x11] = new Opcode( this.ora, this.iiy, 2, 5, "ORA", this.d_iiy );  //Or memory and accumulator
  this.instable[0x12] = new Opcode( this.ora, this.izp, 2, 5, "ORA", this.d_izp );  //Or memory and accumulator
  this.instable[0x13] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x14] = new Opcode( this.trb, this.zpg, 2, 5, "TRB", this.d_zpg );  //Test and reset bit in memory
  this.instable[0x15] = new Opcode( this.ora, this.zpx, 2, 4, "ORA", this.d_zpx );  //Or memory and accumulator
  this.instable[0x16] = new Opcode( this.asl, this.zpx, 2, 6, "ASL", this.d_zpx );  //Arithmetic shift left Zero Page,X
  this.instable[0x17] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x18] = new Opcode( this.clc, null,     1, 2, "CLC", null       );  //Clear carry
  this.instable[0x19] = new Opcode( this.ora, this.aby, 3, 4, "ORA", this.d_aby );  //Or memory and accumulator
  this.instable[0x1A] = new Opcode( this.inc, this.acc, 1, 2, "INA", null       );  //Increment accumulator
  this.instable[0x1B] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x1C] = new Opcode( this.trb, this.abs, 3, 6, "TRB", this.d_abs );  //Test and reset bit in memory
  this.instable[0x1D] = new Opcode( this.ora, this.abx, 3, 4, "ORA", this.d_abx );  //Or memory and accumulator
  this.instable[0x1E] = new Opcode( this.asl, this.abx, 3, 7, "ASL", this.d_abx );  //Arithmetic shift left Absolute,X
  this.instable[0x1F] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x20] = new Opcode( this.jsr, this.abs, 3, 6, "JSR", this.d_abs );  //Jump to sub routine
  this.instable[0x21] = new Opcode( this.and, this.iix, 2, 6, "AND", this.d_iix );  //And
  this.instable[0x22] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x23] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x24] = new Opcode( this.bit, this.zpg, 2, 3, "BIT", this.d_zpg );  //Bit test
  this.instable[0x25] = new Opcode( this.and, this.zpg, 2, 3, "AND", this.d_zpg );  //And
  this.instable[0x26] = new Opcode( this.rol, this.zpg, 2, 5, "ROL", this.d_zpg );  //Rotate left Zero Page
  this.instable[0x27] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x28] = new Opcode( this.plp, null,     1, 4, "PLP", null       );  //Pull processor status
  this.instable[0x29] = new Opcode( this.and, this.imm, 2, 2, "AND", this.d_imm );  //And
  this.instable[0x2A] = new Opcode( this.rol, this.acc, 1, 2, "ROL", this.d_acc );  //Rotate left Accumulator
  this.instable[0x2B] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x2C] = new Opcode( this.bit, this.abs, 3, 4, "BIT", this.d_abs );  //Bit test
  this.instable[0x2D] = new Opcode( this.and, this.abs, 3, 4, "AND", this.d_abs );  //And
  this.instable[0x2E] = new Opcode( this.rol, this.abs, 3, 6, "ROL", this.d_abs );  //Rotate left Absolute
  this.instable[0x2F] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x30] = new Opcode( this.bmi, this.rel, 2, 2, "BMI", this.d_rel );  //Branch on minus
  this.instable[0x31] = new Opcode( this.and, this.iiy, 2, 5, "AND", this.d_iiy );  //And
  this.instable[0x32] = new Opcode( this.and, this.izp, 2, 5, "AND", this.d_izp );  //And
  this.instable[0x33] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x34] = new Opcode( this.bit, this.zpx, 2, 4, "BIT", this.d_zpx );  //Bit test
  this.instable[0x35] = new Opcode( this.and, this.zpx, 2, 4, "AND", this.d_zpx );  //And
  this.instable[0x36] = new Opcode( this.rol, this.zpx, 2, 6, "ROL", this.d_zpx );  //Rotate left Zero Page,X
  this.instable[0x37] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x38] = new Opcode( this.sec, null,     1, 2, "SEC", null       );  //Set carry
  this.instable[0x39] = new Opcode( this.and, this.aby, 3, 4, "AND", this.d_aby );  //And
  this.instable[0x3A] = new Opcode( this.dec, this.acc, 1, 2, "DEA", this.d_acc );  //Decrement accumulator
  this.instable[0x3B] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x3C] = new Opcode( this.bit, this.abx, 3, 4, "BIT", this.d_abx );  //Bit test
  this.instable[0x3D] = new Opcode( this.and, this.abx, 3, 4, "AND", this.d_abx );  //And
  this.instable[0x3E] = new Opcode( this.rol, this.abx, 3, 7, "ROL", this.d_abx );  //Rotate left Absolute,X
  this.instable[0x3F] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x40] = new Opcode( this.rti, null,     1, 6, "RTI", null       );  //Return from interrupt
  this.instable[0x41] = new Opcode( this.eor, this.iix, 2, 6, "EOR", this.d_iix );  //Exclusive or memory and accumulator
  this.instable[0x42] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x43] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x44] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x45] = new Opcode( this.eor, this.zpg, 2, 3, "EOR", this.d_zpg );  //Exclusive or memory and accumulator
  this.instable[0x46] = new Opcode( this.lsr, this.zpg, 2, 5, "LSR", this.d_zpg );  //Logical shift right Zero Page
  this.instable[0x47] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x48] = new Opcode( this.pha, null,     1, 3, "PHA", null       );  //Push accumulator
  this.instable[0x49] = new Opcode( this.eor, this.imm, 2, 2, "EOR", this.d_imm );  //Exclusive or memory and accumulator
  this.instable[0x4A] = new Opcode( this.lsr, this.acc, 1, 2, "LSR", this.d_acc );  //Logical shift right Accumulator
  this.instable[0x4B] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x4C] = new Opcode( this.jmp, this.abs, 3, 3, "JMP", this.d_abs );  //Jump
  this.instable[0x4D] = new Opcode( this.eor, this.abs, 3, 4, "EOR", this.d_abs );  //Exclusive or memory and accumulator
  this.instable[0x4E] = new Opcode( this.lsr, this.abs, 3, 6, "LSR", this.d_abs );  //Logical shift right Absolute
  this.instable[0x4F] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x50] = new Opcode( this.bvc, this.rel, 2, 2, "BVC", this.d_rel );  //Branch on overflow clear
  this.instable[0x51] = new Opcode( this.eor, this.iiy, 2, 5, "EOR", this.d_iiy );  //Exclusive or memory and accumulator
  this.instable[0x52] = new Opcode( this.eor, this.izp, 2, 5, "EOR", this.d_izp );  //Exclusive or memory and accumulator
  this.instable[0x53] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x54] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x55] = new Opcode( this.eor, this.zpx, 2, 4, "EOR", this.d_zpx );  //Exclusive or memory and accumulator
  this.instable[0x56] = new Opcode( this.lsr, this.zpx, 2, 6, "LSR", this.d_zpx );  //Logical shift right Zero Page,X
  this.instable[0x57] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x58] = new Opcode( this.cli, null,     1, 2, "CLI", null       );  //Clear interrupt disable
  this.instable[0x59] = new Opcode( this.eor, this.aby, 3, 4, "EOR", this.d_aby );  //Exclusive or memory and accumulator
  this.instable[0x5A] = new Opcode( this.phy, null,     1, 3, "PHY", null       );  //Push Y
  this.instable[0x5B] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x5C] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x5D] = new Opcode( this.eor, this.abx, 3, 4, "EOR", this.d_abx );  //Exclusive or memory and accumulator
  this.instable[0x5E] = new Opcode( this.lsr, this.abx, 3, 7, "LSR", this.d_abx );  //Logical shift right Absolute,X
  this.instable[0x5F] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x60] = new Opcode( this.rts, null,     1, 6, "RTS", null       );  //Return from subroutine
  this.instable[0x61] = new Opcode( this.adc, this.iix, 2, 6, "ADC", this.d_iix );  //Add carry
  this.instable[0x62] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x63] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x64] = new Opcode( this.stz, this.zpg, 2, 3, "STZ", this.d_zpg );  //Store zero in memory
  this.instable[0x65] = new Opcode( this.adc, this.zpg, 2, 3, "ADC", this.d_zpg );  //Add carry
  this.instable[0x66] = new Opcode( this.ror, this.zpg, 2, 5, "ROR", this.d_zpg );  //Rotate right Zero Page
  this.instable[0x67] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x68] = new Opcode( this.pla, null,     1, 4, "PLA", null       );  //Pull accumulator
  this.instable[0x69] = new Opcode( this.adc, this.imm, 2, 2, "ADC", this.d_imm );  //Add carry
  this.instable[0x6A] = new Opcode( this.ror, this.acc, 1, 2, "ROR", this.d_acc );  //Rotate right Accumulator
  this.instable[0x6B] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x6C] = new Opcode( this.jmp, this.ind, 3, 6, "JMP", this.d_ind );  //Jump
  this.instable[0x6D] = new Opcode( this.adc, this.abs, 3, 4, "ADC", this.d_abs );  //Add carry
  this.instable[0x6E] = new Opcode( this.ror, this.abs, 3, 6, "ROR", this.d_abs );  //Rotate right Absolute
  this.instable[0x6F] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x70] = new Opcode( this.bvs, this.rel, 2, 2, "BVS", this.d_rel );  //Branch on overflow set
  this.instable[0x71] = new Opcode( this.adc, this.iiy, 2, 5, "ADC", this.d_iiy );  //Add carry
  this.instable[0x72] = new Opcode( this.adc, this.izp, 2, 5, "ADC", this.d_izp );  //Add carry
  this.instable[0x73] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x74] = new Opcode( this.stz, this.zpx, 2, 4, "STZ", this.d_zpx );  //Store zero in memory
  this.instable[0x75] = new Opcode( this.adc, this.zpx, 2, 4, "ADC", this.d_zpx );  //Add carry
  this.instable[0x76] = new Opcode( this.ror, this.zpx, 2, 6, "ROR", this.d_zpx );  //Rotate right Zero Page,X
  this.instable[0x77] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x78] = new Opcode( this.sei, null,     1, 2, "SEI", null       );  //Set interrupt disable
  this.instable[0x79] = new Opcode( this.adc, this.aby, 3, 4, "ADC", this.d_aby );  //Add carry
  this.instable[0x7A] = new Opcode( this.ply, null,     1, 4, "PLY", null       );  //Pull Y
  this.instable[0x7B] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x7C] = new Opcode( this.jmp, this.aix, 3, 6, "JMP", this.d_aix );  //Jump
  this.instable[0x7D] = new Opcode( this.adc, this.abx, 3, 4, "ADC", this.d_abx );  //Add carry
  this.instable[0x7E] = new Opcode( this.ror, this.abx, 3, 7, "ROR", this.d_abx );  //Rotate right Absolute,X
  this.instable[0x7F] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x80] = new Opcode( this.bra, this.rel, 2, 2, "BRA", this.d_rel );  //Branch always
  this.instable[0x81] = new Opcode( this.sta, this.iix, 2, 6, "STA", this.d_iix );  //Store accumulator in memory
  this.instable[0x82] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x83] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x84] = new Opcode( this.sty, this.zpg, 2, 3, "STY", this.d_zpg );  //Store Y in memory
  this.instable[0x85] = new Opcode( this.sta, this.zpg, 2, 3, "STA", this.d_zpg );  //Store accumulator in memory
  this.instable[0x86] = new Opcode( this.stx, this.zpg, 2, 3, "STX", this.d_zpg );  //Store X in memory
  this.instable[0x87] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x88] = new Opcode( this.dey, null,     1, 2, "DEY", null       );  //Decrement Y
  this.instable[0x89] = new Opcode( this.bit, this.imm, 2, 2, "BIT", this.d_imm );  //Bit test
  this.instable[0x8A] = new Opcode( this.txa, null,     1, 2, "TXA", null       );  //Transfer X to Accumulator
  this.instable[0x8B] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x8C] = new Opcode( this.sty, this.abs, 3, 4, "STY", this.d_abs );  //Store Y in memory
  this.instable[0x8D] = new Opcode( this.sta, this.abs, 3, 4, "STA", this.d_abs );  //Store accumulator in memory
  this.instable[0x8E] = new Opcode( this.stx, this.abs, 3, 4, "STX", this.d_abs );  //Store X in memory
  this.instable[0x8F] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x90] = new Opcode( this.bcc, this.rel, 2, 2, "BCC", this.d_rel );  //Branch on carry clear
  this.instable[0x91] = new Opcode( this.sta, this.iiy, 2, 6, "STA", this.d_iiy );  //Store accumulator in memory
  this.instable[0x92] = new Opcode( this.sta, this.izp, 2, 5, "STA", this.d_izp );  //Store accumulator in memory
  this.instable[0x93] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x94] = new Opcode( this.sty, this.zpx, 2, 4, "STY", this.d_zpx );  //Store Y in memory
  this.instable[0x95] = new Opcode( this.sta, this.zpx, 2, 4, "STA", this.d_zpx );  //Store accumulator in memory
  this.instable[0x96] = new Opcode( this.stx, this.zpy, 2, 4, "STX", this.d_zpy );  //Store X in memory
  this.instable[0x97] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x98] = new Opcode( this.tya, null,     1, 2, "TYA", null       );  //Transfer Y to Accumulator
  this.instable[0x99] = new Opcode( this.sta, this.aby, 3, 5, "STA", this.d_aby );  //Store accumulator in memory
  this.instable[0x9A] = new Opcode( this.txs, null,     1, 2, "TXS", null       );  //Transfer X to stack pointer
  this.instable[0x9B] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0x9C] = new Opcode( this.stz, this.abs, 3, 4, "STZ", this.d_abs );  //Store zero in memory
  this.instable[0x9D] = new Opcode( this.sta, this.abx, 3, 5, "STA", this.d_abx );  //Store accumulator in memory
  this.instable[0x9E] = new Opcode( this.stz, this.abx, 3, 5, "STZ", this.d_abx );  //Store zero in memory
  this.instable[0x9F] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xA0] = new Opcode( this.ldy, this.imm, 2, 2, "LDY", this.d_imm );  //Load y with memory
  this.instable[0xA1] = new Opcode( this.lda, this.iix, 2, 6, "LDA", this.d_iix );  //Load accumulator with memory
  this.instable[0xA2] = new Opcode( this.ldx, this.imm, 2, 2, "LDX", this.d_imm );  //Load x with memory
  this.instable[0xA3] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xA4] = new Opcode( this.ldy, this.zpg, 2, 3, "LDY", this.d_zpg );  //Load y with memory
  this.instable[0xA5] = new Opcode( this.lda, this.zpg, 2, 3, "LDA", this.d_zpg );  //Load accumulator with memory
  this.instable[0xA6] = new Opcode( this.ldx, this.zpg, 2, 3, "LDX", this.d_zpg );  //Load x with memory
  this.instable[0xA7] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xA8] = new Opcode( this.tay, null,     1, 2, "TAY", null       );  //Transfer Accumulator to Y
  this.instable[0xA9] = new Opcode( this.lda, this.imm, 2, 2, "LDA", this.d_imm );  //Load accumulator with memory
  this.instable[0xAA] = new Opcode( this.tax, null,     1, 2, "TAX", null       );  //Transfer Accumulator to X
  this.instable[0xAB] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xAC] = new Opcode( this.ldy, this.abs, 3, 4, "LDY", this.d_abs );  //Load y with memory
  this.instable[0xAD] = new Opcode( this.lda, this.abs, 3, 4, "LDA", this.d_abs );  //Load accumulator with memory
  this.instable[0xAE] = new Opcode( this.ldx, this.abs, 3, 4, "LDX", this.d_abs );  //Load x with memory
  this.instable[0xAF] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xB0] = new Opcode( this.bcs, this.rel, 2, 2, "BCS", this.d_rel );  //Branch on carry set
  this.instable[0xB1] = new Opcode( this.lda, this.iiy, 2, 5, "LDA", this.d_iiy );  //Load accumulator with memory
  this.instable[0xB2] = new Opcode( this.lda, this.izp, 2, 5, "LDA", this.d_izp );  //Load accumulator with memory
  this.instable[0xB3] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xB4] = new Opcode( this.ldy, this.zpx, 2, 4, "LDY", this.d_zpx );  //Load y with memory
  this.instable[0xB5] = new Opcode( this.lda, this.zpx, 2, 4, "LDA", this.d_zpx );  //Load accumulator with memory
  this.instable[0xB6] = new Opcode( this.ldx, this.zpy, 2, 4, "LDX", this.d_zpy );  //Load x with memory
  this.instable[0xB7] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xB8] = new Opcode( this.clv, null,     1, 2, "CLV", null       );  //Clear overflow
  this.instable[0xB9] = new Opcode( this.lda, this.aby, 3, 4, "LDA", this.d_aby );  //Load accumulator with memory
  this.instable[0xBA] = new Opcode( this.tsx, null,     1, 2, "TSX", null       );  //Transfer stack pointer to X
  this.instable[0xBB] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xBC] = new Opcode( this.ldy, this.abx, 3, 4, "LDY", this.d_abx );  //Load y with memory
  this.instable[0xBD] = new Opcode( this.lda, this.abx, 3, 4, "LDA", this.d_abx );  //Load accumulator with memory
  this.instable[0xBE] = new Opcode( this.ldx, this.aby, 3, 4, "LDX", this.d_aby );  //Load x with memory
  this.instable[0xBF] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xC0] = new Opcode( this.cpy, this.imm, 2, 2, "CPY", this.d_imm );  //Compare memory and Y
  this.instable[0xC1] = new Opcode( this.cmp, this.iix, 2, 6, "CMP", this.d_iix );  //Compare memory and accumulator
  this.instable[0xC2] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xC3] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xC4] = new Opcode( this.cpy, this.zpg, 2, 3, "CPY", this.d_zpg );  //Compare memory and Y
  this.instable[0xC5] = new Opcode( this.cmp, this.zpg, 2, 3, "CMP", this.d_zpg );  //Compare memory and accumulator
  this.instable[0xC6] = new Opcode( this.dec, this.zpg, 2, 5, "DEC", this.d_zpg );  //Decrement memory
  this.instable[0xC7] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xC8] = new Opcode( this.iny, null,     1, 2, "INY", null       );  //Increment Y
  this.instable[0xC9] = new Opcode( this.cmp, this.imm, 2, 2, "CMP", this.d_imm );  //Compare memory and accumulator
  this.instable[0xCA] = new Opcode( this.dex, null,     1, 2, "DEX", null       );  //Decrement X
  this.instable[0xCB] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xCC] = new Opcode( this.cpy, this.abs, 3, 4, "CPY", this.d_abs );  //Compare memory and Y
  this.instable[0xCD] = new Opcode( this.cmp, this.abs, 3, 4, "CMP", this.d_abs );  //Compare memory and accumulator
  this.instable[0xCE] = new Opcode( this.dec, this.abs, 3, 6, "DEC", this.d_abs );  //Decrement memory
  this.instable[0xCF] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xD0] = new Opcode( this.bne, this.rel, 2, 2, "BNE", this.d_rel );  //Branch on not equal
  this.instable[0xD1] = new Opcode( this.cmp, this.iiy, 2, 5, "CMP", this.d_iiy );  //Compare memory and accumulator
  this.instable[0xD2] = new Opcode( this.cmp, this.izp, 2, 5, "CMP", this.d_izp );  //Compare memory and accumulator
  this.instable[0xD3] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xD4] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xD5] = new Opcode( this.cmp, this.zpx, 2, 4, "CMP", this.d_zpx );  //Compare memory and accumulator
  this.instable[0xD6] = new Opcode( this.dec, this.zpx, 2, 6, "DEC", this.d_zpx );  //Decrement memory
  this.instable[0xD7] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xD8] = new Opcode( this.cld, null,     1, 2, "CLD", null       );  //Clear decimal
  this.instable[0xD9] = new Opcode( this.cmp, this.aby, 3, 4, "CMP", this.d_aby );  //Compare memory and accumulator
  this.instable[0xDA] = new Opcode( this.phx, null,     1, 3, "PHX", null       );  //Push X
  this.instable[0xDB] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xDC] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xDD] = new Opcode( this.cmp, this.abx, 3, 4, "CMP", this.d_abx );  //Compare memory and accumulator
  this.instable[0xDE] = new Opcode( this.dec, this.abx, 3, 7, "DEC", this.d_abx );  //Decrement memory
  this.instable[0xDF] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xE0] = new Opcode( this.cpx, this.imm, 2, 2, "CPX", this.d_imm );  //Compare memory and X
  this.instable[0xE1] = new Opcode( this.sbc, this.iix, 2, 6, "SBC", this.d_iix );  //Subtract memory from accumulator
  this.instable[0xE2] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xE3] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xE4] = new Opcode( this.cpx, this.zpg, 2, 3, "CPX", this.d_zpg );  //Compare memory and X
  this.instable[0xE5] = new Opcode( this.sbc, this.zpg, 2, 3, "SBC", this.d_zpg );  //Subtract memory from accumulator
  this.instable[0xE6] = new Opcode( this.inc, this.zpg, 2, 5, "INC", this.d_zpg );  //Increment memory
  this.instable[0xE7] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xE8] = new Opcode( this.inx, null,     1, 2, "INX", null       );  //Increment X
  this.instable[0xE9] = new Opcode( this.sbc, this.imm, 2, 2, "SBC", this.d_imm );  //Subtract memory from accumulator
  this.instable[0xEA] = new Opcode( this.nop, null,     1, 2, "NOP", null       );  //No operation
  this.instable[0xEB] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xEC] = new Opcode( this.cpx, this.abs, 3, 4, "CPX", this.d_abs );  //Compare memory and X
  this.instable[0xED] = new Opcode( this.sbc, this.abs, 3, 4, "SBC", this.d_abs );  //Subtract memory from accumulator
  this.instable[0xEE] = new Opcode( this.inc, this.abs, 3, 6, "INC", this.d_abs );  //Increment memory
  this.instable[0xEF] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xF0] = new Opcode( this.beq, this.rel, 2, 2, "BEQ", this.d_rel );  //Branch on equal
  this.instable[0xF1] = new Opcode( this.sbc, this.iiy, 2, 5, "SBC", this.d_iiy );  //Subtract memory from accumulator
  this.instable[0xF2] = new Opcode( this.sbc, this.izp, 2, 5, "SBC", this.d_izp );  //Subtract memory from accumulator
  this.instable[0xF3] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xF4] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xF5] = new Opcode( this.sbc, this.zpx, 2, 4, "SBC", this.d_zpx );  //Subtract memory from accumulator
  this.instable[0xF6] = new Opcode( this.inc, this.zpx, 2, 6, "INC", this.d_zpx );  //Increment memory
  this.instable[0xF7] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xF8] = new Opcode( this.sed, null,     1, 2, "SED", null       );  //Set decimal
  this.instable[0xF9] = new Opcode( this.sbc, this.aby, 3, 4, "SBC", this.d_aby );  //Subtract memory from accumulator
  this.instable[0xFA] = new Opcode( this.plx, null,     1, 4, "PLX", null       );  //Pull X
  this.instable[0xFB] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xFC] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
  this.instable[0xFD] = new Opcode( this.sbc, this.abx, 3, 4, "SBC", this.d_abx );  //Subtract memory from accumulator
  this.instable[0xFE] = new Opcode( this.inc, this.abx, 3, 7, "INC", this.d_abx );  //Increment memory
  this.instable[0xFF] = new Opcode( null,     null,     1, 0, null,  null       );  //Future expansion
}

//------------------------------------------------------------------------------------------------------------------------------
// Disassembly addressing mode functions
//------------------------------------------------------------------------------------------------------------------------------

//Immediate addressing
CPU65C02.prototype.d_imm = function(cpu, address)
{
  var op = cpu.mem[address] + 0x100;

  return("#$" + op.toString(16).slice(-2).toUpperCase());
};

//Accumulator addressing
CPU65C02.prototype.d_acc = function(cpu, address)
{
  return("A");
};

//Zero page addressing
CPU65C02.prototype.d_zpg = function(cpu, address)
{
  var op = cpu.mem[address] + 0x100;

  return("$" + op.toString(16).slice(-2).toUpperCase());
};

//Zero page indexed x addressing
CPU65C02.prototype.d_zpx = function(cpu, address)
{
  var op = cpu.mem[address] + 0x100;

  return("$" + op.toString(16).slice(-2).toUpperCase() + ",X");
};

//Zero page indexed y addressing
CPU65C02.prototype.d_zpy = function(cpu, address)
{
  var op = cpu.mem[address] + 0x100;

  return("$" + op.toString(16).slice(-2).toUpperCase() + ",Y");
};

//Zero page indirect addressing
CPU65C02.prototype.d_izp = function(cpu, address)
{
  var op = cpu.mem[address] + 0x100;

  return("($" + op.toString(16).slice(-2).toUpperCase() + ")");
};

//Absolute addressing
CPU65C02.prototype.d_abs = function(cpu, address)
{
  var op = cpu.mem[address++] + (cpu.mem[address & 0xFFFF] << 8) + 0x10000;

  return("$" + op.toString(16).slice(-4).toUpperCase());
};

//Absolute indexed x addressing
CPU65C02.prototype.d_abx = function(cpu, address)
{
  var op = cpu.mem[address++] + (cpu.mem[address & 0xFFFF] << 8) + 0x10000;

  return("$" + op.toString(16).slice(-4).toUpperCase() + ",X");
};

//Absolute indexed y addressing
CPU65C02.prototype.d_aby = function(cpu, address)
{
  var op = cpu.mem[address++] + (cpu.mem[address & 0xFFFF] << 8) + 0x10000;

  return("$" + op.toString(16).slice(-4).toUpperCase() + ",Y");
};

//Absolute indirect addressing
CPU65C02.prototype.d_ind = function(cpu, address)
{
  var op = cpu.mem[address++] + (cpu.mem[address & 0xFFFF] << 8) + 0x10000;

  return("($" + op.toString(16).slice(-4).toUpperCase() + ")");
};

//Zero page indirect indexed x addressing
CPU65C02.prototype.d_iix = function(cpu, address)
{
  var op = cpu.mem[address] + 0x100;

  return("($" + op.toString(16).slice(-2).toUpperCase() + ",X)");
};

//Zero page indirect indexed y addressing
CPU65C02.prototype.d_iiy = function(cpu, address)
{
  var op = cpu.mem[address] + 0x100;

  return("($" + op.toString(16).slice(-2).toUpperCase() + "),Y");
};

//Relative addressing
CPU65C02.prototype.d_rel = function(cpu, address)
{
  var op = cpu.mem[address++];

  //When most siginificant bit of the operand byte is set the jump is backwards
  if(op >= 128)
    op -= 256;

  op = address + op + 0x10000;

  return("$" + op.toString(16).slice(-4).toUpperCase());
};

//-----------------------------------------------------------------------------
// Disassembly function
//-----------------------------------------------------------------------------
CPU65C02.prototype.disassemble = function(object)
{
  var  address = object.address;
  var  ins;

  //Print the hexadecimal instruction addres in the result string
  object.string = (address + 0x10000).toString(16).slice(-4).toUpperCase() + ": ";

  //Get the instruction byte and the two possible operands
  ins = this.mem[address++];

  //Check if valid instruction
  if(this.instable[ins].opc)
  {
    //Add the instruction mnenomic to the result string
    object.string += this.instable[ins].opc;

    //Check if this instruction has operands
    if(this.instable[ins].ops)
      object.string +=  "  " + this.instable[ins].ops(this, address & 0xFFFF);
  }
  else
    object.string += "???";

  //Point to next instruction and keep in range of 0x0000 to 0xFFFF
  object.address += this.instable[ins].nbt;
  object.address &= 0xFFFF;
};

//------------------------------------------------------------------------------------------------------------------------------
//Main CPU function
//------------------------------------------------------------------------------------------------------------------------------
CPU65C02.prototype.run = function()
{
  var stop = false;

  //Run burst of ~ 10000 cycles
  this.cycles = 0;

  while((this.cycles < 10000) && (stop == false))
  {
    //Check if CPU is being reset
    if(this.reset == true)
    {
      //Reset the core
      this.a = 0;
      this.x = 0;
      this.y = 0;
      this.s = 0;

      this.n = 0;
      this.z = 1;
      this.c = 0;
      this.v = 0;
      this.b = 0;
      this.i = 0;
      this.d = 0;

      this.pc = this.mem[0xFFFC] + (this.mem[0xFFFD] << 8);

      this.address = this.pc;

      //Only reset once
      this.reset = false;
    }
    else
    {
      //Check non maskable interrupt
      if(this.nmi == true)
      {
        //Save the program counter and flags
        this.push(this.pc >> 8);
        this.push(this.pc & 0xFF);
        this.pushflags(0);

        //Set the program counter to the vector content
        this.pc = this.mem[0xFFFA] + (this.mem[0xFFFB] << 8);

        //Disable further interrupts
        this.i = 1;

        //Edge triggered so self clearing of the flag
        this.nmi = false;
      }
      //Check if interrupt request
      else if((this.irq == true) && (this.i == 0))
      {
        //Save the program counter and flags
        this.push(this.pc >> 8);
        this.push(this.pc & 0xFF);
        this.pushflags(0);

        //Set the program counter to the vector content
        this.pc = this.mem[0xFFFE] + (this.mem[0xFFFF] << 8);

        //Disable further interrupts
        this.i = 1;
      }

      //Get the current instruction
      this.opcode = this.mem[this.pc++];
      this.pc &= 0xFFFF;

      //Add to the total cycles had so far
      this.cycles += this.instable[this.opcode].ncl;

      //Set default memory access mode specifier to both read and write
      this.mam = 3;

      //Handle the addressing mode
      if(this.instable[this.opcode].amd)
        this.instable[this.opcode].amd(this);

      //Check on peripheral addresses when needed
      if((this.pcheck) && (this.coa == true))
         this.pcheck(this);

      //Process the instruction
      if(this.instable[this.opcode].ins)
        this.instable[this.opcode].ins(this);

      //Add cycles had to tape and delay cycles
//      this.TapeCycles += this.cycles;
//      this.DelayCycles += this.cycles;

      //Keep account on how many instructions processed
//      this.opcodesDone++;

      //Check if peripheral handling is selected and needed
      if((this.phandle) && (this.pmode != 0))
        this.phandle(this);
    }

    //Check if there is a man machine interface connected
    if(this.mmi)
    {
      //Show the user what went on
      this.mmi(this);

      //Stop running in bursts
      stop = true;
    }
/*
    //Check if stepping
    if(this.Steps)
    {
       //One step done
       this.Steps--;

       //Check if finished
       if(this.Steps == 0)
          return;
    }
*/
  }
};

//------------------------------------------------------------------------------------------------------------------------------
//Addressing mode handling functions
//
// this.coa is to indicate if peripherals need to be checked or not
// this.data is used to send data to the instruction code
// this.write is used to pass a function to be used in the instruction code for write back
// this.pc when incremented needs to be kept between 0x0000 and 0xFFFF
//
// For zero page actions the index and resulting addresses need to be kept between 0x00 and 0xFF
//------------------------------------------------------------------------------------------------------------------------------
//Accumulator addressing
CPU65C02.prototype.acc = function(cpu)
{
  cpu.coa = false;
  cpu.write = cpu.writeacc;
  cpu.data = cpu.a;
};

//Immediate addressing
CPU65C02.prototype.imm = function(cpu)
{
  cpu.coa = false;
  cpu.data = cpu.mem[cpu.pc++];
  cpu.pc &= 0xFFFF;
  cpu.write = null;
};

//Zero page addressing
CPU65C02.prototype.zpg = function(cpu)
{
  cpu.coa = true;
  cpu.address = cpu.mem[cpu.pc++];
  cpu.pc &= 0xFFFF;
  cpu.write = cpu.writemem;
  cpu.data = cpu.mem[cpu.address];
};

//Zero page indexed x addressing
CPU65C02.prototype.zpx = function(cpu)
{
  cpu.coa = true;
  cpu.address = (cpu.mem[cpu.pc++] + cpu.x) & 0xFF;
  cpu.pc &= 0xFFFF;
  cpu.write = cpu.writemem;
  cpu.data = cpu.mem[cpu.address];
};

//Zero page indexed y addressing
CPU65C02.prototype.zpy = function(cpu)
{
  cpu.coa = true;
  cpu.address = (cpu.mem[cpu.pc++] + cpu.y) & 0xFF;
  cpu.pc &= 0xFFFF;
  cpu.write = cpu.writemem;
  cpu.data = cpu.mem[cpu.address];
};

//Indirect addressing (Only used for jumps so no data handling)
CPU65C02.prototype.ind = function(cpu)
{
  cpu.coa = false;
  cpu.tmp = cpu.mem[cpu.pc++] + (cpu.mem[cpu.pc++ & 0xFFFF] << 8);
  cpu.pc &= 0xFFFF;
  cpu.address = cpu.mem[cpu.tmp++] + (cpu.mem[cpu.tmp & 0xFFFF] << 8);
};

//Zero page indirect addressing
CPU65C02.prototype.izp = function(cpu)
{
  cpu.coa = true;
  cpu.tmp = cpu.mem[cpu.pc++];
  cpu.pc &= 0xFFFF;
  cpu.address = cpu.mem[cpu.tmp++] + (cpu.mem[cpu.tmp & 0xFF] << 8);
  cpu.write = cpu.writemem;
  cpu.data = cpu.mem[cpu.address];
};

//Zero page indirect indexed x addressing
CPU65C02.prototype.izx = function(cpu)
{
  cpu.coa = true;
  cpu.tmp = (cpu.mem[cpu.pc++] + cpu.x) & 0xFF;
  cpu.pc &= 0xFFFF;
  cpu.address = cpu.mem[cpu.tmp++] + (cpu.mem[cpu.tmp & 0xFF] << 8);
  cpu.write = cpu.writemem;
  cpu.data = cpu.mem[cpu.address];
};

//Zero page indirect indexed y addressing
CPU65C02.prototype.iiy = function(cpu)
{
  cpu.coa = true;
  cpu.tmp = cpu.mem[cpu.pc++];
  cpu.pc &= 0xFFFF;
  cpu.address = ((cpu.mem[cpu.tmp++] + (cpu.mem[cpu.tmp & 0xFF] << 8)) + cpu.y) & 0xFFFF;
  cpu.write = cpu.writemem;
  cpu.data = cpu.mem[cpu.address];
};

//Relative addressing (Only used for jumps so no data handling)
CPU65C02.prototype.rel = function(cpu)
{
  cpu.coa = false;
  cpu.tmp = cpu.mem[cpu.pc++];
  cpu.pc &= 0xFFFF;

  if(cpu.tmp >= 128)
    cpu.tmp -= 256;

  cpu.address = (cpu.pc + cpu.tmp) & 0xFFFF;
};

//Absolute addressing
CPU65C02.prototype.abs = function(cpu)
{
  cpu.coa = true;
  cpu.address = cpu.mem[cpu.pc++] + (cpu.mem[cpu.pc++ & 0xFFFF] << 8);
  cpu.pc &= 0xFFFF;
  cpu.write = cpu.writemem;
  cpu.data = cpu.mem[cpu.address];
};

//Absolute indexed x addressing
CPU65C02.prototype.abx = function(cpu)
{
  cpu.coa = true;
  cpu.address = ((cpu.mem[cpu.pc++] + (cpu.mem[cpu.pc++ & 0xFFFF] << 8)) + cpu.x) & 0xFFFF;
  cpu.pc &= 0xFFFF;
  cpu.write = cpu.writemem;
  cpu.data = cpu.mem[cpu.address];
};

//Absolute indexed y addressing
CPU65C02.prototype.aby = function(cpu)
{
  cpu.coa = true;
  cpu.address = ((cpu.mem[cpu.pc++] + (cpu.mem[cpu.pc++ & 0xFFFF] << 8)) + cpu.y) & 0xFFFF;
  cpu.pc &= 0xFFFF;
  cpu.write = cpu.writemem;
  cpu.data = cpu.mem[cpu.address];
};

//------------------------------------------------------------------------------------------------------------------------------
// Support functions
//------------------------------------------------------------------------------------------------------------------------------
CPU65C02.prototype.writeacc = function(cpu, data)
{
  cpu.a = data;
  cpu.data = data;
};

CPU65C02.prototype.writemem = function(cpu, data)
{
  cpu.mem[cpu.address] = data;
  cpu.data = data;
};

CPU65C02.prototype.pushflags = function(brk)
{
  var f = (this.n << 7) | (this.v << 6) | 0x20 | brk | (this.d << 3) | (this.i << 2) | this.z << 1 | this.c;

  this.mem[this.s + 0x100] = f;
  this.s = (this.s - 1) & 0xFF;
};

CPU65C02.prototype.pullflags = function()
{
  var f;

  this.s = (this.s + 1) & 0xFF;
  f = this.mem[this.s + 0x100];

  this.n = f >> 7 & 0x01;
  this.v = f >> 6 & 0x01;
  this.b = f >> 4 & 0x01;
  this.d = f >> 3 & 0x01;
  this.i = f >> 2 & 0x01;
  this.z = f >> 1 & 0x01;
  this.c = f & 0x01;
};

CPU65C02.prototype.push = function(data)
{
  this.mem[this.s + 0x100] = data;
  this.s = (this.s - 1) & 0xFF;
};

CPU65C02.prototype.pull = function()
{
  this.s = (this.s + 1) & 0xFF;
  return(this.mem[this.s + 0x100]);
};

//------------------------------------------------------------------------------------------------------------------------------
// Instruction handling functions
//------------------------------------------------------------------------------------------------------------------------------
CPU65C02.prototype.adc = function(cpu)
{
  var acc;
  var data = 0xFF;
  var toadd;
  var result;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
     data = cpu.data;

  //Check if decimal mode set
  if(cpu.d)
  {
    toadd  = (data >> 4) * 10;
    toadd += (data & 0x0F);
    acc    = (cpu.a >> 4) * 10;
    acc   += (cpu.a & 0x0F);
    result = acc + toadd + cpu.c;
    cpu.c = (result > 99) ? 1: 0;
    cpu.a = (((result / 10) % 10) << 4) | (result % 10);
  }
  else
  {
    result = cpu.a + data + cpu.c;
    cpu.c = (result > 0xFF) ? 1: 0;
    cpu.v = (((cpu.a & 0x80) == (data & 0x80)) && ((cpu.a & 0x80) != (result & 0x80))) ? 1: 0;
    cpu.a = result & 0xFF;
  }

  //Adjust the related flags
  cpu.n = (cpu.a & 0x80) ? 1: 0;
  cpu.z = cpu.a ? 0: 1;

  //Set the peripheral control mode to read
  cpu.pmode = 1;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.and = function(cpu)
{
  var data = 0xFF;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data;

  //And the data to the accumulator
  cpu.a &= data;

  //Adjust the related flags
  cpu.n = (cpu.a & 0x80) ? 1: 0;
  cpu.z = cpu.a ? 0: 1;

  //Set the peripheral control mode to read
  cpu.pmode = 1;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.asl = function(cpu)
{
  var data = 0xFF;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data;

  //Shift one bit left
  data <<= 1;

  //Check on memory access mode if location is writable
  if(cpu.write && (cpu.mam & 2))
    cpu.write(cpu, data & 0xFF);

  //Adjust the related flags
  cpu.c = (data & 0x0100) ? 1: 0;
  cpu.n = (data & 0x80) ? 1: 0;
  cpu.z = data ? 0: 1;

  //Set the peripheral control mode to both
  cpu.pmode = 3;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.bcc = function(cpu)
{
  //Check if carry flag is cleared
  if(cpu.c == 0)
  {
    //Check if page boundary is crossed
    if((cpu.pc & 0xFF00) != (cpu.address & 0xFF00))
    {
      //If so add two additional clock cycles
      cpu.cycles += 2;
    }
    else
    {
      //Else add just one additional clock cycle
      cpu.cycles++;
    }

    //Jump to the new address
    cpu.pc = cpu.address;
  }

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.bcs = function(cpu)
{
  //Check if carry flag is cleared
  if(cpu.c == 1)
  {
    //Check if page boundary is crossed
    if((cpu.pc & 0xFF00) != (cpu.address & 0xFF00))
    {
      //If so add two additional clock cycles
      cpu.cycles += 2;
    }
    else
    {
      //Else add just one additional clock cycle
      cpu.cycles++;
    }

    //Jump to the new address
    cpu.pc = cpu.address;
  }

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.beq = function(cpu)
{
  //Check if zero flag is set
  if(cpu.z == 1)
  {
    //Check if page boundary is crossed
    if((cpu.pc & 0xFF00) != (cpu.address & 0xFF00))
    {
      //If so add two additional clock cycles
      cpu.cycles += 2;
    }
    else
    {
      //Else add just one additional clock cycle
      cpu.cycles++;
    }

    //Jump to the new address
    cpu.pc = cpu.address;
  }

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.bit = function(cpu)
{
  var data = 0xFF;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
     data = cpu.data;

  //Adjust the zero flag based on the anding of the accumulator and the data
  cpu.z = (cpu.a & data) ? 0: 1;

  //Take care of immediate mode for which this is not done (65C02)
  if(cpu.opcode != 0x89)
  {
    //Adjust the other related flags
    cpu.n = (data & 0x80) ? 1: 0;
    cpu.v = (data & 0x40) ? 1: 0;
  }

  //Set the peripheral control mode to read
  cpu.pmode = 1;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.bmi = function(cpu)
{
  //Check if sign flag is set
  if(cpu.n == 1)
  {
    //Check if page boundary is crossed
    if((cpu.pc & 0xFF00) != (cpu.address & 0xFF00))
    {
      //If so add two additional clock cycles
      cpu.cycles += 2;
    }
    else
    {
      //Else add just one additional clock cycle
      cpu.cycles++;
    }

    //Jump to the new address
    cpu.pc = cpu.address;
  }

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.bne = function(cpu)
{
  //Check if zero flag is cleared
  if(cpu.z == 0)
  {
    //Check if page boundary is crossed
    if((cpu.pc & 0xFF00) != (cpu.address & 0xFF00))
    {
      //If so add two additional clock cycles
      cpu.cycles += 2;
    }
    else
    {
      //Else add just one additional clock cycle
      cpu.cycles++;
    }

    //Jump to the new address
    cpu.pc = cpu.address;
  }

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.bpl = function(cpu)
{
  //Check if sign flag is cleared
  if(cpu.n == 0)
  {
    //Check if page boundary is crossed
    if((cpu.pc & 0xFF00) != (cpu.address & 0xFF00))
    {
      //If so add two additional clock cycles
      cpu.cycles += 2;
    }
    else
    {
      //Else add just one additional clock cycle
      cpu.cycles++;
    }

    //Jump to the new address
    cpu.pc = cpu.address;
  }

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.bra = function(cpu)
{
  //Check if page boundary is crossed
  if((cpu.pc & 0xFF00) != (cpu.address & 0xFF00))
  {
    //If so add one additional clock cycle
    cpu.cycles++;
  }

  //Jump to the new address
  cpu.pc = cpu.address;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.brk = function(cpu)
{
  //One byte extra in break instruction
  cpu.pc = (cpu.pc + 1) & 0xFFFF;

  //Push the current location on stack
  cpu.push(cpu.pc >> 8);
  cpu.push(cpu.pc & 0xFF);

  //Push the status with the break flag set on stack
  cpu.pushflags(0x10);

  //Disable the interrupts
  cpu.i = 1;

  //Get the new addres from the interrupt vector
  cpu.pc = cpu.mem[0xFFFE] + (cpu.mem[0xFFFF] << 8);

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.bvc = function(cpu)
{
  //Check if overflow flag is cleared
  if(cpu.v == 0)
  {
    //Check if page boundary is crossed
    if((cpu.pc & 0xFF00) != (cpu.address & 0xFF00))
    {
      //If so add two additional clock cycles
      cpu.cycles += 2;
    }
    else
    {
      //Else add just one additional clock cycle
      cpu.cycles++;
    }

    //Jump to the new address
    cpu.pc = cpu.address;
  }

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.bvs = function(cpu)
{
  //Check if overflow flag is set
  if(cpu.v == 1)
  {
    //Check if page boundary is crossed
    if((cpu.pc & 0xFF00) != (cpu.address & 0xFF00))
    {
      //If so add two additional clock cycles
      cpu.cycles += 2;
    }
    else
    {
      //Else add just one additional clock cycle
      cpu.cycles++;
    }

    //Jump to the new address
    cpu.pc = cpu.address;
  }

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.clc = function(cpu)
{
  //Clear the carry flag
  cpu.c = 0;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.cld = function(cpu)
{
  //Clear the decimal flag
  cpu.d = 0;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.cli = function(cpu)
{
  //Clear the interrupt flag
  cpu.i = 0;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.clv = function(cpu)
{
  //Clear the overflow flag
  cpu.v = 0;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.cmp = function(cpu)
{
  var data = 0xFF;
  var result;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data;

  //Get compare info by subtracting the data from the accumulator
  result = cpu.a - data;

  //Adjust the related flags based on the result
  cpu.c = (result & 0x100) ? 0: 1;
  cpu.n = (result & 0x80) ? 1: 0;
  cpu.z = result ? 0: 1;

  //Set the peripheral control mode to read
  cpu.pmode = 1;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.cpx = function(cpu)
{
  var data = 0xFF;
  var result;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
     data = cpu.data;

  //Get compare info by subtracting the data from the x register
  result = cpu.x - data;

  //Adjust the related flags based on the result
  cpu.c = (result & 0x100) ? 0: 1;
  cpu.n = (result & 0x80) ? 1: 0;
  cpu.z = result ? 0: 1;

  //Set the peripheral control mode to read
  cpu.pmode = 1;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.cpy = function(cpu)
{
  var data = 0xFF;
  var result;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data;

  //Get compare info by subtracting the data from the x register
  result = cpu.y - data;

  //Adjust the related flags based on the result
  cpu.c = (result & 0x100) ? 0: 1;
  cpu.n = (result & 0x80) ? 1: 0;
  cpu.z = result ? 0: 1;

  //Set the peripheral control mode to read
  cpu.pmode = 1;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.dec = function(cpu)
{
  var data = 0xFF;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data;

  //Decrement the intended data
  data -= 1;

  //Check on memory access mode if location is writable
  if(cpu.write && (cpu.mam & 2))
    cpu.write(cpu, data & 0xFF);

  //Adjust the related flags
  cpu.n = (data & 0x80) ? 1: 0;
  cpu.z = data ? 0: 1;

  //Set the peripheral control mode to both
  cpu.pmode = 3;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.dex = function(cpu)
{
  //Decrement the x register
  cpu.x = (cpu.x - 1) & 0xFF;

  //Adjust the related flags
  cpu.n = (cpu.x & 0x80) ? 1: 0;
  cpu.z = cpu.x ? 0: 1;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.dey = function(cpu)
{
  //Decrement the y register
  cpu.y = (cpu.y - 1) & 0xFF;

  //Adjust the related flags
  cpu.n = (cpu.y & 0x80) ? 1: 0;
  cpu.z = cpu.y ? 0: 1;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.eor = function(cpu)
{
  var data = 0xFF;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data;

  //Exclusive or the accumulator with the intended data
  cpu.a ^= data;

  //Adjust the related flags
  cpu.n = (cpu.a & 0x80) ? 1: 0;
  cpu.z = cpu.a ? 0: 1;

  //Set the peripheral control mode to read
  cpu.pmode = 1;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.inc = function(cpu)
{
  var data = 0xFF;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data;

  //Increment the intended data
  data += 1;

  //Check on memory access mode if location is writable
  if(cpu.write && (cpu.mam & 2))
   cpu.write(cpu, data & 0xFF);

  //Adjust the related flags
  cpu.n = (cpu.data & 0x80) ? 1: 0;
  cpu.z = cpu.data ? 0: 1;

  //Set the peripheral control mode to both
  cpu.pmode = 3;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.inx = function(cpu)
{
  //Increment the x register
  cpu.x = (cpu.x + 1) & 0xFF;

  //Adjust the related flags
  cpu.n = (cpu.x & 0x80) ? 1: 0;
  cpu.z = cpu.x ? 0: 1;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.iny = function(cpu)
{
  //Increment the y register
  cpu.y = (cpu.y + 1) & 0xFF;

  //Adjust the related flags
  cpu.n = (cpu.y & 0x80) ? 1: 0;
  cpu.z = cpu.y ? 0: 1;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.jmp = function(cpu)
{
  //Jump to the new address
  cpu.pc = cpu.address;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.jsr = function(cpu)
{
  //For correct operation the address needs to be one lower since the
  //RTS instruction increments the address after pull from the stack
  cpu.pc = (cpu.pc - 1) & 0xFFFF;

  //Save the current program counter on stack
  cpu.push(cpu.pc >> 8);
  cpu.push(cpu.pc & 0xFF);

  //Jump to the new address
  cpu.pc = cpu.address;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.lda = function(cpu)
{
  var data = 0xFF;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data;

  //Load the accumulator with the intended data
  cpu.a = data;

  //Adjust the related flags
  cpu.n = (cpu.a & 0x80) ? 1: 0;
  cpu.z = cpu.a ? 0: 1;

  //Set the peripheral control mode to read
  cpu.pmode = 1;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.ldx = function(cpu)
{
  var data = 0xFF;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data;

  //Load the x register with the intended data
  cpu.x = data;

  //Adjust the related flags
  cpu.n = (cpu.x & 0x80) ? 1: 0;
  cpu.z = cpu.x ? 0: 1;

  //Set the peripheral control mode to read
  cpu.pmode = 1;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.ldy = function(cpu)
{
  var data = 0xFF;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data;

  //Load the y register with the intended data
  cpu.y = data;

  //Adjust the related flags
  cpu.n = (cpu.y & 0x80) ? 1: 0;
  cpu.z = cpu.y ? 0: 1;

  //Set the peripheral control mode to read
  cpu.pmode = 1;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.lsr = function(cpu)
{
  var data = 0x1FE;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data << 1;

  //Shift one bit right
  data >>= 1;

  //Check on memory access mode if location is writable
  if(cpu.write && (cpu.mam & 2))
    cpu.write(cpu, data >> 1);

  //Adjust the related flags
  cpu.c = (data & 0x01) ? 1: 0;
  cpu.n = 0;
  cpu.z = (data & 0x1FE) ? 0: 1;

  //Set the peripheral control mode to both
  cpu.pmode = 3;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.nop = function(cpu)
{
  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.ora = function(cpu)
{
  var data = 0xFF;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data;

  //Or the accumulator with the intended data
  cpu.a |= data;

  //Adjust the related flags
  cpu.n = (cpu.a & 0x80) ? 1: 0;
  cpu.z = cpu.a ? 0: 1;

  //Set the peripheral control mode to read
  cpu.pmode = 1;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.pha = function(cpu)
{
  //Save the accumulator on stack
  cpu.push(cpu.a);

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.php = function(cpu)
{
  //Save the flags on stack
  cpu.pushflags(cpu.b << 4);

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.phx = function(cpu)
{
  //Save the x register on stack
  cpu.push(cpu.x);

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.phy = function(cpu)
{
  //Save the y register on stack
  cpu.push(cpu.y);

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.pla = function(cpu)
{
  //Get the accumulator from stack
  cpu.a = cpu.pull();

  //Adjust the related flags
  cpu.n = (cpu.a & 0x80) ? 1: 0;
  cpu.z = cpu.a ? 0: 1;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.plp = function(cpu)
{
  //Get the flags from stack
  cpu.pullflags();

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.plx = function(cpu)
{
  //Get the x register from stack
  cpu.x = cpu.pull();

  //Adjust the related flags
  cpu.n = (cpu.x & 0x80) ? 1: 0;
  cpu.z = cpu.x ? 0: 1;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.ply = function(cpu)
{
  //Get the y register from stack
  cpu.y = cpu.pull();

  //Adjust the related flags
  cpu.n = (cpu.y & 0x80) ? 1: 0;
  cpu.z = cpu.y ? 0: 1;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.rol = function(cpu)
{
  var data = 0xFF;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data;

  //Rotate one bit left with the carry comming in on the low bit
  data = (data << 1) | cpu.c;

  //Check on memory access mode if location is writeable
  if(cpu.write && (cpu.mam & 2))
    cpu.write(cpu, data & 0xFF);

  //Adjust the related flags
  cpu.c = (data & 0x100) ? 1: 0;
  cpu.n = (data & 0x80) ? 1: 0;
  cpu.z = data ? 0: 1;

  //Set the peripheral control mode to both
  cpu.pmode = 3;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.ror = function(cpu)
{
  var data = 0xFF;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data;

  //Put the carry in to be shifted into the high bit
  data |= (cpu.c << 8);

  //Take the low bit into the carry as it is shifted out
  cpu.c = (data & 0x01) ? 1: 0;

  //Do the shifting to the right
  data >>= 1;

  //Check on memory access mode if location is writeable
  if(cpu.write && (cpu.mam & 2))
    cpu.write(cpu, data);

  //Adjust the related flags
  cpu.n = (data & 0x80) ? 1: 0;
  cpu.z = data ? 0: 1;

  //Set the peripheral control mode to both
  cpu.pmode = 3;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.rti = function(cpu)
{
  //Get the processor status from stack and make sure the not used bit is set
  cpu.pullflags();

  //Get the program counter from stack
  cpu.pc = cpu.pull() + (cpu.pull() << 8);

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.rts = function(cpu)
{
  //Get the program counter from stack
  cpu.pc = cpu.pull() + (cpu.pull() << 8);

  //Need to point to next address
  cpu.pc = (cpu.pc + 1) & 0xFFFF;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.sbc = function(cpu)
{
  var carry;
  var acc;
  var data = 0xFF;
  var tosub;
  var result;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data;

  //Invert the carry
  carry = cpu.c ? 0: 1;

  //Check is decimal mode set
  if(cpu.d)
  {
    tosub  = (data >> 4) * 10;
    tosub += (data & 0x0F);
    acc    = (cpu.a >> 4) * 10;
    acc   += (cpu.a & 0x0F);
    result = acc - tosub - carry;
    cpu.c = (result < 99) ? 1: 0;
    cpu.a = (((result / 10) % 10) << 4) | (result % 10);
  }
  else
  {
    result = cpu.a - data - carry;
    cpu.c = (result & 0x100) ? 0: 1;
    cpu.v = (((cpu.a & 0x80) == (data & 0x80)) && ((cpu.a & 0x80) != (result & 0x80))) ? 1: 0;
    cpu.a = result & 0xFF;
  }

  //Adjust the related flags
  cpu.n = (cpu.a & 0x80) ? 1: 0;
  cpu.z = cpu.a ? 0: 1;

  //Set the peripheral control mode to read
  cpu.pmode = 1;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.sec = function(cpu)
{
  //Set the carry flag
  cpu.c = 1;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.sed = function(cpu)
{
  //Set the decimal flag
  cpu.d = 1;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.sei = function(cpu)
{
  //Set the interrupt flag
  cpu.i = 1;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.sta = function(cpu)
{
  //Check on memory access mode if location is writeable
  if(cpu.write && (cpu.mam & 2))
    cpu.write(cpu, cpu.a);

  //Set the peripheral control mode to write
  cpu.pmode = 2;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.stx = function(cpu)
{
  //Check on memory access mode if location is writeable
  if(cpu.write && (cpu.mam & 2))
    cpu.write(cpu, cpu.x);

  //Set the peripheral control mode to write
  cpu.pmode = 2;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.sty = function(cpu)
{
  //Check on memory access mode if location is writeable
  if(cpu.write && (cpu.mam & 2))
    cpu.write(cpu, cpu.y);

  //Set the peripheral control mode to write
  cpu.pmode = 2;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.stz = function(cpu)
{
  //Check on memory access mode if location is writeable
  if(cpu.write && (cpu.mam & 2))
    cpu.write(cpu, 0);

  //Set the peripheral control mode to write
  cpu.pmode = 2;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.tax = function(cpu)
{
  //Load the x register with the accumulator
  cpu.x = cpu.a;

  //Adjust the related flags
  cpu.n = (cpu.x & 0x80) ? 1: 0;
  cpu.z = cpu.x ? 0: 1;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.tay = function(cpu)
{
  //Load the y register with the accumulator
  cpu.y = cpu.a;

  //Adjust the related flags
  cpu.n = (cpu.y & 0x80) ? 1: 0;
  cpu.z = cpu.y ? 0: 1;

  //Set the peripheral control mode to NONE
  cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.trb = function(cpu)
{
  var data = 0xFF;

  //Check on memory access mode if location is readable
  if(cpu.mam & 1)
    data = cpu.data;

  //And the intended data with the inverted accumulator
  data &= (cpu.a ^ 0xFF);

  //Check on memory access mode if location is writeable
  if(cpu.write && (cpu.mam & 2))
     cpu.write(cpu, data);

  //Set the zero flag based on the result
  cpu.z = data ? 0: 1;

  //Set the peripheral control mode to both
  cpu.pmode = 3;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.tsb = function(cpu)
{
   var data = 0xFF;

    //Check on memory access mode if location is readable
   if(cpu.mam & 1)
      data = cpu.data;

   //Set the zero flag based on the anding of the accumulator with the intended data
   cpu.z = (cpu.a & data) ? 0: 1;

   //Check on memory access mode if location is writeable
  if(cpu.write && (cpu.mam & 2))
      cpu.write(cpu, data | cpu.a);

   //Set the peripheral control mode to both
   cpu.pmode = 3;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.tsx = function(cpu)
{
   //Load the x register with the stack pointer
   cpu.x = cpu.s;

   //Adjust the related flags
   cpu.n = (cpu.x & 0x80) ? 1: 0;
   cpu.z = cpu.x ? 0: 1;

   //Set the peripheral control mode to NONE
   cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.txa = function(cpu)
{
   //Load the accumulator with the x register
   cpu.a = cpu.x;

   //Adjust the related flags
   cpu.n = (cpu.a & 0x80) ? 1: 0;
   cpu.z = cpu.a ? 0: 1;

   //Set the peripheral control mode to NONE
   cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.txs = function(cpu)
{
   //Load the stack pointer with the x register
   cpu.s = cpu.x;

   //Adjust the related flags
   cpu.n = (cpu.s & 0x80) ? 1: 0;
   cpu.z = (cpu.s == 0);

   //Set the peripheral control mode to NONE
   cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------

CPU65C02.prototype.tya = function(cpu)
{
   //Load the accumulator with the y register
   cpu.a = cpu.y;

   //Adjust the related flags
   cpu.n = (cpu.a & 0x80) ? 1: 0;
   cpu.z = cpu.a ? 0: 1;

   //Set the peripheral control mode to NONE
   cpu.pmode = 0;
};

//------------------------------------------------------------------------------------------------------------------------------
