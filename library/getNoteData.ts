export type MemoData = { id: number; text: string };

export type NoteData = {
  id: string;
  title: string;
  musicId: string;
  memos: MemoData[];
};

const sampleData: NoteData = {
  id: "id1",
  title: "初めてのメモ",
  musicId: "A0011",
  memos: [
    { id: 41, text: "クラリネットとファゴットが主題を提示する" },
    { id: 1008, text: "ホルンのソロが主題を提示する" },
    { id: 3472, text: "最後のコーダ" },
  ],
};
const sampleData2: NoteData = {
  id: "id2",
  title: "2番目のメモ",
  musicId: "A0011",
  memos: [
    { id: 21, text: "第1楽章の練習記号A" },
    { id: 1016, text: "第2楽章の練習記号A" },
    { id: 2012, text: "第3楽章の練習記号A" },
    { id: 3016, text: "第4楽章の練習記号A" },
  ],
};

export const getNoteData = (musicId: string): NoteData[] => {
  if (musicId === "A0011") return [sampleData, sampleData2];
  return [];
};
