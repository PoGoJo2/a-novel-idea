// The "A Novel Idea" logo: script lettering with a rose, daffodil, blue orchid, a quill and an inkpot.
// The cream-letter version sits on the teal top bar (pictures in client/public/brand).
export default function Logo({ variant = 'light' }) {
  return <img className="logo-img" src={`/brand/logo-${variant === 'dark' ? 'dark' : 'light'}-text.png`} alt="A Novel Idea" draggable="false" />;
}
