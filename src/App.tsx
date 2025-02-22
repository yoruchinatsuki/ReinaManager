import './App.css'
import { Outlet } from "react-router";
// import { NAVIGATION } from '@/routes'
import type { Navigation } from '@toolpad/core';
import { ReactRouterAppProvider } from '@toolpad/core/react-router'
import HomeIcon from '@mui/icons-material/Home';
import GamesIcon from '@mui/icons-material/Games';
import SettingsIcon from '@mui/icons-material/Settings';
import { useGameStore } from './store';

const App: React.FC = () => {
  const { games } = useGameStore();
  const lists = games.map((game) => {
    return {
      title: game.name_cn === "" ? game.name : game.name_cn,
      segment: game.game_id
    }
  })
  const NAVIGATION: Navigation = [
    {
      kind: 'header',
      title: '菜单',
    },
    {
      title: '主页',
      icon: <HomeIcon />,
    },
    {
      segment: 'libraries',
      title: '游戏仓库',
      icon: <GamesIcon />,
      children: [
        ...lists,
      ]
    },
    {
      segment: 'settings',
      title: '设置',
      icon: <SettingsIcon />,
    }
  ];


  return (
    <ReactRouterAppProvider navigation={NAVIGATION}>
      <Outlet />
    </ReactRouterAppProvider>
  )

}

export default App
