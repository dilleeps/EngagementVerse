import { FullLoader } from "@/Components/LoaderBox/Loader";

export default [
  {
    path: "/app/dashboard",
    screen: FullLoader(() => import("../Screens/Dashboard/Dashboard")),
  },
];
