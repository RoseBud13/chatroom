import AstraToast from './index.vue';
import { useMountComponent } from '@/hooks/mountComponent';
import { nextTick } from 'vue';

const toastPlugin = (message, type, duration, top) => {
  const options = {
    msg: message,
    toastType: type || 'normal',
    topOffset: top || '60px'
  };

  const timer = typeof duration === 'number' ? duration : 2000;

  const { instance, unmount } = useMountComponent(AstraToast, options);

  nextTick(() => {
    setTimeout(() => {
      unmount();
    }, timer);
  });

  return instance;
};

export default {
  install: app => {
    app.config.globalProperties.$toast = toastPlugin;
    app.provide('toast', toastPlugin);
  }
};
