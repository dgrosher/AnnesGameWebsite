export function shuffledPairs(random = Math.random) {
  const cards = ['✿','☀','♥','★','☘','◆','☂','☾'];
  const deck = [...cards, ...cards];
  for(let i = deck.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  return deck;
}
export function snakeStep(snake, direction, food, size = 20) {
  const head = {x: snake[0].x + direction.x, y: snake[0].y + direction.y};
  const ate = head.x === food.x && head.y === food.y;
  const body = ate ? snake : snake.slice(0, -1);
  if (head.x < 0 || head.y < 0 || head.x >= size || head.y >= size || body.some(p => p.x === head.x && p.y === head.y)) return {snake, ate: false, dead: true};
  return {snake: [head, ...snake].slice(0, snake.length + Number(ate)), ate, dead: false};
}
