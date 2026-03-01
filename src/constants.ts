export const DEFAULT_VOCAB_LIST =
  'advise - to give suggestions or recommendations\n' +
  'almanac - a book with calendars, weather forecasts, and facts\n' +
  'aqueduct - a structure for carrying water over long distances\n' +
  'armada - a large fleet of warships\n' +
  'atlas - a book of maps\n' +
  'atmosphere - the air around the Earth or the mood of a place\n' +
  'barometer - an instrument that measures air pressure\n' +
  'brash - rude and bold\n' +
  'cell - a small room or the basic unit of life\n' +
  'Celsius - a scale for measuring temperature\n' +
  'colonel - a high military rank\n' +
  'commend - to praise\n' +
  'condo - a condominium, an owned apartment\n' +
  'corporation - a large company or business\n' +
  'dense - thick or closely packed\n' +
  'diameter - the distance across a circle\n' +
  'radius - Half of a diameter is called the radius\n' +
  'duet - a performance by two people\n' +
  'element - a basic part or chemical substance\n' +
  'envelop - to wrap or cover completely\n' +
  'envelope - a paper container for letters\n' +
  'exotic - unusual and from far away\n' +
  'exquisite - very beautiful and delicate\n' +
  'Fahrenheit - a temperature scale\n' +
  'frankfurter - a type of sausage (hot dog)\n' +
  'frantic - wildly excited or anxious\n' +
  'frontier - the edge of settled land\n' +
  'grate - to shred or a metal frame\n' +
  'humane - kind and compassionate';

export const DEFAULT_WORD_POOL_TEXT =
  'time, person, year, thing, world, life, hand, part, child, woman, place, work, week, case, point, government, company, number, group, problem, fact, good, first, last, long, great, little, other, right, high, different, small, large, next, early, young, important, public, same, able, make, know, take, come, think, look, want, give, find, tell, work, seem, feel, leave, call, keep, begin, help, show, hear, play, move, live, believe, hold, bring, happen, write, provide, stand, lose, meet, include, continue, learn, change, lead, understand, watch, follow, stop, create, speak, read, allow, spend, grow, open, walk, offer, remember, love, consider, appear, wait, serve, send, expect, build, stay, fall, reach, kill, remain, suggest, raise, pass, sell, require, report, decide, pull, break, pick, wear, carry, describe, return, explain, hope, develop, represent, agree, receive, involve, increase';

export const DEFAULT_WORD_POOL = DEFAULT_WORD_POOL_TEXT
  .split(/[,\s]+/)
  .map((w) => w.trim())
  .filter((w) => w.length > 0);

export const CONFETTI_COLORS = [
  'bg-red-500',
  'bg-blue-500',
  'bg-yellow-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
];
