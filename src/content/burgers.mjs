export const CURATED_BURGERS = Object.freeze([
  {
    id: "smoky-maple-crunch",
    name: "Smoky Maple Crunch",
    style: "gourmet",
    base: "beef",
    spiceLevel: "mild",
    description: "A smoky-sweet stack with maple onions, sharp cheddar and crisp cabbage crunch.",
    ingredients: ["beef patty", "maple onions", "smoked cheddar", "cabbage crunch", "toasted brioche-style bun"],
    dietaryTags: [],
    prepNotes: "Add the cabbage crunch immediately before serving so it stays crisp.",
    accent: "ember"
  },
  {
    id: "garden-ember-stack",
    name: "Garden Ember Stack",
    style: "spicy",
    base: "plant",
    spiceLevel: "medium",
    description: "A charred plant-based patty layered with roasted peppers, avocado and smoky tomato relish.",
    ingredients: ["plant-based patty", "roasted peppers", "avocado", "smoky tomato relish", "sesame-style bun"],
    dietaryTags: ["plant-based concept"],
    prepNotes: "Check every packaged ingredient separately when dietary restrictions matter.",
    accent: "mint"
  },
  {
    id: "seoul-sesame-stack",
    name: "Seoul Sesame Stack",
    style: "international",
    base: "chicken",
    spiceLevel: "hot",
    description: "A gochujang-inspired chicken burger with sesame slaw, cucumber and scallion crunch.",
    ingredients: ["chicken patty", "spiced glaze", "sesame slaw", "cucumber", "scallions"],
    dietaryTags: [],
    prepNotes: "Keep the slaw chilled until assembly and use a separate spoon for the glaze.",
    accent: "chili"
  },
  {
    id: "sunrise-hash-burger",
    name: "Sunrise Hash Burger",
    style: "breakfast",
    base: "turkey",
    spiceLevel: "mild",
    description: "A breakfast-inspired turkey stack with a crisp potato cake, egg-style topping and tomato jam.",
    ingredients: ["turkey patty", "potato cake", "egg-style topping", "tomato jam", "toasted bun"],
    dietaryTags: ["breakfast concept"],
    prepNotes: "Cook proteins and egg components to appropriate safe temperatures for the ingredients used.",
    accent: "sunny"
  },
  {
    id: "mediterranean-halloumi",
    name: "Mediterranean Halloumi Stack",
    style: "gourmet",
    base: "cheese",
    spiceLevel: "mild",
    description: "Grilled halloumi-style cheese, lemon herbs, tomato, cucumber and olive relish in a warm bun.",
    ingredients: ["halloumi-style cheese", "tomato", "cucumber", "olive relish", "lemon herbs"],
    dietaryTags: ["vegetarian concept"],
    prepNotes: "Serve immediately after grilling the cheese so the texture remains tender.",
    accent: "coast"
  },
  {
    id: "island-jerk-pineapple",
    name: "Island Jerk Pineapple",
    style: "international",
    base: "chicken",
    spiceLevel: "hot",
    description: "A fragrant jerk-inspired chicken burger with charred pineapple, lime slaw and herb sauce.",
    ingredients: ["chicken patty", "jerk-inspired seasoning", "charred pineapple", "lime slaw", "herb sauce"],
    dietaryTags: [],
    prepNotes: "Balance heat with extra slaw rather than adding unverified nutrition claims.",
    accent: "tropic"
  },
  {
    id: "portobello-pepper-melt",
    name: "Portobello Pepper Melt",
    style: "classic",
    base: "plant",
    spiceLevel: "medium",
    description: "A roasted mushroom-and-pepper stack with caramelized onion and a tangy green sauce.",
    ingredients: ["portobello mushroom", "roasted peppers", "caramelized onion", "green herb sauce", "toasted bun"],
    dietaryTags: ["vegetarian concept"],
    prepNotes: "Use a dedicated clean surface when cross-contact is a concern.",
    accent: "forest"
  },
  {
    id: "coastline-cod-crunch",
    name: "Coastline Cod Crunch",
    style: "classic",
    base: "fish",
    spiceLevel: "mild",
    description: "A crisp cod-style fillet with pickle slaw, lemon-herb sauce and shredded lettuce.",
    ingredients: ["cod-style fillet", "pickle slaw", "lemon-herb sauce", "lettuce", "toasted bun"],
    dietaryTags: ["seafood concept"],
    prepNotes: "Fish and frying ingredients require careful allergen and cross-contact checks.",
    accent: "ocean"
  }
]);

export const BUILDER_OPTIONS = Object.freeze({
  bases: ["surprise", "beef", "chicken", "turkey", "fish", "plant", "cheese"],
  styles: ["surprise", "classic", "smash", "gourmet", "breakfast", "spicy", "international"],
  spiceLevels: ["mild", "medium", "hot"],
  dietaryPreferences: ["none", "vegetarian", "vegan", "gluten-aware", "dairy-aware"]
});

export const DEMO_DISCLOSURE = "Burger ideas are creative concepts. Ingredients, dietary tags, allergen exposure, nutrition and safe preparation are not verified.";
