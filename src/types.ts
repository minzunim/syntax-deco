export type Chunk = {
  start: number;
  end: number;
  text: string;
  senEle: string;
  gramEle: string;
  modifier: boolean;
  rendType: string;
  explanation: string | null;
};

export type SyntaxData = {
  chunks: Chunk[];
  sentence: string;
  translation: string;
};
