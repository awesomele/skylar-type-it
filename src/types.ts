export type PracticeMode = 'typing' | 'memorize';

export interface WordExplanations {
  [word: string]: string;
}

export interface WordPosition {
  x: number;
  y: number;
}
