import { defineStore } from 'pinia';
// import { Local } from '@/utils/storage';

export const useGlobalStore = defineStore('global', {
  state: () => ({
    showJoinForm: false
  }),
  actions: {
    toggleShowJoinForm() {
      this.showJoinForm = !this.showJoinForm;
    }
  }
});
