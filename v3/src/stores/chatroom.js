import { defineStore } from 'pinia';
import { Local } from '@/utils/storage';

export const useChatroomStore = defineStore('chatroom', {
  state: () => ({
    isInChatroom: Local.get('is-in-chatroom') || false,
    currentRoomID: Local.get('current-room-id') || null,
    chatroomList: Local.get('chatroom-list') || [],
    roomInfo: {},
    msgBuffer: []
  }),
  actions: {
    enterChatroom(id) {
      this.isInChatroom = true;
      Local.set('is-in-chatroom', true);
      this.currentRoomID = id;
      Local.set('current-room-id', id);
    },
    exitChatroom() {
      this.isInChatroom = false;
      Local.set('is-in-chatroom', false);
      this.currentRoomID = null;
      Local.set('current-room-id', null);
    },
    addChatroom(chatroomID) {
      this.chatroomList.push(chatroomID);
      Local.set('chatroom-list', this.chatroomList);
    },
    setRoomInfo(data) {
      this.roomInfo[data.room] = data.size;
    },
    clearRoomSize() {
      Object.keys(this.roomInfo).forEach(key => {
        this.roomInfo[key] = 0;
      });
    },
    updateMsg(data) {
      this.msgBuffer.push(data);
    }
  }
});
