import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArticleIcon from '@mui/icons-material/Article';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';


interface RightMenuProps {
    isopen: boolean;
    anchorPosition?: { top: number; left: number };
    setAnchorEl: (value: null) => void;
}
const RightMenu: React.FC<RightMenuProps> = ({ isopen, anchorPosition, setAnchorEl }) => {

    return (
        <>
            <Menu
                open={isopen}
                onClose={() => setAnchorEl(null)}
                anchorReference="anchorPosition"
                anchorPosition={anchorPosition}
                transitionDuration={200}
            >

                <MenuItem disableRipple>
                    <PlayCircleOutlineIcon />
                    启动游戏
                </MenuItem>
                <MenuItem disableRipple>
                    <ArticleIcon />
                    进入详情页
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem disableRipple>
                    <FolderOpenIcon />
                    打开本地文件夹
                </MenuItem>
                <MenuItem disableRipple>
                    <MoreHorizIcon />
                    更多
                </MenuItem>
            </Menu>
        </>
    );
}
export default RightMenu;
