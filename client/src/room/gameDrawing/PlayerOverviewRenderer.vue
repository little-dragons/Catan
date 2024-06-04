<script setup lang="ts">
</script>

<template>
    <div class="top">
        <div class="picture"/>
        <div class="box">
            <div class="username">Name</div>
            <div class="grid">

            </div>
        </div>
    </div>
</template>

<style scoped>
.picture {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 1px solid black;
    background-color: aqua;
    align-self: center;
    margin-bottom: -15px;
    z-index: 2;
}

.top {
    width: 150px;
    display: flex;
    flex-direction: column;
}
.username {
    width: 90%;
    background-color: white;
    margin: 6px auto;
    border: 1px rgb(160, 160, 160) solid;
    border-radius: 3px;
}
.box {
    background-color: antiquewhite;
    border: 1px solid black;
    border-radius: 10px;
}

.grid {
    display: grid;
    height: 45px;
}
</style>