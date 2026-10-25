export function isSet(cards) {
  return cards.length === 3 && ['color','shape','count','fill'].every(feature => [1,3].includes(new Set(cards.map(c=>c[feature])).size));
}
export function findSet(cards) {
  for(let a=0;a<cards.length;a++) for(let b=a+1;b<cards.length;b++) for(let c=b+1;c<cards.length;c++) if(isSet([cards[a],cards[b],cards[c]])) return [a,b,c];
  return null;
}
export function makeSetDeck() {
  const deck=[]; for(let color=0;color<3;color++) for(let shape=0;shape<3;shape++) for(let count=0;count<3;count++) for(let fill=0;fill<3;fill++) deck.push({color,shape,count,fill});
  return shuffle(deck);
}
export function shuffle(deck) {
  const result=[...deck]; for(let i=result.length-1;i>0;i--) {const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;
}
export function makeUnoDeck() {
  const deck=[];
  for(const color of ['red','blue','green','yellow']) {
    deck.push({color,value:'0'});
    for(const value of ['1','2','3','4','5','6','7','8','9','Skip','Reverse','+2']) for(let i=0;i<2;i++) deck.push({color,value});
  }
  for(let i=0;i<4;i++) {deck.push({color:'wild',value:'Wild'});deck.push({color:'wild',value:'+4'});}
  return shuffle(deck);
}
export function unoColorAfterPlay(card, chosenColor) {
  if (card.color !== 'wild') return card.color;
  if (!['red','blue','green','yellow'].includes(chosenColor)) throw new Error('Choose a valid color for a wild card.');
  return chosenColor;
}
export function canPlayUno(card, top, activeColor, hand=[]) {
  if(card.value==='+4') return !hand.some(c=>c.color===activeColor);
  return card.color==='wild' || card.color===activeColor || card.value===top.value;
}
export const storyNodes = {
  gate: {title:'A key in the grass', text:'Behind the old apple tree, you find a tiny brass key. A note tied to it reads: “The garden needs a friend.” Ahead, an ivy-covered gate creaks open. A robin watches from the fence.', choices:[['Follow the robin','robin'],['Step through the gate','path']]},
  robin: {title:'A very small request',text:'“Oh, good! You can hear me,” says the robin. “The moonflower has forgotten how to glow. Will you help?” He gives you a silver feather and points toward a stream.', choices:[['Head to the stream','stream'],['Look for the moonflower','flower']]},
  path: {title:'Two winding paths',text:'Inside the garden, the air smells like mint and rain. One path follows a sparkling stream. The other climbs toward a little glass greenhouse. Somewhere, a bell rings twice.',choices:[['Follow the stream','stream'],['Visit the greenhouse','greenhouse']]},
  stream: {title:'The pebble bridge',text:'A sleepy frog sits beside the stream. “The bridge is shy,” she explains. “Try asking nicely.” You whisper, “May I cross?” Smooth stones rise from the water, one by one.',choices:[['Cross to the moonflower meadow','flower'],['Invite the frog to come along','friends']]},
  greenhouse: {title:'The keeper of seeds',text:'An elderly tortoise tends rows of tiny pots. “Flowers don’t glow because they’re told to,” he says. “They glow when they feel at home.” He offers you a watering can and a little packet of seeds.',choices:[['Take water to the moonflower','water'],['Plant a new corner of the garden','plant']]},
  flower: {title:'A flower in the dusk',text:'In the meadow stands a moonflower, its petals folded tight. “Everyone expects me to shine,” it whispers. You sit nearby. There is no hurry. The first star peeks through the leaves.',choices:[['Tell the flower it can take its time','listen'],['Find water in the greenhouse','greenhouse']]},
  friends: {title:'A picnic under the stars',text:'The frog brings berries. The robin brings a song. You spread a picnic beside the moonflower and invite it to join you, just as it is. Slowly, its petals open. A soft silver light fills the meadow.',ending:'The friendship ending · Everyone has a place at the picnic.'},
  water: {title:'A little care goes a long way',text:'You pour cool water around the moonflower’s roots. “Thank you for noticing,” it says. Its petals unfurl, lighting a thousand tiny dew drops. Tomorrow, you promise to visit again.',ending:'The kindness ending · Small acts can make a whole garden glow.'},
  plant: {title:'Something new',text:'You plant the seeds in a bare patch of earth. The tortoise labels it “A Friend’s Corner.” By morning, little green shoots are reaching for the sun. This garden has a new story, and you helped it begin.',ending:'The new beginnings ending · Every big adventure starts small.'},
  listen: {title:'The quiet kind of magic',text:'“You don’t have to shine for anyone,” you tell the flower. You sit together, watching the stars. At last, a gentle glow warms the meadow. The flower smiles. “I think I’m ready now.”',ending:'The patience ending · Sometimes the best gift is simply being there.'}
};
