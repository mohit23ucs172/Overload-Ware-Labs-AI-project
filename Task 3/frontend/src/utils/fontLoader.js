import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';

const fontLoader = new FontLoader();

// Function to load a font from a JSON file
export const loadFont = async (url) => {
  return new Promise((resolve, reject) => {
    fontLoader.load(
      url,
      (font) => resolve(font),
      undefined,
      (error) => reject(error)
    );
  });
};

// Function to create text geometry with the loaded font
export const createTextGeometry = (text, font, options = {}) => {
  const { size = 0.5, height = 0.1, ...rest } = options;
  const textGeometry = new TextGeometry(text, {
    font,
    size,
    height,
    ...rest
  });
  textGeometry.computeBoundingBox();
  textGeometry.center();
  return textGeometry;
};
