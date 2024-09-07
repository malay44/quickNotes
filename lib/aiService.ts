const mockGlossary: Record<string, string> = {
  React: "A JavaScript library for building user interfaces",
  "Next.js": "A React framework for production-grade applications",
  TypeScript:
    "A typed superset of JavaScript that compiles to plain JavaScript",
  Zustand: "A small, fast and scalable bearbones state-management solution",
};

export const identifyKeyTerms = (text: string): string[] => {
  return Object.keys(mockGlossary).filter((term) =>
    text.toLowerCase().includes(term.toLowerCase())
  );
};

export const getTermDefinition = (term: string): string => {
  return mockGlossary[term] || "Definition not found";
};
