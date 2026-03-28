declare module 'ogl' {
  export class Renderer {
    constructor(options?: any);
    gl: WebGLRenderingContext | WebGL2RenderingContext;
    setSize(width: number, height: number): void;
    render(options: { scene: any; camera?: any }): void;
  }
  export class Program {
    constructor(gl: any, options: any);
    uniforms: any;
  }
  export class Mesh {
    constructor(gl: any, options: { geometry: any; program: any });
  }
  export class Triangle {
    constructor(gl: any);
  }
}
