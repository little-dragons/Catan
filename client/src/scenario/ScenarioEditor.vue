<script setup lang="ts">
import Container from '@/game-components/board/Container.vue';
import SideMenu from '@/misc/SideMenu.vue';
import CustomInput from '@/modals/input-fields/CustomInput.vue';
import LabeledInput from '@/modals/input-fields/LabeledInput.vue';
import Setting from '@/room/Setting.vue';
import { defaultScenario, ScenarioRobberPlacement, type Scenario, type ScenarioStartingPhaseType } from 'shared';
import { unfreeze } from 'structurajs';
import { ref, toRaw, watch } from 'vue';

const scenario = ref<Scenario>(unfreeze(structuredClone(defaultScenario)))
watch(scenario, (val) => console.log(val))
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
                label="Minimal player count"
                type="space between">
                <CustomInput 
                    :disabled="false"
                    :rules="[
                        () => scenario.players.minAllowedCount !== null ? true : 'Has to be a number',
                        () => scenario.players.minAllowedCount >= 1 ? true : 'At least one player has to be allowed to play',
                        () => scenario.players.maxAllowedCount > scenario.players.minAllowedCount ? true : 'This value has to be smaller than the maximal count'
                        ]"
                    type="number"
                    min="1"
                    max="7"
                    v-model.number="scenario.players.minAllowedCount"
                />
            </LabeledInput>
            <LabeledInput
                label="Maximal player count"
                type="space between">
                <CustomInput 
                    :disabled="false"
                    :rules="[
                        () => typeof scenario.players.maxAllowedCount === 'number' ? true : 'Has to be a number',
                        () => scenario.players.maxAllowedCount >= 1 ? true : 'At least one player has to be allowed to play',
                        () => scenario.players.maxAllowedCount >= scenario.players.minAllowedCount ? true : 'This value has to be greater than the minimal count']"
                    type="number"
                    v-model.number="scenario.players.maxAllowedCount"
                />
            </LabeledInput>
            <h4>Players</h4>
            <h4>Players</h4>
            <button @click="copyJSONToClipboard">Copy as JSON</button>
        </SideMenu>
        <Container :tile-coordinates="[]">

        </Container>
        <SideMenu>

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
</style>