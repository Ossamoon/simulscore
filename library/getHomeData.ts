import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "data");

export type HomeData = {
  composer: {
    id: string;
    name: string;
    name_jp: string;
    musics: {
      id: string;
      title: string;
      title_jp: string;
      opus?: string;
    }[];
  }[];
};

export const getHomeData = async (): Promise<HomeData | null> => {
  const fullpath = path.join(dir, "homedata.json");
  try {
    const fileContents = fs.readFileSync(fullpath, "utf8");
    const data: HomeData = await JSON.parse(fileContents);
    return data;
  } catch (err) {
    console.log(err);
    return null;
  }
};
