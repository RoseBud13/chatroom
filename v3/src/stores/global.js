import { defineStore } from 'pinia';
import { Local } from '@/utils/storage';

export const useGlobalStore = defineStore('global', {
  state: () => ({
    showJoinForm: Local.get('client-id') ? false : true,
    wsSysMsg: {},
    clientID: Local.get('client-id') || null,
    connected: false,
    avatarUrl: Local.get('avatar') || null,
    showUserPage: false
  }),
  actions: {
    toggleShowJoinForm() {
      this.showJoinForm = !this.showJoinForm;
    },
    updateWsSysMsg(data) {
      this.wsSysMsg = data;
    },
    setClientID(id) {
      this.clientID = id;
      Local.set('client-id', id);
    },
    updateConnection(status) {
      this.connected = status;
    },
    setAvatarUrl(random) {
      this.avatarUrl =
        'https://b612-static-rsrcs-1306125602.cos.ap-shanghai.myqcloud.com/random-avatar/' +
        random +
        '.png';
      Local.set('avatar', this.avatarUrl);
    },
    toggleUserPage() {
      this.showUserPage = !this.showUserPage;
    }
  }
});
