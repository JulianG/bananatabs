/* tslint:disable no-any */
export function promisify<T>(funct: (...args: any[]) => void) {
  return (...args: any[]): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      funct(...args, resolve);
    });
  };
}
