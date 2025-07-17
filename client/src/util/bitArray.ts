export class BitArray {
  private bits: boolean[];

  constructor(size: number, initialBits?: boolean[]) {
    this.bits = initialBits ?? new Array(size).fill(false);
  }

  toggle(index: number): BitArray {
    const newBits = [...this.bits];
    newBits[index] = !newBits[index];
    return new BitArray(this.bits.length, newBits);
  }

  set(index: number, value: boolean): BitArray {
    const newBits = [...this.bits];
    newBits[index] = value;
    return new BitArray(this.bits.length, newBits);
  }

  get(index: number): boolean {
    return this.bits[index];
  }

  allTrue(): boolean {
    return this.bits.every(b => b);
  }

  getBits(): boolean[] {
    return this.bits;
  }
}