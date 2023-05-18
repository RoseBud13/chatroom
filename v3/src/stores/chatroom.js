import { defineStore } from 'pinia';
import { Local } from '@/utils/storage';

export const useChatroomStore = defineStore('chatroom', {
  state: () => ({
    isInChatroom: Local.get('is-in-chatroom') || false
  }),
  actions: {
    enterChatroom() {
      this.isInChatroom = true;
      Local.set('is-in-chatroom', true);
    },
    exitChatroom() {
      this.isInChatroom = false;
      Local.set('is-in-chatroom', false);
    }
  }
});
