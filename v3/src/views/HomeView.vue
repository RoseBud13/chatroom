<template>
  <div class="layout-conatianer">
    <div class="left-panel">
      <div class="room-list">
        <RoomCard @click="chatroomStore.enterChatroom"></RoomCard>
        <RoomCard @click="chatroomStore.enterChatroom"></RoomCard>
        <RoomCard @click="chatroomStore.enterChatroom"></RoomCard>
      </div>
      <div class="room-add">
        <div class="add-btn" @click="globalStore.toggleShowJoinForm">+</div>
      </div>
    </div>
    <div class="right-container" ref="rightContainer">
      <div class="chat-container chat-container-hidden" ref="chatbox">
        <div class="header-wrapper">
          <div class="exit-btn" @click="chatroomStore.exitChatroom">
            <IconLogoutLeft></IconLogoutLeft>
          </div>
          <h3>当前在线人数：<span class="client-amount">13</span></h3>
        </div>
        <div class="message-wrapper">
          <div id="messages" class="scroll-start-at-bottom">
            <MessageBubble msg="test"></MessageBubble>
            <MessageBubble msg="hi"></MessageBubble>
            <MessageBubble msg="你好" isSender></MessageBubble>
            <MessageBubble msg="哈哈哈哈哈哈哈哈哈哈" isSender></MessageBubble>
            <MessageBubble msg="哈哈哈哈哈哈哈哈哈哈" isSender></MessageBubble>
            <MessageBubble msg="哈哈哈哈哈哈哈哈哈哈" isSender></MessageBubble>
            <MessageBubble msg="test"></MessageBubble>
            <MessageBubble msg="hi"></MessageBubble>
            <MessageBubble msg="test"></MessageBubble>
            <MessageBubble msg="hi"></MessageBubble>
            <MessageBubble msg="test"></MessageBubble>
            <MessageBubble msg="hi"></MessageBubble>
            <MessageBubble msg="哈哈哈哈哈哈哈哈哈哈" isSender></MessageBubble>
            <MessageBubble msg="哈哈哈哈哈哈哈哈哈哈" isSender></MessageBubble>
          </div>
        </div>
        <div class="input-wrapper">
          <input
            type="text"
            placeholder="发送消息"
            id="msg-input-box"
            class="msg-input"
            autocomplete="off"
          />
          <button id="msg-send-btn" class="msg-btn" type="button">发送</button>
        </div>
      </div>
    </div>
    <div class="join-form" ref="joinForm">
      <div class="close-join-form" @click="globalStore.toggleShowJoinForm">
        <IconCloseRound></IconCloseRound>
      </div>
      <input
        type="text"
        placeholder="邀请码"
        class="join-input"
        autocomplete="off"
      />
      <button class="join-btn" type="button">验证邀请码</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import RoomCard from '@/components/RoomCard.vue';
import MessageBubble from '@/components/MessageBubble.vue';
import IconLogoutLeft from '@/components/icons/IconLogoutLeft.vue';
import IconCloseRound from '@/components/icons/IconCloseRound.vue';
import { useChatroomStore } from '@/stores/chatroom';
import { useGlobalStore } from '@/stores/global';

const chatbox = ref(null);
const rightContainer = ref(null);
const joinForm = ref(null);
const mobileMode = ref(false);

const chatroomStore = useChatroomStore();
const { isInChatroom } = storeToRefs(chatroomStore);
const globalStore = useGlobalStore();
const { showJoinForm } = storeToRefs(globalStore);

const setChatroom = (isIn, isMobile) => {
  if (isIn) {
    if (isMobile) {
      rightContainer.value.style = 'left:0;';
    } else {
      chatbox.value.classList.remove('chat-container-hidden');
    }
  } else {
    if (isMobile) {
      rightContainer.value.style = 'left:100%;';
    } else {
      chatbox.value.classList.add('chat-container-hidden');
    }
  }
};

watch(isInChatroom, () => {
  setChatroom(isInChatroom.value, mobileMode.value);
});

watch(showJoinForm, () => {
  if (showJoinForm.value) {
    joinForm.value.style = 'top:0;';
  } else {
    joinForm.value.style = 'top:100%;';
  }
});

onMounted(() => {
  if (window.innerWidth < 900) {
    mobileMode.value = true;
    chatbox.value.classList.remove('chat-container-hidden');
  }
  setChatroom(isInChatroom.value, mobileMode.value);
});
</script>

<style lang="scss" scoped>
.layout-conatianer {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.left-panel {
  flex: 2;
  height: 100%;
  min-width: 260px;
  position: relative;
}

.room-list {
  position: relative;
  width: 100%;
  max-width: 600px;
  height: fit-content;
  max-height: 80%;
  padding-top: 50px;
  display: flex;
  justify-content: space-evenly;
  align-items: flex-start;
  flex-wrap: wrap;
  overflow-y: auto;
}

.room-add {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.add-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 25px;
  width: 46px;
  height: 46px;
  cursor: pointer;
  user-select: none;
  background-color: var(--main-theme-green);
  color: #fff;
  border-radius: 50%;
}

.right-container {
  flex: 5;
  height: 100%;
  overflow: hidden;
}

.chat-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease-in-out;
  opacity: 1;
}

.chat-container-hidden {
  opacity: 0;
}

.header-wrapper {
  height: 50px;
  width: 100%;
  background-color: #f2f2f2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.exit-btn {
  margin-left: 20px;
  margin-top: 6px;
  font-size: 23px;
  font-weight: bold;
  cursor: pointer;
}

.header-wrapper h3 {
  margin-right: 30px;
}

.message-wrapper {
  flex: 1;
  width: 100%;
  background-color: #f2f2f2;
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
}

.scroll-start-at-bottom {
  flex: 1 1 0%;
}

.input-wrapper {
  height: 90px;
  width: 100%;
  padding-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e5e5e5;
}

.msg-input {
  height: 60%;
  flex: 3;
  margin: 0 10px 0 20px;
  font-size: 15px;
  border: none;
  border-radius: 4px;
  padding: 0 10px;
}

.msg-btn {
  height: 60%;
  flex: 1;
  margin: 0 20px 0 10px;
  font-size: 15px;
  font-weight: 500;
  background-color: var(--main-theme-green);
  color: #fff;
  appearance: none;
  user-select: none;
  outline: none;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 4px;
}

.client-amount {
  color: var(--main-theme-green);
}

.join-form {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--main-theme-white-mute);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
  transition: all 0.2s ease-in-out;
}

.join-input {
  height: 40px;
  width: 220px;
  margin: 0 0 40px 0;
  font-size: 18px;
  border: none;
  border-radius: 4px;
  padding: 0 10px;
}

.join-btn {
  height: 40px;
  width: 220px;
  font-size: 18px;
  font-weight: 500;
  background-color: var(--main-theme-green);
  color: #fff;
  appearance: none;
  user-select: none;
  outline: none;
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 4px;
}

.close-join-form {
  position: absolute;
  top: 25px;
  right: 25px;
  font-size: 25px;
  color: var(--main-theme-green);
  cursor: pointer;
}

@media (max-width: 900px) {
  .left-panel {
    min-width: 100%;
  }

  .room-list {
    justify-content: flex-start;
    margin: 0 auto;
  }

  .right-container {
    width: 100%;
    position: absolute;
    left: 100%;
    z-index: 1;
    transition: all 0.2s ease-in-out;
  }
}
</style>
