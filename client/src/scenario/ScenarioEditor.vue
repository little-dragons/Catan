<script setup lang="ts">
import Container from '@/game-components/board/Container.vue';
import { svgPath, tilePath } from '@/game-components/board/Layout';
import SideMenu from '@/misc/SideMenu.vue';
import LabeledInput from '@/modals/input-fields/LabeledInput.vue';
import { defaultScenario, GenerationMethod, type Scenario, ScenarioRobberPlacement, ScenarioStartingPhaseType } from 'shared';
import { unfreeze, type UnFreeze } from 'structurajs';
import { ref, toRaw, watch } from 'vue';

const scenario = ref<UnFreeze<Scenario>>(unfreeze(structuredClone(defaultScenario)))
const activeTileGroup = ref(0)
function appendEmptyTileGroup() {
    scenario.value.board.tileGroups.push({
        coordinates: {
            method: GenerationMethod.SelectOne,
            data: [[]]
        },
        portResources: {
            method: GenerationMethod.Fixed,
            data: []
        },
        resourceNumberAssignment: [],
        resources: {
            method: GenerationMethod.Fixed,
            data: [],
        },
        tileTypes: {
            method: GenerationMethod.Fixed,
            data: []
        }
    })
}
function deleteActiveTileGroup() {
    if (scenario.value.board.tileGroups.length <= 1)
        return

    scenario.value.board.tileGroups.splice(activeTileGroup.value, 1)
    if (activeTileGroup.value >= scenario.value.board.tileGroups.length)
        activeTileGroup.value = scenario.value.board.tileGroups.length - 1
}


function copyJSONToClipboard() {
    navigator.clipboard.writeText(JSON.stringify(toRaw(scenario.value)))
    console.log(scenario.value)
}
</script>

<template>
    <h1>Custom Scenario</h1>
    <div class="middle">
        <SideMenu>
            <h4>Players</h4>
            <LabeledInput
                label="Minimal player count">
                <input
                    type="number"
                    min="1"
                    max="7"
                    step="1"
                    v-model.number="scenario.players.minAllowedCount"
                    required
                    @input="e => {
                        const t = (e.target as HTMLInputElement)
                        t.value = t.value.replace(/[^0-9]/g, '')
                        if (t.value == '' || t.valueAsNumber == 0) t.value = '1'
                        if (t.valueAsNumber > 7) t.value = '7'

                        if (t.valueAsNumber > scenario.players.maxAllowedCount)
                            scenario.players.maxAllowedCount = t.valueAsNumber
                    }"
                />
            </LabeledInput>
            <LabeledInput
                label="Maximal player count">
                <input
                    type="number"
                    min="1"
                    max="7"
                    step="1"
                    v-model.number="scenario.players.maxAllowedCount"
                    required
                    @input="e => {
                        const t = (e.target as HTMLInputElement)
                        t.value = t.value.replace(/[^0-9]/g, '')
                        if (t.value == '' || t.valueAsNumber == 0) t.value = '1'
                        if (t.valueAsNumber > 7) t.value = '7'

                        if (t.valueAsNumber < scenario.players.minAllowedCount)
                            scenario.players.minAllowedCount = t.valueAsNumber
                    }"
                />
            </LabeledInput>
            <h4>Board</h4>
            <LabeledInput label="Tile groups" for="tile-groups-label">
                <div>
                    <table class="tile-groups" aria-labelledby="tile-groups-label" aria->
                        <tr
                            v-for="idx in new Array(scenario.board.tileGroups.length).keys()"
                            @click="activeTileGroup = idx"
                            @keypress.enter="activeTileGroup = idx"
                            @keypress.space="activeTileGroup = idx"
                            :class="activeTileGroup == idx ? 'selected' : ''"
                            :aria-selected="activeTileGroup == idx"
                            tabindex="0">
                            <td>
                                Group {{ idx + 1}}
                            </td>
                        </tr>
                    </table>
                    <span>
                        <button @click="appendEmptyTileGroup" type="button">
                            Add
                        </button>
                        
                        <button @click="deleteActiveTileGroup" type="button" :disabled="scenario.board.tileGroups.length <= 1">
                            Delete
                        </button>
                    </span>
                </div>
            </LabeledInput>
            <LabeledInput
                label="Robber at start">
                <label>
                    <input
                        type="radio"
                        v-model="scenario.board.robber.type"
                        required
                        :value="ScenarioRobberPlacement.RandomDesert"
                    />
                    Random desert
                </label>
            </LabeledInput>

            <h4>Miscellaneous</h4>
            <LabeledInput
                label="Starting phase">
                <label>
                    <input
                        type="radio"
                        v-model="scenario.startingPhase"
                        required
                        :value="ScenarioStartingPhaseType.WithInitialPlacing"
                    />
                    With initial placing
                </label>
            </LabeledInput>
            <button @click="copyJSONToClipboard">Copy as JSON</button>
        </SideMenu>
        <Container :tile-coordinates="scenario.board.tileGroups.flatMap(tg => tg.coordinates.data).flat()">
            <path
                v-for="coord of scenario.board.tileGroups.filter((_, i) => i != activeTileGroup).flatMap(tg => tg.coordinates.data).flat()"
                :d="tilePath(coord)"
                fill="gray"
            />
            <path
                v-for="coord of scenario.board.tileGroups[activeTileGroup].coordinates.data.flat()"
                :d="tilePath(coord)"
                fill="green"
            />
        </Container>
        <SideMenu>
            <h4>Active tile group: Group {{ activeTileGroup + 1}}</h4>

        </SideMenu>
    </div>
</template>

<style scoped>
@import '../assets/base.css';


.middle {
    width: var(--wide-area-width);
    display: flex;
    flex-direction: row;
}

.tile-groups {
    background-color: white;
    width: 100%;
    text-align: end;
}

.selected {
    background-color: rgb(231, 231, 231);
}
</style>