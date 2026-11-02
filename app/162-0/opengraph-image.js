import { createGameImage } from './opengraph/render';

export const runtime = 'nodejs';
export const dynamic = 'force-static';
export const alt = "Diamond Trivia 162-0 \u2014 example lineup using the game's team-logo cards";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return createGameImage();
}
