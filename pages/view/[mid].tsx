import { GetServerSideProps } from "next";
import Head from "next/head";
import Link from "next/link";
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  VFC,
  MouseEventHandler,
} from "react";
import Youtube from "react-youtube";
import { YouTubePlayer } from "youtube-player/dist/types";

import { Sheet } from "components/sheet";
import { Toggle } from "components/toggle";
import { MovList } from "components/movlist";
import { VideoCards } from "components/videocards";
import { BookCards } from "components/bookcards";
import { Avatar } from "components/avatar";
import { MemoView } from "components/memoview";

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

  const isResizing = useRef<boolean>(false);

  const mouseDownHandler: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (screen.current && videoView.current) {
        isResizing.current = true;

        const x = e.clientX;
        const w = videoView.current.getBoundingClientRect().width;

        const mouseMoveHandler = (e: MouseEvent) => {
          if (screen.current && videoView.current) {
            const dx = e.clientX - x;
            const percent_leftWidth =
              ((w + dx) * 100) / screen.current.getBoundingClientRect().width;

            videoView.current.style.width = `${percent_leftWidth}%`;
          }
        };

        const mouseUpHandler = () => {
          if (screen.current && videoView.current) {
            isResizing.current = false;

            document.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("mouseup", mouseUpHandler);

            screen.current.style.removeProperty("user-select");
            videoView.current.style.removeProperty("pointer-events");

            document.body.style.removeProperty("cursor");
          }
        };

        document.addEventListener("mousemove", mouseMoveHandler);
        document.addEventListener("mouseup", mouseUpHandler);

        screen.current.style.userSelect = "none";
        videoView.current.style.pointerEvents = "none";

        document.body.style.cursor = "col-resize";
      }
    },
    []
  );

  //
  // Main Logic -----------------------------------------------------------
  //

  const blocks = useRef<HTMLDivElement[]>(Array(9800));

  const [isFirstEndingOmitted, setIsFirstEndingOmitted] = useState<boolean>(
    scoreData.isFirstEndingOmitted
  );

  const allBlocksMovement: number[] = useMemo(() => {
    const getCurrentMovementFromBlockId = (id: number): number => {
      if (id >= 9800 && id < 9900) {
        return id - 9800;
      }
      for (const mov of musicData.movements) {
        if (id >= mov.reservation.from && id < mov.reservation.to) {
          return mov.movement;
        }
      }
      return -1;
    };

    return [...Array(10000)].map((_, i) => getCurrentMovementFromBlockId(i));
  }, [musicData.movements]);

  const getMovementFromBlockId = useCallback(
    (blockId: number): number => {
      return allBlocksMovement[blockId];
    },
    [allBlocksMovement]
  );

  const getMovementTextFromBlockId = useCallback(
    (blockId: number): string => {
      const mov = musicData.movements.find(
        (mov) => mov.movement === allBlocksMovement[blockId]
      );
      if (mov) return mov.title_jp ?? mov.title;
      else return "";
    },
    [allBlocksMovement, musicData]
  );

  const allBlocksMeasureNotOmittingFirstEnding: string[] = useMemo(() => {
    const res = [...Array(10000)].fill("");
    for (const mov of musicData.movements) {
      let id = mov.firstBlockId;
      let measureCount = id % 10;
      while (id <= mov.lastBlockId) {
        if (mov.devidedFirstBlockId.includes(id)) {
          res[id] = measureCount.toString() + "a";
          id += 1;
        } else if (mov.devidedFirstBlockId.includes(id - 1)) {
          res[id] = measureCount.toString() + "b";
          measureCount += 1;
          id += 1;
        } else {
          res[id] = measureCount.toString();
          measureCount += 1;
          id += 1;
        }
      }

      if (mov.cadenza) {
        for (const c of mov.cadenza) {
          let id_cadenza = c.firstBlockId;
          let measureCount_cadenza = id_cadenza % 10;
          while (id_cadenza <= c.lastBlockId) {
            if (c.devidedFirstBlockId.includes(id_cadenza)) {
              res[id_cadenza] = "c" + measureCount.toString() + "a";
              id_cadenza += 1;
            } else if (c.devidedFirstBlockId.includes(id_cadenza - 1)) {
              res[id_cadenza] = "c" + measureCount_cadenza.toString() + "b";
              measureCount_cadenza += 1;
              id_cadenza += 1;
            } else {
              res[id_cadenza] = "c" + measureCount_cadenza.toString();
              measureCount_cadenza += 1;
              id_cadenza += 1;
            }
          }
        }
      }
    }
    return res;
  }, [musicData.movements]);

  const allBlocksMeasureOmittingFirstEnding: string[] = useMemo(() => {
    const res = [...Array(10000)].fill("");
    for (const mov of musicData.movements) {
      let id = mov.firstBlockId;
      let measureCount = id % 10;
      let tempCount = measureCount;
      while (id <= mov.lastBlockId) {
        if (mov.firstEndingBlockId.includes(id)) {
          res[id] = tempCount.toString() + "'";
          tempCount += 1;
          id += 1;
        } else if (mov.devidedFirstBlockId.includes(id)) {
          res[id] = measureCount.toString() + "a";
          id += 1;
        } else if (mov.devidedFirstBlockId.includes(id - 1)) {
          res[id] = measureCount.toString() + "b";
          measureCount += 1;
          tempCount = measureCount;
          id += 1;
        } else {
          res[id] = measureCount.toString();
          measureCount += 1;
          tempCount = measureCount;
          id += 1;
        }
      }

      if (mov.cadenza) {
        for (const c of mov.cadenza) {
          let id_cadenza = c.firstBlockId;
          let measureCount_cadenza = id_cadenza % 10;
          let tempCount_cadenza = measureCount_cadenza;
          while (id_cadenza <= c.lastBlockId) {
            if (c.firstEndingBlockId.includes(id_cadenza)) {
              res[id_cadenza] = "c" + tempCount_cadenza.toString() + "'";
              tempCount_cadenza += 1;
              id_cadenza += 1;
            } else if (c.devidedFirstBlockId.includes(id_cadenza)) {
              res[id_cadenza] = "c" + measureCount_cadenza.toString() + "a";
              id_cadenza += 1;
            } else if (c.devidedFirstBlockId.includes(id_cadenza - 1)) {
              res[id_cadenza] = "c" + measureCount_cadenza.toString() + "b";
              measureCount_cadenza += 1;
              tempCount_cadenza = measureCount_cadenza;
              id += 1;
            } else {
              res[id_cadenza] = "c" + measureCount_cadenza.toString();
              measureCount_cadenza += 1;
              tempCount_cadenza = measureCount_cadenza;
              id_cadenza += 1;
            }
          }
        }
      }
    }
    return res;
  }, [musicData.movements]);

  const getMeasureFromBlockId = useCallback(
    (blockId: number): string => {
      return isFirstEndingOmitted
        ? allBlocksMeasureOmittingFirstEnding[blockId]
        : allBlocksMeasureNotOmittingFirstEnding[blockId];
    },
    [
      isFirstEndingOmitted,
      allBlocksMeasureOmittingFirstEnding,
      allBlocksMeasureNotOmittingFirstEnding,
    ]
  );

  const [currentBlockId, setCurrentBlockId] = useState<number>(9999);

  const currentMeasure = useMemo(() => {
    return getMeasureFromBlockId(currentBlockId);
  }, [currentBlockId, getMeasureFromBlockId]);

  const currentMovement = useMemo(() => {
    return getMovementFromBlockId(currentBlockId);
  }, [currentBlockId, getMovementFromBlockId]);

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
        timerId.current = setInterval(tick, 20);
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

  const scrollScoreView = useCallback(
    (blockId: number): void => {
      if (blockId === 9999) return;
      console.log("scroll");

      let checkId = blockId;
      if (blockId >= 9800 && blockId < 9900 && musicData.movements) {
        const tempId = musicData.movements.find(
          (mov) => mov.movement === blockId - 9800
        )?.firstBlockId;
        if (tempId) checkId = tempId;
      }

      if (
        blocks.current[checkId] &&
        scoreContent.current &&
        scoreView.current &&
        screen.current &&
        !isResizing.current
      ) {
        const rect = blocks.current[checkId].getBoundingClientRect();
        // Phone or Tablet
        const screenTop = screen.current.scrollTop;
        screen.current.scrollTo({
          top: screenTop + rect.top - scoreView.current.clientWidth / 17,
          behavior: "smooth",
        });
        // PC
        const scoreContentTop = scoreContent.current.scrollTop;
        scoreContent.current.scrollTo({
          top: scoreContentTop + rect.top - scoreView.current.clientWidth / 17,
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
  // Side Menu --------------------------------------------------------------
  //

  const [isOpenSideMenu, setIsOpenSideMenu] = useState<boolean>(false);

  //
  // JSX ---------------------------------------------------------------------
  //

  return (
    <>
      <Head>
        <title>{musicData.title_jp ?? musicData.title} - SimulScore</title>
        <meta
          name="description"
          content={`${musicData.title_jp ?? musicData.title}(${
            musicData.composer_jp ?? musicData.composer
          })の動画・楽譜を閲覧`}
        />
        <meta
          property="og:title"
          content={`${musicData.title_jp ?? musicData.title} - SimulScore`}
        />
        <meta
          property="og:url"
          content={`https://www.simulscore.app/${musicData.musicId}`}
        />
        <meta
          property="og:description"
          content={`${musicData.title_jp ?? musicData.title}(${
            musicData.composer_jp ?? musicData.composer
          })の動画・楽譜を閲覧`}
        />
      </Head>

      <div>
        {/* プライマリボタン(スマホ版のみ) */}
        <div
          className={`fixed lg:hidden z-50 rounded-full cursor-pointer w-16 h-16 bottom-12 right-4 border-4 bg-green-800 ${
            isOpenSideMenu ? "border-red-500" : "border-blue-500"
          }`}
          onClick={() => setIsOpenSideMenu((b) => !b)}
        ></div>

        {/* メインスクリーン */}
        <div
          ref={screen}
          className="lg:flex w-screen h-screen overflow-y-auto lg:overflow-hidden"
        >
          <div
            ref={videoView}
            className="flex flex-col bg-warmGray-100 w-full lg:w-1/2 lg:min-w-80 lg:overflow-y-auto lg:overflow-x-hidden"
          >
            {/* ヘッダー */}
            <header className="w-full bg-green-800 z-20">
              <div className="flex px-4 py-2 items-center">
                <div className="flex-none">
                  {/* ホームへのリンク */}
                  <Link href="/">
                    <a className="flex">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        height="24px"
                        viewBox="0 0 24 24"
                        width="24px"
                        fill="#FFFFFF"
                      >
                        <path d="M0 0h24v24H0V0z" fill="none" />
                        <path d="M12 5.69l5 4.5V18h-2v-6H9v6H7v-7.81l5-4.5M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                      </svg>
                      <span className="font-bold text-white pl-1">Home</span>
                    </a>
                  </Link>
                </div>
                <div className="flex-grow"></div>
                {/* ユーザーアバター */}
                <div className="flex-none pr-1">
                  <Avatar />
                </div>
              </div>
            </header>

            {/* スクロールボタン(メイン) */}
            <div className="w-full px-2 pt-2 flex flex-row-reverse items-center">
              <p
                className={`text-xs text-right font-bold w-5 mx-1 ${
                  isAutoScroll ? "text-blue-600" : "text-warmGray-500"
                }`}
              >
                {isAutoScroll ? "ON" : "OFF"}
              </p>
              <Toggle
                selected={isAutoScroll}
                onClick={() => setIsAutoScroll((b) => !b)}
              ></Toggle>
              <p className="text-warmGray-500 text-xs font-bold mx-1 truncate tracking-wide">
                自動スクロール
              </p>
            </div>
            <div className="w-full px-2 pt-0.5 flex flex-row-reverse items-center">
              <p
                className={`text-xs text-right font-bold w-5 mx-1 ${
                  isFirstEndingOmitted ? "text-blue-600" : "text-warmGray-500"
                }`}
              >
                {isFirstEndingOmitted ? "ON" : "OFF"}
              </p>
              <Toggle
                selected={isFirstEndingOmitted}
                onClick={() => setIsFirstEndingOmitted((b) => !b)}
              ></Toggle>
              <p className="text-warmGray-500 text-xs font-bold mx-1 truncate tracking-wide">
                第1,第2括弧で小節番号の重複
              </p>
            </div>

            {/* 曲のタイトル・作曲家 */}
            <div className="w-full bg-warmGray-100 mx-4 mb-4">
              <p className="text-lg font-bold truncate text-warmGray-500 tracking-wide">
                {musicData.composer_jp ?? musicData.composer}
              </p>
              <h1 className="text-3xl text-green-800 font-bold pt-1 tracking-wide">
                {musicData.title_jp ?? musicData.title}{" "}
                <span className="text-xl tracking-wide">{musicData.opus}</span>
              </h1>
            </div>

            {/* YouTube埋め込み */}
            <div className="px-4">
              <div className="relative w-full h-0 overflow-hidden pb-9/16">
                <Youtube
                  videoId={videoId}
                  className="absolute w-full h-full top-0 left-0"
                  onReady={onPlayerReady}
                  onStateChange={onPlayerStateChange}
                />
              </div>

              {/* 楽章一覧 */}
              {musicData.movements ? (
                <MovList
                  currentMovement={currentMovement}
                  movementsData={musicData.movements}
                  onClick={onDivClick}
                />
              ) : null}

              {/* 小節番号を表示 */}
              <div className="flex items-end">
                <div className="flex-none w-16 h-8 bg-warmGray-300 rounded-lg text-right text-warmGray-700 text-xl pr-2 py-0.5 ml-2">
                  {currentMeasure}
                </div>
                <div className="flex-none text-xs text-warmGray-600 px-0.5">
                  小節
                </div>
              </div>
            </div>

            {/* 動画の情報 */}
            <div className="pl-6 pr-4 pt-4 pb-12">
              {thisVideoInfo?.players.map((p) => {
                return (
                  <div key={p.part + "_" + p.name} className="pl-2 pt-4">
                    <p className="text-lg font-medium text-warmGray-700">
                      {p.name_jp ?? p.name}
                    </p>
                    <p className="text-sm font-light italic text-warmGray-500">
                      {p.part_jp ?? p.part}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* 折り畳み画面(スマホ版) */}
            <div
              className={`fixed lg:static top-full lg:inset-0 z-40 lg:z-0 h-screen lg:h-auto w-screen lg:w-full bg-warmGray-100 transition lg:transition-none transform ease-out duration-300 overflow-y-auto lg:overflow-visible ${
                isOpenSideMenu ? "-translate-y-full lg:translate-y-0" : ""
              }`}
            >
              <div className="mx-4">
                {/* スクロールボタン(スマホ版のみ) */}
                <div className="lg:hidden w-full py-2 flex flex-row-reverse items-center">
                  <p
                    className={`text-xs text-right font-bold w-5 mx-1 ${
                      isAutoScroll ? "text-blue-600" : "text-warmGray-500"
                    }`}
                  >
                    {isAutoScroll ? "ON" : "OFF"}
                  </p>
                  <Toggle
                    selected={isAutoScroll}
                    onClick={() => setIsAutoScroll((b) => !b)}
                  ></Toggle>
                  <p className="text-warmGray-500 text-xs font-bold mx-1 truncate tracking-wide">
                    自動スクロール
                  </p>
                </div>

                {/* メモ */}
                <div className="h-px mb-2 mx-2 bg-warmGray-300"></div>
                <h2 className="text-xl text-green-800 font-bold mx-2 truncate">
                  メモ帳
                </h2>
                <div className="px-2 pt-4">
                  <MemoView
                    musicId={musicData.musicId}
                    currentBlockId={currentBlockId}
                    getMovementFromBlockId={getMovementTextFromBlockId}
                    getMeasureFromBlockId={getMeasureFromBlockId}
                    onMemoClick={onDivClick}
                  />
                </div>

                {/* 他の動画リスト */}
                <div className="h-px mt-12 mb-2 mx-2 bg-warmGray-300"></div>
                <h2 className="text-xl text-green-800 font-bold mx-2 truncate">
                  他の動画
                </h2>
                <div className="px-2 pt-4">
                  <VideoCards
                    musicId={musicData.musicId}
                    scoreId={scoreId}
                    otherVideoInfos={otherVideoInfos}
                  />
                </div>

                {/* 楽譜の情報 */}
                <div className="h-px mt-12 mb-2 mx-2 bg-warmGray-300"></div>
                <h2 className="text-xl text-green-800 font-bold mx-2 truncate">
                  楽譜の情報
                </h2>
                <div className="w-full pl-4 pt-4">
                  <img
                    src={`https://storage.googleapis.com/treatedscorebucket/images/${scoreId}/1.png`}
                    alt="sheet"
                    className="w-48"
                  />
                  {/* 楽譜ダウンロードリンク */}
                  <a
                    href={`https://imslp.org/wiki/Special:ReverseLookup/${scoreId}`}
                    rel="noreferrer"
                    target="_blank"
                    className="w-min mt-4 p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-md flex justify-center hover:shadow-lg"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24px"
                      width="24px"
                      viewBox="0 0 24 24"
                      fill="#FFFFFF"
                    >
                      <path d="M0 0h24v24H0V0z" fill="none" />
                      <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                    </svg>
                    <span className="w-max font-bold text-sm ml-2 mt-0.5">
                      {thisScoreInfo?.source === "imslp"
                        ? "ダウンロード (IMSLP)"
                        : "ダウンロード"}
                    </span>
                  </a>
                  <h4 className="font-bold text-base text-green-800 mt-4">
                    出版社情報
                  </h4>
                  <p className="whitespace-pre-wrap text-warmGray-700 ml-4 text-sm">
                    {thisScoreInfo?.publisher}
                  </p>
                  <h4 className="font-bold text-base text-green-800 mt-4">
                    著作権
                  </h4>
                  <p className="whitespace-pre-wrap text-warmGray-700 ml-4 text-sm">
                    {thisScoreInfo?.copyright}
                  </p>
                </div>

                {/* 関連書籍 */}
                <div className="h-px mt-12 mb-2 mx-2 bg-warmGray-300"></div>
                <h2 className="text-xl text-green-800 font-bold mx-2 truncate">
                  関連書籍 - amazon.co.jp へのリンク
                </h2>
                <h4 className="font-bold text-base text-green-800 mt-4 ml-4">
                  この曲のスコア
                </h4>
                <div className="mx-4 mt-2">
                  <BookCards
                    bookInfos={musicData.books?.filter(
                      (b) => b.language === "jp" && b.type === "score"
                    )}
                  />
                </div>
              </div>

              {/* フッター */}
              <footer className="flex w-full bg-green-800 justify-center mt-14">
                <Link href="/">
                  <a className="text-warmGray-100 font-extrabold text-lg my-4">
                    SimulScore
                  </a>
                </Link>
              </footer>
            </div>
          </div>

          {/* リサイズバー(PC版のみ) */}
          <div
            ref={resizer}
            onMouseDown={mouseDownHandler}
            className="hidden lg:flex bg-warmGray-400 w-4 min-w-4 h-full cursor-col-resize shadow-md items-center justify-center"
          >
            <div className="w-0.5 h-8 bg-warmGray-600 rounded-full mr-px"></div>
            <div className="w-0.5 h-8 bg-warmGray-600 rounded-full ml-px"></div>
          </div>

          {/* スコア */}
          <div
            ref={scoreView}
            className="bg-warmGray-100 z-0 lg:flex-1 flex justify-center select-none lg:min-w-80"
          >
            <div
              ref={scoreContent}
              className="w-full h-full lg:overflow-y-auto"
            >
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
      </div>
    </>
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
