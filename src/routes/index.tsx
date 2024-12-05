import {RouterProvider, createBrowserRouter} from "react-router-dom";
import Home from "../views/Home/home";
// import H1 from "../views/Home/H1";
const Routes = () => {

    const routesForPublic:any=[
        {
            path:"/",
            element:<Home/>
        },
        {
            path:"/H1",
            element:<></>,
        }
    ]
    const router=createBrowserRouter([
        ...routesForPublic
    ]);
  return <RouterProvider router={router}/>;
};

export default Routes;