// Anime le "PLAY" et la date en bas comme un bug VHS
export function animatePlayAndTimebox() {
  const playbox = document.querySelector('.playbox');
  const playText = document.querySelector('.play-text');
  const timebox = document.getElementById('datetime');
  if (!playbox || !playText || !timebox) return;

  // Animation bug VHS pour PLAY
  setInterval(() => {
    playText.style.transform = `translate(${Math.random()*2-1}px, ${Math.random()*2-1}px) skewX(${Math.random()*2-1}deg)`;
    playText.style.opacity = 0.93 + Math.random()*0.07;
    playText.style.filter = `blur(${Math.random()*0.7}px)`;
  }, 60);

  // Animation bug VHS pour l'icône play
  const playLogo = playbox.querySelector('.play-logo');
  if (playLogo) {
    setInterval(() => {
      playLogo.style.transform = `scale(${0.98+Math.random()*0.04}) rotate(${Math.random()*2-1}deg)`;
      playLogo.style.filter = `drop-shadow(0 0 ${6+Math.random()*6}px #e6fdff)`;
    }, 80);
  }

  // Animation bug VHS pour la date
  setInterval(() => {
    timebox.style.transform = `translate(${Math.random()*2-1}px, ${Math.random()*2-1}px) skewY(${Math.random()*2-1}deg)`;
    timebox.style.opacity = 0.93 + Math.random()*0.07;
    timebox.style.filter = `blur(${Math.random()*0.7}px)`;
  }, 70);
}
