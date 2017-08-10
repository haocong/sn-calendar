import Vue from 'vue'
import App from './App.vue'
import VueResource from 'vue-resource';

var VueTouch = require('vue-touch')

Vue.use(VueResource)
Vue.use(VueTouch, {name: 'v-touch'})

new Vue({
  el: '#app',
  render: h => h(App)
})
