<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router';

const getDeviceType = () => {
  if (
    navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
    )
  ) {
    if (navigator.userAgent.match(/(iPhone|iPod|ios|iPad)/i)) {
      return 'ios';
    }
    return 'mobile';
  } else {
    return 'PC';
  }
};

const setDeviceAttr = () => {
  if (getDeviceType() === 'ios') {
    document.documentElement.style.setProperty('--90vh', '90dvh');
    document.documentElement.style.setProperty('--100vh', '100dvh');
    document.head.querySelector('meta[name="viewport"]').content =
      'width=device-width, initial-scale=1, maximum-scale=1';
    document.documentElement.setAttribute('ontouchmove', '');
  } else {
    document.documentElement.style.setProperty('--90vh', '90vh');
    document.documentElement.style.setProperty('--100vh', '100vh');
  }
};

setDeviceAttr();
</script>

<style lang="scss" scoped></style>
