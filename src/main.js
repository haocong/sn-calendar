import Vue from 'vue'
import App from './App.vue'

var VueTouch = require('vue-touch')
Vue.use(VueTouch, {name: 'v-touch'})

new Vue({
  el: '#app',
  render: h => h(App)
})
