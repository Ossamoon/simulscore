import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "data", "music");

export type VideoData = {
  videoId: string;
  musicId: string;
  times: {
    id: number;
    time: number;
  }[];
};

export const getVideoData = async (
  musicId: string,
  videoId: string
): Promise<VideoData | null> => {
  const fullpath = path.join(dir, musicId, "video", `${videoId}.json`);
  try {
    const fileContents = fs.readFileSync(fullpath, "utf8");
    const data: VideoData = await JSON.parse(fileContents);
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
};
