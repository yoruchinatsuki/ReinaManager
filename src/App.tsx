import './App.css'
import { BrowserRouter, Routes, Route } from "react-router";
import Layout from '@/components/Layout'
import routes from '@/routes'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={<Layout title={route.title} outpage={route.page} path={route.path} />} />
        ))}
      </Routes>
    </BrowserRouter>
  )

}

export default App
