<template>
  <div class="iframe-wrapper">
    <iframe
      data-v-555cd4d2=""
      src="https://chat.extkj.cn/"
      class="embedded-iframe"
      sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
    ></iframe>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.iframe-wrapper {
  width: 100%;
  height: 100%;
  background-color: #fff;
}

.embedded-iframe {
  border: none;
  margin: 0;
  padding: 0;
  width: 100%;
  height: calc(100% - 20px);
  overflow: hidden;
  background-color: #fff;
  margin-bottom: 20px;
}
</style>
