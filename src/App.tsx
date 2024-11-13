import "./App.css";
import { Outlet } from "react-router-dom";
import { FC } from "react";

const App: FC = (): JSX.Element => {
  return (
    <>
      <Outlet />
    </>
  );
};

export default App;
