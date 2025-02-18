<script setup lang="ts">
import Container from '@/game-components/board/Container.vue';
import SideMenu from '@/misc/SideMenu.vue';
import LabeledInput from '@/modals/input-fields/LabeledInput.vue';
import { defaultScenario, type Scenario, ScenarioStartingPhaseType } from 'shared';
import { unfreeze, type UnFreeze } from 'structurajs';
import { ref, toRaw, watch } from 'vue';

const scenario = ref<UnFreeze<Scenario>>(unfreeze(structuredClone(defaultScenario)))
watch(scenario, () => {
}, {
    deep: true
})
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