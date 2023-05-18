<template>
  <div :class="cls">
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
  }
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

.msg-bubble {
  width: fit-content;
  max-width: 70%;
  font-size: 15px;
  border-radius: 10px;
  background-color: var(--main-theme-white-bubble);
  padding: 10px 13px;
  margin: 10px 0 10px 20px;
}

.sender {
  justify-content: flex-end;
}

.sender .msg-bubble {
  background-color: var(--main-theme-green-bubble);
  margin: 10px 20px 10px 0;
}
</style>
