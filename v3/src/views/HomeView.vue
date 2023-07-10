<template>
  <div class="layout-conatianer">
    <div class="left-panel">
      <div class="room-list">
        <div class="left-panel-header">
          <IconAvatar
            style="cursor: pointer"
            @click="globalStore.toggleUserPage"
          ></IconAvatar>
        </div>
        <RoomCard
          roomID="ChatGPT"
          roomSize="Don't Panic"
          roomType="gpt"
          @click="chatroomStore.enterChatroom('gpt')"
        ></RoomCard>
        <RoomCard
          v-for="room in chatroomList"
          :roomID="room"
          :roomSize="roomInfo[room]"
          roomType="chatroom"
          @click="chatroomStore.enterChatroom(room)"
        ></RoomCard>
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
          <h3>{{ currentRoomID === 'gpt' ? 'ChatGPT' : currentRoomID }}</h3>
          <h5 v-if="currentRoomID !== 'gpt'">
            当前在线人数：<span class="client-amount">{{
              roomInfo[currentRoomID]
            }}</span>
          </h5>
          <h5 v-else><span class="client-amount">AI</span></h5>
        </div>
        <div class="message-wrapper" v-if="currentRoomID !== 'gpt'">
          <div id="messages" class="scroll-start-at-bottom">
            <MessageBubble
              v-for="msg in filteredMsgBuffer"
              :msg="msg.content"
              :isSender="msg.sender === clientID"
              :avatarUrl="msg.avatar"
            ></MessageBubble>
          </div>
        </div>
        <GptWrapper :gpturl="chatgptUrl" v-else></GptWrapper>
        <div class="input-wrapper" v-show="currentRoomID !== 'gpt'">
          <input
            type="text"
            placeholder="发送消息"
            id="msg-input-box"
            class="msg-input"
            autocomplete="off"
            v-model="msg"
            ref="msgInput"
          />
          <button
            id="msg-send-btn"
            class="msg-btn"
            type="button"
            @click="handleSentMsg"
          >
            发送
          </button>
        </div>
      </div>
    </div>
    <div class="join-form" ref="joinForm">
      <div
        class="close-join-form"
        @click="globalStore.toggleShowJoinForm"
        v-if="clientID"
      >
        <IconCloseRound></IconCloseRound>
      </div>
      <input
        type="text"
        placeholder="邀请码"
        class="join-input"
        autocomplete="off"
        v-model="authMsg"
      />
      <button class="join-btn" type="button" @click="handleAuth">
        验证邀请码
      </button>
    </div>
    <div class="user-page" ref="userPage">
      <div class="user-avatar-wrapper">
        <img :src="avatarUrl" alt="avatar" />
      </div>
      <button class="avatar-btn" type="button" @click="shuffleAvatar">
        换一个
      </button>
      <div class="close-user-page" @click="globalStore.toggleUserPage">
        <IconCloseRound></IconCloseRound>
      </div>
    </div>
    <div class="disconnected" v-if="!connected && showDisconnnectAlert">
      连接已中断<IconCloseRound
        style="margin-left: 20px; cursor: pointer"
        @click="closeDisconnectAlert"
      ></IconCloseRound>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, inject, computed } from 'vue';
import { storeToRefs } from 'pinia';
import RoomCard from '@/components/RoomCard.vue';
import MessageBubble from '@/components/MessageBubble.vue';
import IconLogoutLeft from '@/components/icons/IconLogoutLeft.vue';
import IconCloseRound from '@/components/icons/IconCloseRound.vue';
import IconAvatar from '@/components/icons/IconAvatar.vue';
import GptWrapper from '@/components/GptWrapper.vue';
import { useChatroomStore } from '@/stores/chatroom';
import { useGlobalStore } from '@/stores/global';
import { generateID, randomIntFromInterval } from '@/utils/random';
import { fileReader } from '@/utils/tools';

const toast = inject('toast');

const chatbox = ref(null);
const rightContainer = ref(null);
const joinForm = ref(null);
const userPage = ref(null);
const msgInput = ref(null);
const mobileMode = ref(false);

const msg = ref('');
const authMsg = ref('');
const showDisconnnectAlert = ref(false);
const chatgptUrl = ref('');
const chatgptInfo =
  'https://file-static-1306125602.cos.ap-shanghai.myqcloud.com/json/chatgpt.json';

const { fetchJson } = fileReader();

fetchJson(chatgptInfo).then(data => {
  chatgptUrl.value = data.url;
});

const chatroomStore = useChatroomStore();
const { isInChatroom, chatroomList, currentRoomID, roomInfo, msgBuffer } =
  storeToRefs(chatroomStore);
const globalStore = useGlobalStore();
const { showJoinForm, wsSysMsg, clientID, connected, avatarUrl, showUserPage } =
  storeToRefs(globalStore);

const wsStatusCheckingInterval = ref(null);
const wsInstance = ref(null);
const connectionError = ref(false);

const connect = () => {
  const ws = new WebSocket('ws://localhost:7071');

  return new Promise((resolve, reject) => {
    console.log('Client trying to connect...');

    ws.onopen = () => {
      console.log('Websocket connection established');
      globalStore.updateConnection(true);
      connectionError.value = false;
      if (clientID.value && chatroomList.value.length > 0) {
        for (const room of chatroomList.value) {
          reAssignClient(ws, clientID.value, room);
        }
      }
      resolve(ws);
    };

    ws.onmessage = function (message) {
      if (message.data instanceof Blob) {
        reader = new FileReader();
        reader.onload = () => {
          console.log('message: ' + reader.result, 'blob');
        };
        reader.readAsText(message.data);
      } else {
        console.log('message: ' + message.data, 'text');
        let parsedMsg = JSON.parse(message.data);

        switch (parsedMsg.type) {
          case 'system':
            globalStore.updateWsSysMsg(parsedMsg);
            if (wsSysMsg.value.contentType === 'authFailed') {
              toast('邀请码无效', 'warn');
            } else if (wsSysMsg.value.contentType === 'authSuccess') {
              toast('验证成功', 'success');
              globalStore.toggleShowJoinForm();
              if (clientID.value === null) {
                globalStore.setClientID(generateID(5));
              }
              if (avatarUrl.value === null) {
                globalStore.setAvatarUrl(randomIntFromInterval(1, 100));
              }
              chatroomStore.addChatroom(parsedMsg.content);
              registerClient(ws, clientID.value, parsedMsg.content);
            } else if (parsedMsg.contentType === 'clientSize') {
              let data = {
                room: parsedMsg.roomID,
                size: parsedMsg.size
              };
              chatroomStore.setRoomInfo(data);
            }
            break;
          case 'message':
            if (parsedMsg.contentType === 'msgBroadcast') {
              let msgData = {
                room: parsedMsg.roomID,
                sender: parsedMsg.senderID,
                avatar: parsedMsg.senderAvatar,
                timestamp: parsedMsg.timestamp,
                content: parsedMsg.content
              };
              chatroomStore.updateMsg(msgData);
            }
        }
      }
    };

    ws.onerror = error => {
      connectionError.value = true;
      toast('「系统消息」服务器故障', 'warn');
      console.log('服务器故障：', error);
      globalStore.updateConnection(false);
      chatroomStore.clearRoomSize();
      reject(error);
    };

    ws.onclose = error => {
      if (connectionError.value !== true) {
        toast('连接已断开, 重新连接中...', 'success');
        console.log('服务器连接已关闭, 重新连接中...');
      }
      globalStore.updateConnection(false);
      chatroomStore.clearRoomSize();
      reject(error);
    };
  });
};

async function reconnect() {
  try {
    connect().then(ws => (wsInstance.value = ws));
  } catch (err) {
    console.log('WEBSOCKET_RECONNECT: Error', err);
  }
}

reconnect();

const filteredMsgBuffer = computed(() => {
  let filtered = [];
  msgBuffer.value.forEach(element => {
    if (element.room === currentRoomID.value) {
      filtered.push(element);
    }
  });
  return filtered;
});

const handleAuth = () => {
  if (authMsg.value) {
    const authObj = {
      auth: '2233',
      type: 'system',
      contentType: 'auth',
      content: authMsg.value,
      timestamp: Date.now()
    };
    console.log(authObj);
    wsInstance.value.send(JSON.stringify(authObj));
    authMsg.value = '';
  }
};

const registerClient = (ws, client, room) => {
  const clientInfo = {
    auth: '2233',
    type: 'system',
    contentType: 'registerClient',
    clientID: client,
    roomID: room,
    timestamp: Date.now()
  };
  ws.send(JSON.stringify(clientInfo));
};

const reAssignClient = (ws, client, room) => {
  const clientInfo = {
    auth: '2233',
    type: 'system',
    contentType: 'reAssignClient',
    clientID: client,
    roomID: room,
    timestamp: Date.now()
  };
  ws.send(JSON.stringify(clientInfo));
};

const handleSentMsg = event => {
  if (msg.value && !event.isComposing) {
    const msgObj = {
      auth: '2233',
      type: 'message',
      contentType: 'msgText',
      content: msg.value,
      senderID: clientID.value,
      senderAvatar: avatarUrl.value,
      roomID: currentRoomID.value,
      timestamp: Date.now()
    };
    // console.log(msgObj);
    wsInstance.value.send(JSON.stringify(msgObj));
    msg.value = '';
  }
};

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

const closeDisconnectAlert = () => {
  showDisconnnectAlert.value = false;
};

const shuffleAvatar = () => {
  globalStore.setAvatarUrl(randomIntFromInterval(1, 100));
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

watch(showUserPage, () => {
  if (showUserPage.value) {
    userPage.value.style = 'right:0;';
  } else {
    userPage.value.style = 'right:100%;';
  }
});

watch(connected, () => {
  if (connected.value === false) {
    showDisconnnectAlert.value = true;
  } else {
    showDisconnnectAlert.value = false;
  }
});

onMounted(() => {
  if (window.innerWidth < 900) {
    mobileMode.value = true;
    chatbox.value.classList.remove('chat-container-hidden');
  }
  if (!showJoinForm.value) {
    joinForm.value.style = 'top:100%;';
  }
  if (!showUserPage.value) {
    userPage.value.style = 'right:100%;';
  }
  setChatroom(isInChatroom.value, mobileMode.value);
  msgInput.value.addEventListener('keydown', e => {
    if (e.code === 'Enter') {
      handleSentMsg(e);
    }
  });
  // repeat every 5 seconds to check websocket connection
  wsStatusCheckingInterval.value = setInterval(() => {
    if (!connected.value) {
      toast('「系统消息」重新连接中...', 'success');
      reconnect();
    }
  }, 5000);
});

onBeforeUnmount(() => {
  msgInput.value.addEventListener('keydown', e => {
    if (e.code === 'Enter') {
      handleSentMsg(e);
    }
  });
  clearInterval(wsStatusCheckingInterval.value);
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
  padding-top: 20px;
  display: flex;
  justify-content: space-evenly;
  align-items: flex-start;
  flex-wrap: wrap;
  overflow-y: auto;
}

.left-panel-header {
  position: relative;
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  font-size: 33px;
  font-weight: bold;
  padding-left: 22px;
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
  position: relative;
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
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.header-wrapper h5 {
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
  // top: 0;
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

.user-page {
  position: absolute;
  top: 0;
  // right: 100%;
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

.user-avatar-wrapper {
  position: relative;
  height: 90px;
  width: 90px;
}

.user-avatar-wrapper img {
  height: 100%;
  width: 100%;
  object-fit: contain;
}

.avatar-btn {
  height: 30px;
  width: 90px;
  margin: 50px 0;
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

.close-user-page {
  position: absolute;
  top: 25px;
  right: 25px;
  font-size: 25px;
  color: var(--main-theme-green);
  cursor: pointer;
}

.disconnected {
  position: absolute;
  top: 0;
  width: 100%;
  height: 50px;
  background-color: rgb(252, 145, 145);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 16px;
  z-index: 10;
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
