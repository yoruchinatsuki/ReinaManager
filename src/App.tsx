import './App.css'
import { Outlet } from "react-router";
import { NAVIGATION } from '@/routes'
import { ReactRouterAppProvider } from '@toolpad/core/react-router';

const App: React.FC = () => {
  return (
    // <BrowserRouter>
    //   <Routes>
    //     {routes.map((route) => (
    //       <Route key={route.path} path={route.path} element={<Layout title={route.title} outpage={route.page} path={route.path} />} />
    //     ))}
    //   </Routes>
    // </BrowserRouter>
    <ReactRouterAppProvider navigation={NAVIGATION}>
      <Outlet />
    </ReactRouterAppProvider>
  )

}

export default App
