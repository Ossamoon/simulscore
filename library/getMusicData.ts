import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "data", "music");

export type VideoInfo = {
  videoId: string;
  source: "youtube";
  players: {
    part: string;
    part_jp?: string;
    name: string;
    name_jp?: string;
  }[];
};

export type ScoreInfo = {
  scoreId: string;
  source: "imslp";
  publisher: string;
  copyright: string;
  summary: string;
};

export type MovementInfo = {
  movement: number;
  first_blockId: number;
  reservation: {
    from: number;
    to: number;
  };
  measure_num: number;
  title: string;
  title_jp?: string;
  doubled_measures?: number[];
  cadenza?: {
    first_blockId: number;
    reservation: {
      from: number;
      to: number;
    };
    measure_num: number;
    title: string;
    title_jp?: string;
    doubled_measures?: number[];
  }[];
};

export type MusicData = {
  musicId: string;
  type: string;
  title: string;
  title_jp?: string;
  composerId: string;
  composer: string;
  composer_jp?: string;
  opus?: string;
  videos: VideoInfo[];
  scores: ScoreInfo[];
  blockId_reservations: {
    num: number;
    description: string;
  }[];
  movements?: MovementInfo[];
};

export const getMusicData = async (
  musicId: string
): Promise<MusicData | null> => {
  const fullpath = path.join(dir, musicId, "info.json");
  try {
    const fileContents = fs.readFileSync(fullpath, "utf8");
    const data: MusicData = await JSON.parse(fileContents);
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
};
