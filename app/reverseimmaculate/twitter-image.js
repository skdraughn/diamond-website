import { createGameImage } from '../lib/gameOpenGraph/render';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const alt = "Diamond Trivia Reverse Immaculate game preview";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function GameImage() {
  return createGameImage('reverseimmaculate');
}
