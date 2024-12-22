import brickCard from '@/assets/resource-cards/brick-card.svg'
import grainCard from '@/assets/resource-cards/grain-card.svg'
import lumberCard from '@/assets/resource-cards/lumber-card.svg'
import oreCard from '@/assets/resource-cards/ore-card.svg'
import woolCard from '@/assets/resource-cards/wool-card.svg'
import knightCard from '@/assets/dev-cards/knight-card.svg'
import monopolyCard from '@/assets/dev-cards/monopoly-card.svg'
import roadBuildingCard from '@/assets/dev-cards/road-building-card.svg'
import victoryPointCard from '@/assets/dev-cards/victory-point-card.svg'
import yearOfPlentyCard from '@/assets/dev-cards/year-of-plenty-card.svg'

import { DevCardType, Resource } from 'shared'

export function imageForResource(res: Resource): string {
    switch (res) {
        case Resource.Grain: return grainCard;
        case Resource.Ore: return oreCard;
        case Resource.Wool: return woolCard;
        case Resource.Lumber: return lumberCard;
        case Resource.Brick: return brickCard;
    }
}

export function imageForDevCard(card: DevCardType): string {
    switch (card) {
        case DevCardType.Knight: return knightCard;
        case DevCardType.Monopoly: return monopolyCard;
        case DevCardType.RoadBuilding: return roadBuildingCard;
        case DevCardType.VictoryPoint: return victoryPointCard;
        case DevCardType.YearOfPlenty: return yearOfPlentyCard;
    }
}