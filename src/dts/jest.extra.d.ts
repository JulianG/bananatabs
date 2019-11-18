declare namespace jest {
  export interface Matchers<R> {
    toHaveBeenCalledLike(expectations: { event: any; times: number }[]): R;
    toHaveBeenCalledNthTimeWith(time: number, expected: {}): R;
    toBeEquivalentToBTWindow(expected: any): R;
  }

  export interface MockContext<T> {
    timestamps: number[];
  }
}
