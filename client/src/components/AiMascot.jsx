// The AI helper's character: a navy book that waves. The picture is in two layers (client/public/characters):
// the body, and the waving arm, which swings from the shoulder. The motion stops for readers who prefer less motion.
export default function AiMascot() {
  return (
    <span className="ai-mascot-img m-bob" aria-hidden="true">
      <img className="mascot-layer" src="/characters/mascot-body.png" alt="" draggable="false" />
      <img className="mascot-layer mascot-arm" src="/characters/mascot-arm.png" alt="" draggable="false" />
    </span>
  );
}
