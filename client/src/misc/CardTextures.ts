import brickCard from '@/assets/resource-cards/brick-card.svg'
import grainCard from '@/assets/resource-cards/grain-card.svg'
import lumberCard from '@/assets/resource-cards/lumber-card.svg'
import oreCard from '@/assets/resource-cards/ore-card.svg'
import woolCard from '@/assets/resource-cards/wool-card.svg'
import { Resource } from 'shared'

export function imageForResource(res: Resource): string {
    switch (res) {
        case Resource.Grain: return grainCard;
        case Resource.Ore: return oreCard;
        case Resource.Wool: return woolCard;
        case Resource.Lumber: return lumberCard;
        case Resource.Brick: return brickCard;
    }
}