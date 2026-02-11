export interface CurriculumItem {
  id: string;
  name: string;
}

const SUBJECTS: CurriculumItem[] = [
  { id: "math", name: "Mathematics" },
  { id: "science", name: "Science" },
  { id: "english", name: "English" },
  { id: "sst", name: "Social Studies" },
  { id: "hindi", name: "Hindi" },
];

const CHAPTERS: Record<string, CurriculumItem[]> = {
  math: [
    { id: "math-1", name: "Number Systems" },
    { id: "math-2", name: "Algebra" },
    { id: "math-3", name: "Geometry" },
    { id: "math-4", name: "Mensuration" },
  ],
  science: [
    { id: "sci-1", name: "Matter and Its Properties" },
    { id: "sci-2", name: "Force and Motion" },
    { id: "sci-3", name: "Living Organisms" },
    { id: "sci-4", name: "Light and Sound" },
  ],
  english: [
    { id: "eng-1", name: "Grammar" },
    { id: "eng-2", name: "Comprehension" },
    { id: "eng-3", name: "Creative Writing" },
  ],
  sst: [
    { id: "sst-1", name: "History" },
    { id: "sst-2", name: "Geography" },
    { id: "sst-3", name: "Civics" },
  ],
  hindi: [
    { id: "hin-1", name: "Vyakaran" },
    { id: "hin-2", name: "Gadya" },
    { id: "hin-3", name: "Padya" },
  ],
};

const SUBTOPICS: Record<string, CurriculumItem[]> = {
  "math-1": [
    { id: "math-1-1", name: "Natural Numbers" },
    { id: "math-1-2", name: "Whole Numbers" },
    { id: "math-1-3", name: "Integers" },
  ],
  "math-2": [
    { id: "math-2-1", name: "Linear Equations" },
    { id: "math-2-2", name: "Polynomials" },
  ],
  "math-3": [
    { id: "math-3-1", name: "Triangles" },
    { id: "math-3-2", name: "Circles" },
    { id: "math-3-3", name: "Quadrilaterals" },
  ],
  "math-4": [
    { id: "math-4-1", name: "Area and Perimeter" },
    { id: "math-4-2", name: "Volume and Surface Area" },
  ],
  "sci-1": [
    { id: "sci-1-1", name: "States of Matter" },
    { id: "sci-1-2", name: "Elements and Compounds" },
  ],
  "sci-2": [
    { id: "sci-2-1", name: "Newton's Laws" },
    { id: "sci-2-2", name: "Friction" },
  ],
  "sci-3": [
    { id: "sci-3-1", name: "Cell Structure" },
    { id: "sci-3-2", name: "Reproduction" },
  ],
  "sci-4": [
    { id: "sci-4-1", name: "Reflection and Refraction" },
    { id: "sci-4-2", name: "Sound Waves" },
  ],
  "eng-1": [
    { id: "eng-1-1", name: "Tenses" },
    { id: "eng-1-2", name: "Parts of Speech" },
  ],
  "eng-2": [
    { id: "eng-2-1", name: "Unseen Passages" },
    { id: "eng-2-2", name: "Poetry Analysis" },
  ],
  "eng-3": [
    { id: "eng-3-1", name: "Essay Writing" },
    { id: "eng-3-2", name: "Story Writing" },
  ],
  "sst-1": [
    { id: "sst-1-1", name: "Ancient Civilizations" },
    { id: "sst-1-2", name: "Medieval Period" },
  ],
  "sst-2": [
    { id: "sst-2-1", name: "Climate and Weather" },
    { id: "sst-2-2", name: "Maps and Globes" },
  ],
  "sst-3": [
    { id: "sst-3-1", name: "Indian Constitution" },
    { id: "sst-3-2", name: "Local Government" },
  ],
  "hin-1": [
    { id: "hin-1-1", name: "Sangya" },
    { id: "hin-1-2", name: "Sarvanam" },
  ],
  "hin-2": [
    { id: "hin-2-1", name: "Kahani" },
    { id: "hin-2-2", name: "Nibandh" },
  ],
  "hin-3": [
    { id: "hin-3-1", name: "Kavita" },
    { id: "hin-3-2", name: "Dohe" },
  ],
};

export interface AssetMapping {
  subjectId: string;
  chapterId: string;
  subtopicId: string;
}

// In-memory store for dummy mapping persistence within a session
const mappings: Record<string, AssetMapping> = {};

export async function fetchMapping(
  assetId: string,
): Promise<AssetMapping | null> {
  return mappings[assetId] ?? null;
}

export async function saveMapping(
  assetId: string,
  mapping: AssetMapping,
): Promise<void> {
  mappings[assetId] = mapping;
}

export async function fetchSubjects(): Promise<CurriculumItem[]> {
  return SUBJECTS;
}

export async function fetchChapters(
  subjectId: string,
): Promise<CurriculumItem[]> {
  return CHAPTERS[subjectId] ?? [];
}

export async function fetchSubtopics(
  chapterId: string,
): Promise<CurriculumItem[]> {
  return SUBTOPICS[chapterId] ?? [];
}
