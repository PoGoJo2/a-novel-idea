import { SCENES } from './libraryArt.js';

// The floor at the bottom of the My Library page, with four people reading.
export default function ReadingRoom() {
  return (
    <div className="reading-room" aria-hidden="true">
      <div className="reading-floor" />
      <div className="person p-girl" dangerouslySetInnerHTML={{ __html: SCENES.girl }} />
      <div className="person p-boy" dangerouslySetInnerHTML={{ __html: SCENES.boy }} />
      <div className="person p-elder" dangerouslySetInnerHTML={{ __html: SCENES.elder }} />
      <div className="person p-stack" dangerouslySetInnerHTML={{ __html: SCENES.stack }} />
    </div>
  );
}
