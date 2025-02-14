<template>
    <div>
        <slot/>
    </div>
</template>

<style scoped>
div {
    background-color: var(--secondary-background-color);
    border-radius: 10px;
    border: var(--mute-border);
    padding: 18px;
    width: 100%;
    box-sizing: border-box;
}


div > *:not(:first-child) {
    margin-top: 15px;
}
</style>