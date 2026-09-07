declare module "dom-to-image-more" {
  interface Options {
    scale?: number;
    onclone?: (clone: HTMLElement | SVGElement) => void;
    bgcolor?: string;
    width?: number;
    height?: number;
  }
  function toPng(node: HTMLElement | SVGElement, options?: Options): Promise<string>;
  function toJpeg(node: HTMLElement | SVGElement, options?: Options): Promise<string>;
  function toSvg(node: HTMLElement | SVGElement, options?: Options): Promise<string>;
  export { toPng, toJpeg, toSvg };
  const domtoimage: { toPng: typeof toPng; toJpeg: typeof toJpeg; toSvg: typeof toSvg };
  export default domtoimage;
}
