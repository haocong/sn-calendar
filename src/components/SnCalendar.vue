<template>
  <div class="sn-calendar">
    <div id="selectedWeekdayHeader" class="layout horizontal">
      <div class="relative flex" id="selectedWeekday">
        <div class="selectedWeekday slideVertical in">{{selectedWeekday}}</div>
      </div>
    </div>
    <div id="selectedDateHeader" class="sn-calendar__header layout vertical center center-justified">
      <div id="selectedMonth">
        <div class="selectedMonth slideVertical in" style="text-transform: uppercase">{{selectedMonth}}</div>
      </div>
      <div id="selectedDay">
        <div class="selectedDay slideVertical in">{{selectedDay}}</div>
      </div>
      <div id="sn-message" class="layout horizontal center-center">
        <h1 class="msg-content fade in">{{nowMessage || '休息日 ^_^'}}</h1>
      </div>
    </div>
    <div id="wrapper">
      <div class="sn-calendar__month layout horizontal">
        <v-touch class="sn-calendar__month__arrow left" v-on:tap="onPrev">
          <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></g></svg>
        </v-touch>
        <div id="viewingMonthYear" class="flex relative">
          <h4 class="viewingMonthYear slideHorizontal in">{{viewMonth}}</h4>
        </div>
        <v-touch class="sn-calendar__month__arrow right" v-on:tap="onNext">
          <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></g></svg>
        </v-touch>
      </div>
      <div class="sn-calendar__weekday layout horizontal center">
        <div class="sn-calendar__weekday__name" v-for="weekDay of weekDays">{{weekDay}}</div>
      </div>
      <div class="sn-calendar__days">
        <v-touch class="layout horizontal wrap slideHorizontal in" v-bind:swipe-options="{direction:'horizontal'}" v-on:swipeleft="onNext" v-on:swiperight="onPrev">
          <template v-for="week of viewDateMatrix">
            <v-touch class="sn-calendar__days__day layout horizontal center-center" v-for="(date, index) of week"
              :key="index"
              :class="[date.curClass, date.offClass]"
              :date="date.fullDate"
              :selected="date.selected"
              v-on:tap="selectDate(date.fullDate)">
              <div class="after"></div>
              <div class="short-date layout center">{{date.shortDate}}</div>
              <div class="event" :class="date.event.tag" v-if="date.event">{{date.event.title}}</div>
            </v-touch>
          </template>
        </v-touch>
      </div>
    </div>
  </div>
</template>

<script>
import dateUtils from '../utils/date-utils.js'
import localeString from '../utils/locale.js'

export default {
  name: 'sn-calendar',
  props: ['agenda', 'locale'],

  data() {
    return {
      viewDate: new Date(),
      selectedDate: new Date(),
      nowDate: new Date(),
      disablePropertyAnimations: false,
      reverseAnimation: false,
      nowMessage: '',
      eventList: [],
      viewDateMatrix: []
    }
  },

  computed: {
    weekDays() {
      return localeString[this.locale].shortDayNames;
    },
    viewMonth() {
      return localeString[this.locale].monthNames[this.viewDate.getMonth()];
    },
    viewYear() {
      return this.viewDate.getFullYear();
    },
    selectedYear() {
      return this.selectedDate.getFullYear();
    },
    selectedMonth() {
      return localeString[this.locale].monthNames[this.selectedDate.getMonth()];
    },
    selectedDay() {
      return this.selectedDate.getDate();
    },
    selectedWeekday() {
      return localeString[this.locale].dayNames[this.selectedDate.getDay()];
    }
  },

  created() {
    this._resetViewDateMatrix();
  },

  watch: {
    viewDate(newDate, oldDate) {
      if (dateUtils.isEqualMonth(newDate, oldDate)) {
        return;
      }

      this._resetViewDateMatrix();

      let animatedElems = [...this.$el.querySelectorAll('.slideHorizontal')];

      this.reverseAnimation = oldDate && oldDate.getTime() > newDate.getTime();

      for(let elem of animatedElems) {
        this._renderNode(elem, this.reverseAnimation);
      }
    },
    selectedDate(newDate, oldDate) {
      this._resetViewDateMatrix();

      this.reverseAnimation = oldDate && oldDate.getTime() > newDate.getTime();

      if (!dateUtils.isEqualMonth(newDate, oldDate)) {
        this._renderNode(this.$el.querySelector('.selectedMonth'), this.reverseAnimation);
      }

      this._renderNode(this.$el.querySelector('.selectedDay'), this.reverseAnimation);
      this._renderNode(this.$el.querySelector('.selectedWeekday'), this.reverseAnimation);

    },
    nowMessage(newMsg) {
      let elem  = this.$el.querySelector('.msg-content');
      this._renderNode(elem, false);
    }
  },

  methods: {
    _setEventList() {
      return this.$http.get(this.agenda).then(res => this.eventList = res.body);
    },
    _resetViewDateMatrix() {
      let weeksFull = dateUtils.getWeekArray(this.viewDate);
      this.viewDateMatrix = this._enhanceWeeks(weeksFull);
      this._recalculateEvent();
    },
    _enhanceWeeks(weeksFull) {
      var self = this;
      return weeksFull.map(function(week) {
        if (!week || week === null) {
          return null;
        }
        return week.map(function(day) {
          return {
            fullDate: day,
            shortDate: day ? day.getDate() : null,
            offClass: !dateUtils.isEqualMonth(day, self.viewDate) ? 'offDay':'',
            curClass: dateUtils.isEqualDate(day, self.nowDate) ? 'currentDay' : '',
            selected: dateUtils.isEqualDate(day, self.selectedDate),
            event: null
          };
        });
      });
    },
    _recalculateEvent() {
      if (!this.eventList.length) {
        this._setEventList().then(this._recalculateEvent);
        return;
      }
      let eventList = this.eventList;
      let vdMatrix = this.viewDateMatrix;
      this.viewDateMatrix = vdMatrix.map((week) => {
        return week.map((day) => {
          if(!day.fullDate) {
            return day;
          }
          let dayClone = Object.assign({}, day);
          eventList.forEach((evt) => {
            let pinDate = new Date(evt.pinDate);
            let timeSpan = dateUtils.dayDiff(pinDate, dayClone.fullDate);
            if (timeSpan % evt.cycle === 0) {
              dayClone.event = {
                title: evt.title,
                tag: evt.tag,
                msg: evt.msg
              }
            }
          });
          return dayClone;
        });
      });
      this._showMessage();
    },
    _showMessage() {
      if (!dateUtils.isEqualMonth(this.selectedDate, this.viewDate))
        return;
      let weekIndex = dateUtils.getWeekOfMonth(this.selectedDate) - 1;
      let dayIndex = this.selectedDate.getDay();
      let dayDetail = this.viewDateMatrix[weekIndex][dayIndex];
      let messages = dayDetail.event ? dayDetail.event.msg : [];
      clearTimeout(this.timeoutID);
      this._blinkMsg(messages, 2000);
    },
    _renderNode(element, reverse) {
      if (this.disablePropertyAnimations){
        return;
      }
      var delayRemovalTime = 400;
      var el = element;
      var elClone = el.cloneNode(true);

      el._originalTransition = element.style.transition;
      el.style.transition = 'none';
      el.parentElement.appendChild(elClone);

      if (!reverse) {
        el.classList.remove('in'); // back to start position immediately
      } else {
        el.classList.add('out'); // go to end position immediately
      }

      setTimeout(function() {
        el.style.transition = el._originalTransition;
        if (!reverse) {
          elClone.classList.add('out'); // animate to end position
        } else {
          elClone.classList.remove('in'); // animate to start position
          el.classList.remove('out'); // animate to start position
        }
        el.classList.add('in');
      }, 0);

      setTimeout(function() {
        try {
          el.parentElement.removeChild(elClone);
        } catch (err) {
          console.log(err.message);
        }
      }, delayRemovalTime);
    },
    _blinkMsg(msgArray, ms) {
      let length = msgArray.length;
      let self = this;
      if (!length) {
        self.nowMessage = '';
        return;
      }

      let counter = 0;

      (function doBlink() {
        self.nowMessage = msgArray[counter];
        counter = (counter + 1) % length;
        self.timeoutID = setTimeout(doBlink, ms);
      })();
    },
    onPrev() {
      this.viewDate = dateUtils.addMonths(this.viewDate, -1);
    },
    onNext() {
      this.viewDate = dateUtils.addMonths(this.viewDate, 1);
    },
    selectDate(date) {
      this.selectedDate = date;
    }
  }
}
</script>

<style>
.sn-calendar {
  font-size: 12px;
  line-height: 24px;
  width: 100%;
  max-width: 378px;
}

#selectedWeekdayHeader {
  color: #FFF;
  height: 36px;
  background: #71285b;
  overflow: hidden;
  -webkit-transition: all .3s;
  transition: all .3s;
}

#selectedDateHeader {
  box-sizing: border-box;
  background: #822e69;
  color: #FFF;
  padding: 12px 0;
  box-shadow: 0 1px 8px rgb(113, 40, 91);
}

#selectedMonth {
  height: 20px;
}

#selectedDay {
  height: 60px;
}

#selectedDateHeader > div {
  width: 100%;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.selectedWeekday {
  font-size: 14px;
  line-height: 36px;
  text-align: center;
  margin: 0;
  font-weight: 400;
}

.selectedMonth,
.selectedYear {
  font-size: 18px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0.05em;
}

.selectedDay {
  font-size: 56px;
  line-height: 60px;
}

.sn-calendar__month__arrow {
  width: 40px;
  height: 40px;
  padding: 8px;
  display: inline-block;
  box-sizing: border-box;
  cursor: pointer;
  user-select: none;
}

#viewingMonthYear {
  height: 48px;
  overflow: hidden;
}

.viewingMonthYear {
  margin: 0;
  font-size: 16px;
  line-height: 48px;
  letter-spacing: 0.02em;
  text-align: center;
}

#wrapper {
  height: calc(100vh - 196px);
  overflow: auto;
}

.sn-calendar__month,
.sn-calendar__weekday {
  margin: 0;
}

.sn-calendar__weekday__name {
  font-weight: 400;
  width: 14.285%;
  text-align: center;
  color: rgba(0,0,0,0.3);
}

.sn-calendar__days {
  position: relative;
  padding: 0;
  height: 390px;
  box-sizing: border-box;
  overflow: hidden;
}

.sn-calendar__days__day {
  box-sizing: border-box;
  cursor: pointer;
  width: 14.285%;
  height: 64px;
  position: relative;
}

.sn-calendar__days__day .after {
  border-radius: 50%;
  width: 30px;
  height: 30px;
  position: absolute;
  left: 50%;
  top: 50%;
  margin-left: -15px;
  margin-top: -16px;
  background: #822e69;
  -webkit-transform: scale(0);
  transform: scale(0);
  opacity: 0;
  transition: all .2s cubic-bezier(0.175, 0.885, 0.320, 1.275);
  -webkit-transition: all .2s cubic-bezier(0.175, 0.885, 0.320, 1.275);
}

.sn-calendar__days__day[selected] .after {
  -webkit-transform: scale(1);
  transform: scale(1);
  opacity: 1;
}

.sn-calendar__days__day div {
  z-index: 1;
}

.sn-calendar__days__day[selected] .short-date {
  color: #FFF !important;
  font-weight: bold;
}

.sn-calendar__days__day.currentDay .short-date{
  font-weight: bolder;
  color: #822e69;
}

.sn-calendar__days__day .event {
  position: absolute;
  bottom: 0;
  left: 50%;
  margin-left: -16px;
  border-radius: 2px;
  line-height: 12px;
  white-space:nowrap;
  padding: 2px 4px;
  color: #fff;
}

.sn-calendar__days__day .morning_in {
  background: #3F51B5;
}

.sn-calendar__days__day .morning_out {
  background: #8BC34A;
}

.sn-calendar__days__day .pier {
  background: #F90093;
}

.sn-calendar__days__day .night_in {
  background: #FFC107;
}

.sn-calendar__days__day .night_out {
  background: #795548;
}

.sn-calendar__days__day .strength {
  background: #FF5722;
}

.slideVertical {
  transition: all .4s cubic-bezier(0.390, 0.575, 0.135, 0.995);
  -webkit-transition: all .4s cubic-bezier(0.390, 0.575, 0.135, 0.995);
  position: absolute;
  -webkit-transform: translateY(100%);
  transform: translateY(100%);
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  opacity: 0;
  z-index: 0;
}

.slideVertical.in {
  -webkit-transform: translateY(0px);
  transform: translateY(0px);
  z-index: 1;
  opacity: 0.9;
}

.slideVertical.out {
  -webkit-transform: translateY(-100%);
  transform: translateY(-100%);
  z-index: 0;
  opacity: 0;
}

.slideHorizontal {
  transition: all .3s cubic-bezier(0.390, 0.575, 0.135, 0.995);
  -webkit-transition: all .3s cubic-bezier(0.390, 0.575, 0.135, 0.995);
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  will-change: transform;
  -webkit-transform: translateX(100%);
  transform: translateX(100%);
}

.slideHorizontal.in {
  -webkit-transform: translateX(0);
  transform: translateX(0);
}

.slideHorizontal.out {
  -webkit-transform: translateX(-100%);
  transform: translateX(-100%);
}

#sn-message {
  height: 56px;
}

.fade {
  transition: all .3s cubic-bezier(0.390, 0.575, 0.135, 0.995);
  -webkit-transition: all .3s cubic-bezier(0.390, 0.575, 0.135, 0.995);
  position: absolute;
  left: 0;
  width: 100%;
  top: 0;
  bottom: 0;
  opacity: 0;
  -webkit-transform: scale(0.8);
  transform: scale(0.8);
}

.fade.in {
  opacity: 1;
  -webkit-transform: scale(1);
  transform: scale(1);
}

.fade.out {
  opacity: 0;
  -webkit-transform: scale(0.8);
  transform: scale(0.8);
}

</style>
