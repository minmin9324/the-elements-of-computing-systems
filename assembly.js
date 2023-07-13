// 밑바닥부터 만드는 컴퓨팅 시스템 2판 - 6장
// 6.4 p.140 핵 어셈블러 만들기

const A_INSTRUCTION = "A_INSTRUCTION";
const C_INSTRUCTION = "C_INSTRUCTION";
const L_INSTRUCTION = "L_INSTRUCTION";

class Parser {
  constructor(file) {
    this.currentLine = 0;
    this.file = file;
    this.lineArray = file
      .split("\n")
      .filter((line) => {
        return line.trim() !== "" && !line.startsWith("//");
      })
      .map((line) => {
        return line.trim();
      });
  }

  getLineArray() {
    return this.lineArray;
  }

  hasMoreLines() {
    return this.currentLine < this.lineArray.length;
  }

  advance() {
    this.currentLine++;
  }

  instructionType() {
    const line = this.lineArray[this.currentLine];
    if (line.startsWith("@")) {
      return A_INSTRUCTION;
    } else if (line.startsWith("(")) {
      return L_INSTRUCTION;
    } else {
      return C_INSTRUCTION;
    }
  }

  symbol() {
    const line = this.lineArray[this.currentLine];
    if (this.instructionType() === A_INSTRUCTION) {
      return line.substring(1);
    } else if (this.instructionType() === L_INSTRUCTION) {
      return line.substring(1, line.length - 1);
    }
  }

  dest() {
    const line = this.lineArray[this.currentLine];
    if (this.instructionType() === C_INSTRUCTION) {
      return line.includes("=") ? line.split("=")[0] : "";
    }
  }
  comp() {
    const line = this.lineArray[this.currentLine];
    if (this.instructionType() === C_INSTRUCTION) {
      return line.includes("=") ? line.split("=")[1] : line.split(";")[0];
    }
  }
  jump() {
    const line = this.lineArray[this.currentLine];
    if (this.instructionType() === C_INSTRUCTION) {
      return line.includes(";") ? line.split(";")[1] : "";
    }
  }
}

class Code {
  dest(mnemonic) {
    switch (mnemonic) {
      case "M":
        return "001";
      case "D":
        return "010";
      case "DM":
        return "011";
      case "A":
        return "100";
      case "AM":
        return "101";
      case "AD":
        return "110";
      case "AMD":
        return "111";
      default:
        return "000";
    }
  }

  comp(mnemonic) {
    switch (mnemonic) {
      case "0":
        return "0101010";
      case "1":
        return "0111111";
      case "-1":
        return "0111010";
      case "D":
        return "0001100";
      case "A":
        return "0110000";
      case "M":
        return "1110000";
      case "!D":
        return "0001101";
      case "!A":
        return "0110001";
      case "!M":
        return "1110001";
      case "-D":
        return "0001111";
      case "-A":
        return "0110011";
      case "-M":
        return "1110011";
      case "D+1":
        return "0011111";
      case "A+1":
        return "0110111";
      case "M+1":
        return "1110111";
      case "D-1":
        return "0001110";
      case "A-1":
        return "0110010";
      case "M-1":
        return "1110010";
      case "D+A":
        return "0000010";
      case "D+M":
        return "1000010";
      case "D-A":
        return "0010011";
      case "D-M":
        return "1010011";
      case "A-D":
        return "0000111";
      case "M-D":
        return "1000111";
      case "D&A":
        return "0000000";
      case "D&M":
        return "1000000";
      case "D|A":
        return "0010101";
      case "D|M":
        return "1010101";
      default:
        return "0000000";
    }
  }

  jump(mnemonic) {
    switch (mnemonic) {
      case "JGT":
        return "001";
      case "JEQ":
        return "010";
      case "JGE":
        return "011";
      case "JLT":
        return "100";
      case "JNE":
        return "101";
      case "JLE":
        return "110";
      case "JMP":
        return "111";
      default:
        return "000";
    }
  }
}

class SymbolTable {
  constructor() {
    this.table = {
      R0: 0,
      R1: 1,
      R2: 2,
      R15: 15,
      SP: 0,
      LCL: 1,
      ARG: 2,
      THIS: 3,
      THAT: 4,
      SCREEN: 16384,
      KBD: 24576,
      LOOP: 4,
      STOP: 18,
      i: 16,
      sum: 17,
    };
  }

  getBinary(symbol) {
    return this.table[symbol].toString(2);
  }
}

const parser = new Parser(`
// Add 1+ ... + 100
@i
M=1
@sum
M=0
(LOOP)
@i
D=M
@R0
D=D-M
@STOP
D;JGT
// sum += i
@i
D=M
@sum
M=D+M
// i++
@i
M=M+1
@LOOP
0;JMP
(STOP)
@sum
D=M
@END
`);

const code = new Code();
const symbolTable = new SymbolTable();
const result = [];
while (parser.hasMoreLines()) {
  if (
    parser.instructionType() === A_INSTRUCTION ||
    parser.instructionType() === L_INSTRUCTION
  ) {
    const symbol = parser.symbol();
    if (symbolTable.table[symbol]) {
      result.push(symbolTable.getBinary(symbol).padStart(16, "0"));
    }
  } else if (parser.instructionType() === C_INSTRUCTION) {
    result.push(
      "111" +
        code.comp(parser.comp()) +
        code.dest(parser.dest()) +
        code.jump(parser.jump())
    );
  }
  parser.advance();
}

console.log(result);
console.log(result.join("\n"));
