import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import * as moment from 'moment';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";


/**
 * See https://github.com/twinssbc/Ionic2-Calendar
 */

@Component({
  selector: 'page-data-calendar',
  templateUrl: 'data-calendar.html',
})
export class DataCalendarPage {

  lockSwipes = false;
  currentMonth;
  isMaxMonth = true;
  isMinMonth = false;

  calendar = {
    currentDate: new Date(),
    formatDayHeader: ''
  };

  noEventsLabel;
  allDayLabel = "Data Tracked";

  eventSource = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public couchDBService: CouchDbServiceProvider) {
  }

  setSwipesToLock(){
    var me = this;
    setTimeout(function() {
      me.lockSwipes = true;
    },100);
  }



  ngAfterViewInit() {
    this.setSwipesToLock();
  }


  getOTCDate(date){
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  }


  formatEvents(events) {
    for(var i=0; i<events.length; i++){
      let event = events[i];
      let dateTracked = new Date(event['dateTracked']);
      dateTracked.setHours(0,0,0,0);
      let nextDay = moment(dateTracked).add(1, "day").toDate();
      event['startTime'] = this.getOTCDate(dateTracked);
      event['endTime'] =this.getOTCDate(nextDay);
      event['allDay'] = true;
      event['calendarClass'] = 'migraineDay';
      event['title'] = (event['Symptoms'] && event['Symptoms']['Migraine today']) ? 'Migraine Day' : 'No Migraine';
      this.eventSource.push(event);

    }
    this.calendar.currentDate = new Date();
  }


  ionViewDidLoad() {
    this.currentMonth = moment(this.calendar.currentDate).format("MMMM");
    this.formatEvents(this.couchDBService.getTrackedData());
  }

  getClass(view){
    if(view.events.length > 0){
      for(let i=0; i<view.events.length; i++){
        let event = view.events[i];
        if(event['Symptoms'] && event['Symptoms']['Migraine today']){
          return 'migraineDay';
        }
      }
      return 'noMigraine'
    }
    return '';
  }


  onCurrentDateChanged(event){
    let actualThis = this;
    setTimeout(function() { // otherwise I get an "changed after checking" error ...
      if(moment().isSame(event, 'day')){
        actualThis.noEventsLabel = 'No data tracked today';
      }
      else{
        actualThis.noEventsLabel = 'No data tracked on ' + moment(event).format("MMM Do");
      }
    },50);
  }

  onEventSelected(event){
    console.log(event);
  }


  checkMinAndMax(){
    this.currentMonth = moment(this.calendar.currentDate).format("MMMM");
    this.isMaxMonth = moment().isSame(this.calendar.currentDate, 'month');
    this.isMinMonth = false; //todo
  }

  changeMonth(direction){
    this.lockSwipes = false;
    let newMonth;
    if(direction === 'subtract'){
      newMonth = moment(this.calendar.currentDate).subtract(1, "month");
    }
    else{
      newMonth = moment(this.calendar.currentDate).add(1, "month");
    }
    this.calendar.currentDate = newMonth.toDate();
    this.lockSwipes = true;
    this.checkMinAndMax();
  }

}
