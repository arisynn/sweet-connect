const IconRainbowCandy = ({ className }) => <img src="/assets/gacha/permenpelangi.png" className={className || "w-5 h-5"} draggable="false" alt="Permen Pelangi" />;
const IconGachaItem = ({ className }) => <img src="/assets/gacha/gachaitem.png" className={className || "w-5 h-5"} draggable="false" alt="Gacha Item" />;
const IconGachaTheme = ({ className }) => <img src="/assets/gacha/gachatema.png" className={className || "w-5 h-5"} draggable="false" alt="Gacha Tema" />;

// -- MINES GAME --
const IconBomb = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="13" r="9"/>
    <path d="M14.35 4.65 16.3 2.7a2.41 2.41 0 0 1 3.4 0l1.6 1.6a2.4 2.4 0 0 1 0 3.4l-1.95 1.95"/>
    <path d="m22 2-1.5 1.5"/>
  </svg>
);

