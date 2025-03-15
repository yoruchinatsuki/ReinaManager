import { useState, useEffect, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useStore } from '@/store';

// 防抖函数
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export const SearchBox = () => {
    const { searchKeyword, searchGames } = useStore();
    const [keyword, setKeyword] = useState(searchKeyword);

    // 对输入值应用防抖
    const debouncedKeyword = useDebounce(keyword, 300);

    // 执行搜索
    const performSearch = useCallback((term: string) => {
        searchGames(term);
    }, [searchGames]);

    // 同步全局状态
    useEffect(() => {
        setKeyword(searchKeyword);
    }, [searchKeyword]);

    // 当防抖后的关键字变化时，执行搜索
    useEffect(() => {
        performSearch(debouncedKeyword);
    }, [debouncedKeyword, performSearch]);

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setKeyword(e.target.value);
        // 注意：搜索会通过上面的useEffect自动触发
    };

    // 清除搜索
    const handleClear = () => {
        setKeyword('');
        // 清除后立即搜索，不用等待防抖
        performSearch('');
    };

    return (
        <>
            <Tooltip title="搜索" enterDelay={1000}>
                <div>
                    <IconButton
                        type="button"
                        aria-label="search"
                        sx={{
                            display: { xs: 'inline', md: 'none' },
                        }}
                        onClick={() => performSearch(keyword)}
                    >
                        <SearchIcon />
                    </IconButton>
                </div>
            </Tooltip>
            <TextField
                label="搜索"
                variant="outlined"
                size="small"
                value={keyword}
                onChange={handleInputChange}
                aria-label="搜索游戏"
                placeholder="输入游戏名称"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            {keyword && (
                                <IconButton
                                    onClick={handleClear}
                                    edge="end"
                                    size="small"
                                    aria-label="清除搜索"
                                >
                                    <ClearIcon fontSize="small" />
                                </IconButton>
                            )}
                        </InputAdornment>
                    ),
                }}
                sx={{ display: { xs: 'none', md: 'inline-block' }, mr: 1 }}
            />
        </>
    );
}