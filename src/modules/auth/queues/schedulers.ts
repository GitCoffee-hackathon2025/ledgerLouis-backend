import { buildKeyRotationScheduler } from "./key-rotation/index.js";

export const authSchedulers = {
  keyRotation: buildKeyRotationScheduler,
};
