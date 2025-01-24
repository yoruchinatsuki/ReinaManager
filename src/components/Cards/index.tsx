import { useState } from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import { Typography } from '@mui/material';
import cards from '@/data/games.json';
import RightMenu from '@/components/RightMenu';

const Cards = () => {
    const [selectedCard, setSelectedCard] = useState(-1);
    const [menuPosition, setMenuPosition] = useState<{
        mouseX: number;
        mouseY: number;
        cardId: number | null;
    } | null>(null);

    const handleContextMenu = (event: React.MouseEvent, cardId: number) => {
        setMenuPosition({
            mouseX: event.clientX,
            mouseY: event.clientY,
            cardId
        });
    };

    return (
        <div className="flex flex-wrap gap-4 overflow-auto grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 ">
            <RightMenu isopen={Boolean(menuPosition)}
                anchorPosition={
                    menuPosition
                        ? { top: menuPosition.mouseY, left: menuPosition.mouseX }
                        : undefined
                }
                setAnchorEl={(value) => {
                    if (!value) setMenuPosition(null);
                }} />
            {cards.map((card, index) => {
                const isActive = selectedCard === index; // 判断当前卡片是否被选中
                return (
                    <Card
                        key={card.id}
                        className={`flex-grow-0 min-w-24 max-w-56 mb-6 w-[calc(100%/5-1rem)] sm:w-[calc(100%/5-1rem)] md:w-[calc(100%/5-1rem)] lg:w-[calc(100%/6-1rem)] xl:w-[calc(100%/7-1rem)] ${isActive ? 'scale-y-105' : ''}`}
                        onContextMenu={(e) => handleContextMenu(e, card.id)}
                    >
                        <CardActionArea
                            onClick={() => setSelectedCard(index)}
                            className={`
                             duration-100 
                            hover:shadow-lg hover:scale-105 
                            active:shadow-sm active:scale-95 
                            `}
                        >
                            <CardMedia
                                component="img"
                                className="h-auto aspect-[3/4]"
                                image={card.image}
                                alt="Card Image"
                                draggable="false"
                            />
                            <Typography className={`p-1 truncate ${isActive ? '!font-bold text-blue-500' : ''}`}>demo</Typography>
                        </CardActionArea>
                    </Card>
                )
            })}
        </div>
    );
};

export default Cards;