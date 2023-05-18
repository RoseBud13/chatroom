<template>
  <div class="roomcard-wrapper">
    <div class="roomcard-logo">🏠</div>
    <div class="roomcard-main"></div>
    <div class="roomcard-footer">
      在线人数：<span class="client-amount">13</span>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.roomcard-wrapper {
  position: relative;
  width: 40%;
  aspect-ratio: 1 / 1;
  min-width: 130px;
  border-radius: 20px;
  background-color: var(--color-background-soft);
  margin: 30px 0 10px 0;
  padding: 10px;
  box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px,
    rgba(0, 0, 0, 0.1) 0px 7px 10px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.roomcard-logo {
  position: relative;
  width: 100%;
  height: 30px;
  font-size: 20px;
}

.roomcard-main {
  position: relative;
  width: 100%;
  flex: 1;
}

.roomcard-footer {
  position: relative;
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.client-amount {
  color: var(--main-theme-green);
}

@media (max-width: 900px) {
  .roomcard-wrapper {
    margin: 30px 10px 10px 33px;
  }
}

@media (max-width: 600px) {
  .roomcard-wrapper {
    margin: 30px 10px 10px 22px;
  }
}
</style>
