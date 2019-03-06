import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';


/**
 * See https://github.com/twinssbc/Ionic2-Calendar
 */

@Component({
  selector: 'page-data-calendar',
  templateUrl: 'data-calendar.html',
})
export class DataCalendarPage {

  calendar = {
    mode: 'month',
    currentDate: new Date(),
    formatDayHeader: ''
  };

  noEventsLabel = 'No Data Tracked Today';
  allDayLabel = "Data Tracked";

  eventSource = [];
  selectedDay = new Date();

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }



  ionViewDidLoad() {
    var startTime = new Date(Date.UTC(2019, 2, 4)); // because month starts at 0?!?!?!
    var endTime = new Date(Date.UTC(2019, 2, 5));
    console.log(startTime);
    console.log(startTime.getTime());
    this.eventSource = [{'title': 'Migraine Day', 'startTime': startTime, 'endTime': endTime, 'allDay': true}];
  }

  onCurrentDateChanged(event){
    // console.log(event);
  }

  reloadSource(startTime, endTime){
    // console.log(startTime);
    // console.log(endTime);
  }

  onEventSelected(event){
    console.log(event);
  }

  onViewTitleChanged(event){
    // console.log(event);
  }

  onTimeSelected(event){
    // console.log(event);
  }

}
