import { ColorCodes, ColorIndexes } from '../types/colors';

// ? Adds color to text.
export const colorify = (text: string, colorIndex: ColorIndexes) => `\x1b[${colorIndex}m${text}\x1b[0m`;

export const red = (text: string) => colorify(text, ColorCodes.RED);
export const green = (text: string) => colorify(text, ColorCodes.GREEN);
export const yellow = (text: string) => colorify(text, ColorCodes.YELLOW);
export const blue = (text: string) => colorify(text, ColorCodes.BLUE);
