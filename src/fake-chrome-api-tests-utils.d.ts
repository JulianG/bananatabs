declare namespace jest {
	
	export interface Matchers<R> {
		toHaveBeenCalledLike(expectations: { event: any, times: number }[]): R;
	}
}