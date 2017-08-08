<template>
  <div class="sn-calendar">
    <div class="sn-calendar__weekday layout horizontal center">
      <div class="sn-calendar__weekday__name" v-for="weekDay of weekDays">{{weekDay}}</div>
    </div>
    <div class="sn-calendar__days layout horizontal wrap">
      <template v-for="week of viewDateMatrix">
        <div class="sn-calendar__days__day layout horizontal center-justified" v-for="date of week"
          v-bind:class="[date.curClass, date.offClass]"
          :date="date.fullDate"
          :selected="date.selected">
          <div class="layout horizontal center">{{date.shortDate}}</div>
        </div>
      </template>

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
      nowDate: new Date()
    }
  },

  computed: {
    weekDays() {
      return localeString[this.locale].shortDayNames;
    },
    viewDateMatrix() {
      let weeksFull = dateUtils.getWeekArray(this.viewDate);
      return this._enhanceWeeks(weeksFull);
    }
  },

  methods: {
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
            curClass: dateUtils.isEqualDate(day, self.nowDate) ? ' currentDay' : '',
            selected: dateUtils.isEqualDate(day, self.selectedDate)
          };
        });
      });
    }
  }
}
</script>

<style>
.sn-calendar {
  font-size: 12px;
  line-height: 24px;
  width: 276px;
}

.sn-calendar__weekday {
  margin: 0 12px;
}

.sn-calendar__weekday__name {
  font-weight: 400;
  width: 36px;
  text-align: center;
  color: rgba(0,0,0,0.3);
}

.sn-calendar__days {
  padding: 0 12px;
  box-sizing: border-box;
}

.sn-calendar__days__day {
  box-sizing: border-box;
  cursor: pointer;
  width: 36px;
  height: 36px;
  position: relative;
}

.sn-calendar__days__day:after {
  content: ' ';
  border-radius: 50%;
  position: absolute;
  top: 3px;
  right: 3px;
  bottom: 3px;
  left: 3px;
  background: #fd37a4;
  z-index: 0;
  -webkit-transform: scale(0);
  transform: scale(0);
  opacity: 0;
  transition: all .2s cubic-bezier(0.175, 0.885, 0.320, 1.275);
  -webkit-transition: all .2s cubic-bezier(0.175, 0.885, 0.320, 1.275);
}

.sn-calendar__days__day[selected]:after {
  -webkit-transform: scale(1);
  transform: scale(1);
  opacity: 1;
}

.sn-calendar__days__day div {
  z-index: 1;
  transition: all .2s;
  -webkit-transition: all .2s;
}

.sn-calendar__days__day[selected] div {
  color: #FFF;
  font-weight: 600;
}

.sn-calendar__days__day.currentDay {
  font-weight: 600;
  color: red;
}
</style>
