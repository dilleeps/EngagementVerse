import { useEffect, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Provider } from "react-redux";
import { FullLoader } from "./Components/LoaderBox/Loader";
import store from "./store/store";

const TopLoaderBox = FullLoader(
  () => import("./Components/LoaderBox/TopLoaderBox")
);
const Routes = FullLoader(() => import("./Routes/Routes"));

export const loaderRef = { barRef: null };

export default function App() {
  const myRef = useRef(null);

  useEffect(() => {
    loaderRef.barRef = myRef;
  }, []);

  return (
    <Provider store={store}>
      <TopLoaderBox ref={myRef} />
      <DndProvider backend={HTML5Backend}>
        <Routes />
      </DndProvider>
    </Provider>
  );
}
