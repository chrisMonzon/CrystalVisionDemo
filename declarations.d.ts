declare module '*.glsl' {
  const value: string;
  export default value;
}

declare module 'three-custom-shader-material' {
  import { Material, MaterialParameters } from 'three';

  interface CustomShaderMaterialParameters extends MaterialParameters {
    baseMaterial: any;
    uniforms?: { [key: string]: { value: any } };
    vertexShader?: string;
    fragmentShader?: string;
    [key: string]: any;
  }

  class CustomShaderMaterial extends Material {
    constructor(parameters: CustomShaderMaterialParameters);
  }

  export default CustomShaderMaterial;
}