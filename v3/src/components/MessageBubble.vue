<template>
  <div :class="cls">
    <div class="avatar">
      <img :src="avatarUrl" alt="avater" />
    </div>
    <div class="msg-bubble">
      {{ msg }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  msg: String,
  isSender: {
    type: Boolean,
    default: false
  },
  avatarUrl: String
});

const cls = computed(() => [
  'msg-bubble-wrapper',
  `${props.isSender ? 'sender' : ''}`
]);
</script>

<style lang="scss" scoped>
.msg-bubble-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 5px;
  overflow: hidden;
  margin: 0 20px;
}

.avatar img {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.msg-bubble {
  width: fit-content;
  min-height: 42px;
  max-width: 70%;
  font-size: 16px;
  border-radius: 8px;
  background-color: var(--main-theme-white-bubble);
  padding: 0 13px;
  margin: 10px 0 10px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sender {
  justify-content: flex-start;
  flex-direction: row-reverse;
}

.sender .msg-bubble {
  background-color: var(--main-theme-green-bubble);
  margin: 10px 0px 10px 0;
}
</style>
