import WaveSurfer, { WaveSurferParams } from "wavesurfer.js";

export const createWavesurfer = (options: WaveSurferParams): WaveSurfer => {
  return WaveSurfer.create(options);
};
