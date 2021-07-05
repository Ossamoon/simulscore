import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  VFC,
} from "react";
import Youtube from "react-youtube";
import { YouTubePlayer } from "youtube-player/dist/types";

import { Sheet } from "components/sheet";
import { Toggle } from "components/toggle";
import { MovList } from "components/movlist";
import { VideoCards } from "components/videocards";

import { getMusicData, MusicData } from "library/getMusicData";
import { getVideoData, VideoData } from "library/getVideoData";
import { getScoreData, ScoreData } from "library/getScoreData";

type Props = {
  musicData: MusicData;
  videoData: VideoData;
  scoreData: ScoreData;
};

const SmartScoreReader: VFC<Props> = ({ musicData, videoData, scoreData }) => {
  //
  // Data Source ---------------------------------------------------------
  //

  const videoId = useMemo(() => videoData.videoId, [videoData.videoId]);
  const scoreId = useMemo(() => scoreData.scoreId, [scoreData.scoreId]);
  const thisVideoInfo = useMemo(() => {
    return musicData.videos.find((v) => v.videoId === videoId);
  }, [musicData.videos, videoId]);
  const otherVideoInfos = useMemo(() => {
    return musicData.videos.filter((v) => v.videoId !== videoId);
  }, [musicData.videos, videoId]);
  const thisScoreInfo = useMemo(() => {
    return musicData.scores.find((s) => s.scoreId === scoreId);
  }, [musicData.scores, scoreId]);

  //
  // Resizable Split Screen Logic ------------------------------------------
  //

  const screen = useRef<HTMLDivElement>(null);
  const videoView = useRef<HTMLDivElement>(null);
  const resizer = useRef<HTMLDivElement>(null);
  const scoreView = useRef<HTMLDivElement>(null);

  const x = useRef<number>(0);
  const videoViewWidth = useRef<number>(0);

  useEffect(() => {
    const mouseDownHandler = (e: MouseEvent) => {
      if (screen.current && videoView.current) {
        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);

        x.current = e.clientX;
        videoViewWidth.current =
          videoView.current.getBoundingClientRect().width;

        screen.current.style.userSelect = "none";
        videoView.current.style.pointerEvents = "none";

        document.body.style.cursor = "col-resize";
      }
    };

    const mouseMoveHandler = (e: MouseEvent) => {
      if (screen.current && videoView.current) {
        const dx = e.clientX - x.current;
        const percent_leftWidth =
          ((videoViewWidth.current + dx) * 100) /
          screen.current.getBoundingClientRect().width;

        videoView.current.style.width = `${percent_leftWidth}%`;
      }
    };

    const mouseUpHandler = () => {
      if (screen.current && videoView.current) {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);

        screen.current.style.removeProperty("user-select");
        videoView.current.style.removeProperty("pointer-events");

        document.body.style.removeProperty("cursor");
      }
    };

    if (resizer.current) {
      resizer.current.addEventListener("mousedown", mouseDownHandler);
    }
  }, []);

  //
  // Main Logic -----------------------------------------------------------
  //

  const blocks = useRef<HTMLDivElement[]>(Array(9800));

  const allBlocksMeasures: number[] = useMemo(() => {
    const getCurrentMovementFromBlockId = (id: number): number => {
      if (id >= 9800 && id < 9900) {
        return id - 9800;
      }
      if (musicData.movements) {
        for (const mov of musicData.movements) {
          if (id >= mov.reservation.from && id < mov.reservation.to) {
            return mov.movement;
          }

          if (mov.cadenza) {
            for (const cad of mov.cadenza) {
              if (id >= cad.reservation.from && id < cad.reservation.to) {
                return mov.movement;
              }
            }
          }
        }
      }
      return -1;
    };

    return [...Array(10000)].map((_, i) => getCurrentMovementFromBlockId(i));
  }, [musicData.movements]);

  const [currentBlockId, setCurrentBlockId] = useState<number>(9999);
  const [currentMeasure, setCurrentMeasure] = useState<number>(-1);
  useEffect(() => {
    setCurrentMeasure(allBlocksMeasures[currentBlockId]);
  }, [currentBlockId, allBlocksMeasures]);

  //
  // Timer -----------------------------------------------------------------
  //

  const timerId = useRef<NodeJS.Timeout>();

  const tick = useCallback(() => {
    const getCurrentBlockIdFromTime = (time: number): number => {
      // Binary search
      let min = -1;
      let max = videoData.times.length;
      while (max - min > 1) {
        const mid = Math.floor((min + max) / 2);
        if (time >= videoData.times[mid].time) {
          min = mid;
        } else {
          max = mid;
        }
      }
      if (min === -1) {
        return 9999;
      } else {
        return videoData.times[min].id;
      }
    };

    if (player.current) {
      const current_time = player.current.getCurrentTime();
      const current_block_id = getCurrentBlockIdFromTime(current_time);
      setCurrentBlockId(current_block_id);
    }
  }, [videoData.times]);

  //
  // YouTube Player ----------------------------------------------------------
  //

  const player = useRef<YouTubePlayer>();

  const onPlayerReady = useCallback(
    (event: { target: YouTubePlayer }): void => {
      player.current = event.target;
    },
    []
  );

  const onPlayerStateChange = useCallback(
    (event: { target: YouTubePlayer; data: number }): void => {
      console.log(`Player State: ${event.data}`);
      if (event.data === 1) {
        timerId.current = setInterval(tick, 35);
      } else if (event.data !== 1) {
        if (timerId.current) clearInterval(timerId.current);
      }
    },
    [tick]
  );

  //
  // Scroll -----------------------------------------------------------------
  //

  const scoreContent = useRef<HTMLDivElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState<boolean>(true);

  const onToggleClick = useCallback(() => {
    setIsAutoScroll((b) => !b);
  }, []);

  const scrollScoreView = useCallback(
    (blockId: number): void => {
      if (blockId === 9999) return;
      console.log("scroll");

      let checkId = blockId;
      if (blockId >= 9800 && blockId < 9900 && musicData.movements) {
        const tempId = musicData.movements.find(
          (mov) => mov.movement === blockId - 9800
        )?.first_blockId;
        if (tempId) checkId = tempId;
      }

      if (
        blocks.current[checkId] &&
        scoreContent.current &&
        scoreView.current
      ) {
        const rect = blocks.current[checkId].getBoundingClientRect();
        const scrollTop = scoreContent.current.scrollTop;
        scoreContent.current.scrollTo({
          top: scrollTop + rect.top - scoreView.current.clientWidth / 17,
          behavior: "smooth",
        });
      }
    },
    [musicData.movements]
  );

  useEffect(() => {
    if (isAutoScroll) scrollScoreView(currentBlockId);
  }, [isAutoScroll, currentBlockId, scrollScoreView]);

  //
  // Click Event ------------------------------------------------------------
  //

  const onDivClick = useCallback(
    (id: number): void => {
      const jumpdata = videoData.times
        .filter((data) => data.id === id)
        .slice(-1)[0];
      if (player.current && jumpdata) {
        player.current.seekTo(jumpdata.time, true);
        setCurrentBlockId(id);
      }
      console.log(`Clicked BlodkId: ${id}`);
    },
    [videoData.times]
  );

  //
  // JSX ---------------------------------------------------------------------
  //

  return (
    <div>
      <Head>
        <title>{musicData.title_jp ?? musicData.title}</title>
        <meta name="description" content="Main Viewer" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div ref={screen} className="flex w-screen h-screen">
          <div
            ref={videoView}
            className="bg-green-100 w-238/500 h-full flex-col overflow-y-auto overflow-x-hidden"
          >
            <div className="w-full bg-green-400">
              <div className="mx-4 pt-4 pb-3">
                <p className="text-2xl font-semibold italic truncate text-green-800 p-1 tracking-wide">
                  {musicData.composer_jp ?? musicData.composer}
                </p>
                <h1 className="text-4xl font-extrabold p-1 tracking-wide">
                  {musicData.title_jp ?? musicData.title}{" "}
                  <span className="text-base font-normal text-gray-700 tracking-wide">
                    {musicData.opus}
                  </span>
                </h1>
              </div>
            </div>
            <div className="mx-4 pt-3">
              <div className="w-full h-8 pb-1 flex flex-row-reverse items-center">
                <p
                  className={`text-xs text-right font-bold w-5 mx-1 ${
                    isAutoScroll ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {isAutoScroll ? "ON" : "OFF"}
                </p>
                <Toggle
                  selected={isAutoScroll}
                  onClick={onToggleClick}
                ></Toggle>
                <p className="text-gray-500 text-xs font-semibold mx-1 truncate tracking-wide">
                  自動スクロール
                </p>
              </div>
              <div className="relative w-full h-0 overflow-hidden pb-9/16">
                <Youtube
                  videoId={videoId}
                  className="absolute w-full h-full top-0 left-0"
                  onReady={onPlayerReady}
                  onStateChange={onPlayerStateChange}
                />
              </div>
              {musicData.movements ? (
                <MovList
                  currentMeasure={currentMeasure}
                  movementsData={musicData.movements}
                  onClick={onDivClick}
                />
              ) : null}
              <div className="w-full pt-4">
                {thisVideoInfo?.players.map((p) => {
                  return (
                    <div key={p.part + "_" + p.name} className="px-4 py-2">
                      <p className="text-lg font-medium truncate">
                        {p.name_jp ?? p.name}
                      </p>
                      <p className="text-sm font-light italic text-gray-500 truncate">
                        {p.part_jp ?? p.part}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="h-px bg-green-800 mt-10 mb-3 mx-4"></div>
              <h2 className="text-xl font-bold mx-4 mb-1 text-green-800 truncate">
                他の動画
              </h2>
              <VideoCards
                musicId={musicData.musicId}
                scoreId={scoreId}
                otherVideoInfos={otherVideoInfos}
              />
              <div className="h-px bg-green-800 mt-10 mb-3 mx-4"></div>
              <h2 className="text-xl font-bold mx-4 mb-1 text-green-800 truncate">
                楽譜の情報
              </h2>
              <div className="w-full flex flex-wrap ml-5">
                <div className="w-max flex-shrink-0 mx-3 mt-4">
                  <img
                    src={`https://storage.googleapis.com/treatedscorebucket/images/${scoreId}/1.png`}
                    alt="sheet"
                    className="w-44"
                  />
                </div>
                <div className="ml-3">
                  <div className="mt-4 w-52 mr-auto">
                    <a
                      href={`https://imslp.org/wiki/Special:ReverseLookup/${scoreId}`}
                      rel="noreferrer"
                      target="_blank"
                      className="mt-4 w-52 mr-auto"
                    >
                      <div className="p-3 bg-purple-600 hover:bg-purple-500 rounded-md flex justify-center hover:shadow-xl">
                        <Image
                          src="/open_in_new.svg"
                          alt="Open Logo"
                          width={20}
                          height={20}
                        />
                        <span className="font-bold text-sm text-white ml-2">
                          {thisScoreInfo?.source === "imslp"
                            ? "ダウンロード (IMSLP)"
                            : "ダウンロード"}
                        </span>
                      </div>
                    </a>
                  </div>
                  <h4 className="font-bold text-base text-gray-600 mt-4">
                    出版社情報
                  </h4>
                  <p className="whitespace-pre-wrap ml-3 mr-1 text-sm">
                    {thisScoreInfo?.publisher}
                  </p>
                  <h4 className="font-bold text-base text-gray-600 mt-4">
                    著作権
                  </h4>
                  <p className="whitespace-pre-wrap ml-3 mr-1 text-sm">
                    {thisScoreInfo?.copyright}
                  </p>
                </div>
              </div>
            </div>
            <footer className="w-full h-20 bg-green-900 flex justify-center mt-14">
              <Link href="/">
                <a className="text-white font-extrabold text-lg mt-6">
                  SimulScore
                </a>
              </Link>
            </footer>
          </div>
          <div
            ref={resizer}
            className="bg-green-600 w-4 min-w-4 h-full cursor-col-resize shadow-md flex items-center justify-center"
          >
            <div className="w-0.5 h-8 bg-green-800 rounded-full mr-px"></div>
            <div className="w-0.5 h-8 bg-green-800 rounded-full ml-px"></div>
          </div>
          <div
            ref={scoreView}
            className="bg-gray-300 flex-1 flex justify-center select-none min-w-60"
          >
            <div ref={scoreContent} className="w-full h-full overflow-y-auto">
              {[...Array(scoreData.positions.length)].map((_, i) => {
                return (
                  <Sheet
                    key={`p_${scoreData.positions[i].page}`}
                    srcdir={`https://storage.googleapis.com/treatedscorebucket/images/${scoreId}/`}
                    page={scoreData.positions[i].page}
                    rows={scoreData.positions[i].rows}
                    current={currentBlockId}
                    refs={blocks}
                    onClick={onDivClick}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const query = context.query;
  const musicData: MusicData | null = await getMusicData(query.mid as string);
  const videoData: VideoData | null = query.vid
    ? await getVideoData(query.mid as string, query.vid as string)
    : await getVideoData(
        query.mid as string,
        musicData?.videos[0].videoId as string
      );
  const scoreData: ScoreData | null = query.sid
    ? await getScoreData(query.mid as string, query.sid as string)
    : await getScoreData(
        query.mid as string,
        musicData?.scores[0].scoreId as string
      );

  if (!musicData || !videoData || !scoreData) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      musicData,
      videoData,
      scoreData,
    },
  };
};

export default SmartScoreReader;
