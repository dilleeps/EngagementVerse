import { FullLoader } from "@/Components/LoaderBox/Loader";

export default [
  {
    path: "/",
    screen: FullLoader(() => import("../Screens/MarketingPages/Home/Home")),
  },
  {
    path: "/login",
    screen: FullLoader(() => import("../Screens/Login/Login")),
  },
  {
    path: "/onboarding",
    screen: FullLoader(
      () => import("../Screens/CompanyOnboarding/CompanyOnboarding")
    ),
  },
];
