import firebase from "library/firebase";
import { VFC } from "react";

type Props = {
  currentUser: firebase.User | null | undefined;
};

export const UserCard: VFC<Props> = ({ currentUser }) => {
  return (
    <div className="w-72 bg-white shadow-2xl rounded-lg pt-4 pb-2">
      <div>
        {currentUser?.photoURL ? (
          <img
            className="h-20 w-20 rounded-full mx-auto"
            src={currentUser?.photoURL}
            alt=""
          />
        ) : (
          <div className="h-20 w-20 rounded-full bg-blue-400 mx-auto"></div>
        )}
        <div className="font-bold text-warmGray-900 text-center truncate">
          {currentUser?.displayName}
        </div>
        <div className="text-warmGray-600 text-center text-sm truncate">
          {currentUser?.email}
        </div>
      </div>

      <div className="w-ful h-px bg-warmGray-100 mt-4"></div>

      <div
        className="hover:bg-warmGray-100 cursor-pointer text-warmGray-600 text-sm px-4 py-2"
        onClick={() => {
          firebase.auth().signOut();
        }}
      >
        ログアウト
      </div>
    </div>
  );
};
