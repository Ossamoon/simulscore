import { VFC, useState, useContext } from "react";

import { AuthContext } from "components/auth";
import { UserCard } from "components/usercard";
import { SigninCard } from "components/signincard";

export const Avatar: VFC = () => {
  // Auth
  const { currentUser } = useContext(AuthContext);

  // State
  const [isOpenUserCard, setIsOpenUserCard] = useState<boolean>(false);
  const [isOpenSigninCard, setIsOpenSigninCard] = useState<boolean>(false);

  return (
    <>
      {currentUser?.photoURL ? (
        <>
          <div className="relative z-50">
            <img
              className="h-9 w-9 rounded-full cursor-pointer"
              src={currentUser?.photoURL}
              alt=""
              onClick={() => setIsOpenUserCard((b) => !b)}
            />
            {isOpenUserCard ? (
              <>
                <div
                  className="fixed inset-0 w-full h-full z-40"
                  onClick={() => setIsOpenUserCard(false)}
                ></div>
                <div className="absolute top-11 -right-3.5 z-50">
                  <UserCard currentUser={currentUser} />
                </div>
              </>
            ) : null}
          </div>
        </>
      ) : (
        <div className="relative z-50">
          <div
            onClick={() => setIsOpenSigninCard((b) => !b)}
            className="w-max rounded-md font-bold text-warmGray-100 text-sm hover:text-warmGray-300 text-center border border-warmGray-100 hover:border-warmGray-300 px-4 py-2 cursor-pointer"
          >
            ログイン
          </div>
          {isOpenSigninCard ? (
            <>
              <div
                className="fixed inset-0 w-full h-full z-40"
                onClick={() => setIsOpenSigninCard(false)}
              ></div>
              <div className="absolute top-11 -right-2 z-50">
                <SigninCard />
              </div>
            </>
          ) : null}
        </div>
      )}
    </>
  );
};
