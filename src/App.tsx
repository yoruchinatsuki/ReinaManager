import './App.css'
import '@/utils/i18n';
import { Outlet } from "react-router";
import type { Navigation } from '@toolpad/core';
import { ReactRouterAppProvider } from '@toolpad/core/react-router'
import HomeIcon from '@mui/icons-material/Home';
import GamesIcon from '@mui/icons-material/Games';
import SettingsIcon from '@mui/icons-material/Settings';
import { useStore } from './store';
import { useTranslation } from 'react-i18next';
import { getGamePlatformId } from '@/utils';

const App: React.FC = () => {
  const { t } = useTranslation();
  const { games } = useStore();
  const lists = games.map((game) => {
    return {
      title: game.name_cn === "" ? game.name : game.name_cn,
      segment: getGamePlatformId(game)
    }
  })
  const NAVIGATION: Navigation = [
    {
      kind: 'header',
      title: t('app.NAVIGATION.menu'),
    },
    {
      title: t('app.NAVIGATION.home'),
      icon: <HomeIcon />,
    },
    {
      segment: 'libraries',
      title: t('app.NAVIGATION.gameLibrary'),
      icon: <GamesIcon />,
      children: [
        ...lists,
      ]
    },
    {
      segment: 'settings',
      title: t('app.NAVIGATION.settings'),
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
