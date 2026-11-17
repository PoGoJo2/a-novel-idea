import { SHELF_LEFT, SHELF_RIGHT } from './libraryArt.js';

// Slim copies (own gradient ids, cropped to fill the height) for narrow windows.
const slim = (svg, side) =>
  svg.replaceAll(`vshade${side}`, `vshade${side}s`).replace('xMidYMax meet', 'xMidYMax slice');

// Tall bookshelves in both side margins of the My Library page.
// Wide windows get the full bookcases; narrow windows get slim strips so the room still shows.
export default function LibraryShelves() {
  return (
    <div className="library-shelves" aria-hidden="true">
      <div className="shelf-col shelf-full shelf-left" dangerouslySetInnerHTML={{ __html: SHELF_LEFT }} />
      <div className="shelf-col shelf-full shelf-right" dangerouslySetInnerHTML={{ __html: SHELF_RIGHT }} />
      <div className="shelf-col shelf-slim shelf-left" dangerouslySetInnerHTML={{ __html: slim(SHELF_LEFT, 'L') }} />
      <div className="shelf-col shelf-slim shelf-right" dangerouslySetInnerHTML={{ __html: slim(SHELF_RIGHT, 'R') }} />
    </div>
  );
}
