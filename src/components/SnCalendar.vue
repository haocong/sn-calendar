<template>
  <div class="sn-calendar">
    <div class="sn-calendar__month layout horizontal">
      <v-touch class="sn-calendar__month__arrow left" v-on:tap="onPrev">
        <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></g></svg>
      </v-touch>
      <div id="viewingMonthYear" class="flex relative">
        <h4 class="viewingMonthYear">{{viewMonth}} {{viewYear}}</h4>
      </div>
      <v-touch class="sn-calendar__month__arrow right" v-on:tap="onNext">
        <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" style="pointer-events: none; display: block; width: 100%; height: 100%;"><g><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path></g></svg>
      </v-touch>
    </div>
    <div class="sn-calendar__weekday layout horizontal center">
      <div class="sn-calendar__weekday__name" v-for="weekDay of weekDays">{{weekDay}}</div>
    </div>
    <div class="sn-calendar__days layout horizontal wrap">
      <template v-for="week of viewDateMatrix">
        <v-touch class="sn-calendar__days__day layout horizontal center-center" v-for="(date, index) of week"
          :key="index"
          :class="[date.curClass, date.offClass]"
          :date="date.fullDate"
          :selected="date.selected"
          v-on:tap="selectDate(date.fullDate)">
          <div class="after"></div>
          <div class="layout center">{{date.shortDate}}</div>
        </v-touch>
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
    },
    viewMonth() {
      return localeString[this.locale].monthNames[this.viewDate.getMonth()];
    },
    viewYear() {
      return this.viewDate.getFullYear();
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
            curClass: dateUtils.isEqualDate(day, self.nowDate) ? 'currentDay' : '',
            selected: dateUtils.isEqualDate(day, self.selectedDate)
          };
        });
      });
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
  max-width: 357px;
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
  overflow: hidden;
}

.viewingMonthYear {
  margin: 0;
  font-size: 16px;
  line-height: 48px;
  letter-spacing: 0.02em;
  text-align: center;
}

.sn-calendar__month,
.sn-calendar__weekday {
  margin: 0 12px;
}

.sn-calendar__weekday__name {
  font-weight: 400;
  width: 14.285%;
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
  width: 14.285%;
  height: 36px;
  position: relative;
}

.sn-calendar__days__day .after {
  border-radius: 50%;
  width: 36px;
  height: 36px;
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 1;
  margin-left: -18px;
  margin-top: -19px;
  background: #fd37a4;
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
