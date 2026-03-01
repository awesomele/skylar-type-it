import React from 'react';
import { CONFETTI_COLORS } from '../constants';

const MINI_COUNT = 20;
const FULL_COUNT = 100;

function randomColor(colors: string[]) {
  return colors[Math.floor(Math.random() * colors.length)];
}

export function MiniConfetti() {
  const particles = Array.from({ length: MINI_COUNT }, (_, i) => {
    const angle = (Math.PI * 2 * i) / MINI_COUNT;
    const velocity = 150 + Math.random() * 200;
    const endX = Math.cos(angle) * velocity;
    const endY = Math.sin(angle) * velocity;
    const rotation = Math.random() * 540 - 270;
    return { i, endX, endY, rotation, color: randomColor(CONFETTI_COLORS) };
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="text-[6rem] animate-ping">🎉</div>
      {particles.map(({ i, endX, endY, rotation, color }) => (
        <div
          key={i}
          className={`absolute w-3 h-3 rounded-full ${color}`}
          style={{
            left: '50%',
            top: '50%',
            animation: `mini-confetti-${i} 0.8s ease-out forwards`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      <style>{`
        ${particles.map(({ i, endX, endY, rotation }) => `
          @keyframes mini-confetti-${i} {
            0% { transform: translate(-50%, -50%) rotate(0deg); opacity: 1; }
            100% { transform: translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px)) rotate(${rotation}deg); opacity: 0; }
          }
        `).join('\n')}
      `}</style>
    </div>
  );
}

export function FullConfetti() {
  const particles = Array.from({ length: FULL_COUNT }, (_, i) => {
    const angle = (Math.PI * 2 * i) / FULL_COUNT;
    const velocity = 400 + Math.random() * 600;
    const endX = Math.cos(angle) * velocity;
    const endY = Math.sin(angle) * velocity;
    const rotation = Math.random() * 720 - 360;
    const size = 12 + Math.random() * 16;
    return { i, endX, endY, rotation, size, color: randomColor(CONFETTI_COLORS) };
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div className="text-[15rem] animate-ping">🎉</div>
      {particles.map(({ i, size, color }) => (
        <div
          key={i}
          className={`absolute rounded-full ${color}`}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            left: '50%',
            top: '50%',
            animation: `confetti-fall-${i} 2s ease-out forwards`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
      <style>{`
        ${particles.map(({ i, endX, endY, rotation }) => `
          @keyframes confetti-fall-${i} {
            0% { transform: translate(-50%, -50%) rotate(0deg); opacity: 1; }
            100% { transform: translate(calc(-50% + ${endX}px), calc(-50% + ${endY}px)) rotate(${rotation}deg); opacity: 0; }
          }
        `).join('\n')}
      `}</style>
    </div>
  );
}

interface SoccerBallsProps {
  count: number;
}

export function SoccerBalls({ count }: SoccerBallsProps) {
  const balls = Array.from({ length: Math.min(count, 50) }, (_, i) => {
    const startX = Math.random() * window.innerWidth;
    const delay = Math.random() * 3;
    const bounces = 2 + Math.floor(Math.random() * 3);
    const bounceHeights = Array.from({ length: bounces }, (_, j) => 80 - j * 20 - Math.random() * 20);

    let keyframes = `@keyframes soccer-fall-${i} { 0% { top: -50px; transform: rotate(0deg); }`;
    let progress = 0;
    bounceHeights.forEach((height, j) => {
      const seg = 100 / (bounces + 1);
      progress += seg;
      const bottom = progress - seg / 2;
      keyframes += `
        ${bottom}% { top: calc(100vh - 50px); transform: rotate(${(j + 1) * 180}deg); }
        ${progress}% { top: calc(100vh - ${height}px); transform: rotate(${(j + 1) * 180 + 90}deg); }
      `;
    });
    keyframes += `100% { top: calc(100vh - 50px); transform: rotate(${(bounces + 1) * 180}deg); opacity: 0; } }`;

    return { i, startX, delay, keyframes };
  });

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {balls.map(({ i, startX, delay }) => (
        <div
          key={i}
          className="absolute text-4xl"
          style={{
            left: `${startX}px`,
            animation: `soccer-fall-${i} 4s ease-in forwards`,
            animationDelay: `${delay}s`,
            top: '-50px',
          }}
        >
          ⚽
        </div>
      ))}
      <style>{balls.map((b) => b.keyframes).join('\n')}</style>
    </div>
  );
}
