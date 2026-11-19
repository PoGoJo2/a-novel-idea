// The floor at the bottom of the My Library page, with four readers.
// The pictures live in client/public/characters (made with an AI image tool).
const READERS = [
  { name: 'girl', file: 'reader-girl.png' },
  { name: 'boy', file: 'reader-boy.png' },
  { name: 'grandma', file: 'reader-grandma.png' },
  { name: 'man', file: 'reader-man.png' },
];

export default function ReadingRoom() {
  return (
    <div className="reading-room" aria-hidden="true">
      <div className="reading-floor" />
      {READERS.map((r) => (
        <img key={r.name} className={`person p-${r.name}`} src={`/characters/${r.file}`} alt="" loading="lazy" />
      ))}
    </div>
  );
}
