export const ECO_FACTS = [
  "Recycling one aluminum can saves enough energy to run a TV for 3 hours!",
  "Glass is 100% recyclable and can be recycled endlessly without loss in quality.",
  "The energy saved from recycling one glass bottle can power a 100-watt light bulb for 4 hours.",
  "Recycling a single plastic bottle can conserve enough energy to light a 60-watt bulb for 6 hours.",
  "A modern glass bottle would take 4,000 years or more to decompose—even longer in a landfill.",
  "Paper made from recycled paper uses 70% less energy than paper made from fresh wood pulp.",
  "Every ton of recycled paper saves about 17 trees.",
  "Rainforests are currently disappearing at a rate of 100 acres every single minute.",
  "Plastic garbage in the ocean kills as many as 1,000,000 sea creatures every year.",
  "Recycling helps conserve resources and saves energy, helping to protect the environment.",
  "Recycling 1 pound of steel saves enough energy to power a 60-watt light bulb for over 24 hours!",
  "The aluminum can you recycle today could be back on a store shelf as a brand new can in just 60 days.",
  "Plastic bottles can be recycled into clothes—it takes about 25 large bottles to make one fleece jacket!",
  "Only 1% of the Earth's water is safe for humans to drink; the rest is salty or frozen in ice caps.",
  "Fungi are nature's ultimate recyclers; they break down dead matter to create fresh, nutrient-rich soil.",
  "If every person picked up just 152 pieces of litter, the entire world would be litter-free!",
  "Recycling 1 ton of plastic saves the equivalent energy of 2,000 gallons of gasoline.",
  "A single recycled edition of a Sunday newspaper could save 75,000 trees from being cut down.",
  "Most plastic can only be recycled 2-3 times, but metal and glass can be recycled forever.",
  "The world's oldest trees, Bristlecone pines, have been 'recycling' CO2 for over 5,000 years!",
] as const;

export function getRandomFact(excludeIndex?: number): { fact: string; index: number } {
  let index: number;
  do {
    index = Math.floor(Math.random() * ECO_FACTS.length);
  } while (index === excludeIndex && ECO_FACTS.length > 1);
  return { fact: ECO_FACTS[index], index };
}
