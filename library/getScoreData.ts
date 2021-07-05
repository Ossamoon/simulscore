import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "data", "music");

export type ScoreData = {
  scoreId: string;
  musicId: string;
  positions: {
    page: number;
    rows: {
      id: number;
      top: number;
      height: number;
      blocks: {
        id: number;
        width: number;
        left: number;
      }[];
    }[];
  }[];
};

export const getScoreData = async (
  musicId: string,
  scoreId: string
): Promise<ScoreData | null> => {
  const fullpath = path.join(dir, musicId, "score", `${scoreId}.json`);
  try {
    const fileContents = fs.readFileSync(fullpath, "utf8");
    const data: ScoreData = await JSON.parse(fileContents);
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
};
