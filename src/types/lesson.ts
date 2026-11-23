export type MaterialKey =
  | 'slides'
  | 'homework'
  | 'puzzle'
  | 'crossword'
  | 'methodologies'
  | 'tests';

export type MaterialSelection = Record<MaterialKey, boolean>;

export type LessonLanguage = 'uz_latin' | 'uz_cyrillic' | 'en' | 'ru';

export interface GenerateLessonRequest {
  topic: string;
  grade: string;
  subject: string;
  language: LessonLanguage;
  selected: MaterialSelection;
}

export interface SlideItem {
  slideNumber: number;
  title: string;
  subtitle: string;
  bulletPoints: string[];
  visualIdea: string;
  speakerNotes: string;
}

export interface HomeworkTier {
  level: string;
  title: string;
  taskDescription: string;
  steps: string[];
  estimatedMinutes: number;
  answerHint: string;
}

export interface RubricCriterion {
  criterion: string;
  maxPoints: number;
  description: string;
}

export interface HomeworkData {
  overview: string;
  tiers: HomeworkTier[];
  rubric: RubricCriterion[];
}

export interface PuzzlePair {
  id: string;
  concept: string;
  match: string;
}

export interface PuzzleSequenceItem {
  order: number;
  title: string;
  detail: string;
}

export interface PuzzleData {
  gameTitle: string;
  instructions: string;
  pairs: PuzzlePair[];
  sequenceTitle: string;
  sequenceItems: PuzzleSequenceItem[];
}

export interface CrosswordWordInput {
  word: string;
  clue: string;
}

export interface CrosswordData {
  title: string;
  words: CrosswordWordInput[];
}

export interface KlasterBranch {
  branchTitle: string;
  subItems: string[];
}

export interface MethodologiesData {
  klaster: {
    centerTopic: string;
    branches: KlasterBranch[];
  };
  sinkveyn: {
    noun: string;
    adjectives: string[];
    verbs: string[];
    phrase: string;
    synonym: string;
  };
  bbb: {
    bilaman: string[];
    bilishniXohlayman: string[];
    bildim: string[];
  };
  baliqSkeleti: {
    problem: string;
    causes: string[];
    facts: string[];
    conclusion: string;
  };
}

export interface TestQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface GeneratedLessonPack {
  id: string;
  createdAt: string;
  topic: string;
  grade: string;
  subject: string;
  language: LessonLanguage;
  summary: string;
  selected: MaterialSelection;
  slides?: SlideItem[];
  homework?: HomeworkData;
  puzzle?: PuzzleData;
  crossword?: CrosswordData;
  methodologies?: MethodologiesData;
  tests?: TestQuestion[];
}
