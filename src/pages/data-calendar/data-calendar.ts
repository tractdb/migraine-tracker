import { Component } from '@angular/core';
import {ModalController, NavController, NavParams} from 'ionic-angular';
import * as moment from 'moment';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {DateFunctionServiceProvider} from "../../providers/date-function-service/date-function-service";
import {TrackDataPage} from "../track-data/track-data";
import {SelectTrackingFrequencyPage} from "../addGoal/select-tracking-frequency/select-tracking-frequency";
import {ViewDatapointPage} from "../view-datapoint/view-datapoint";


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
  minMonth;
  isMaxMonth = true;
  isMinMonth = false;

  calendar = {
    currentDate: new Date(),
    formatDayHeader: ''
  };

  noEventsLabel;
  allDayLabel = "Data Tracked";

  eventSource = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private modalCtrl: ModalController,
              public couchDBService: CouchDbServiceProvider, public dateFunctions: DateFunctionServiceProvider) {
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



  ionViewDidLoad() {
    let dateFuns = this.dateFunctions;
    this.currentMonth = moment(this.calendar.currentDate).format("MMMM");
    let events = this.couchDBService.getTrackedData();
    events.map(function(event){
      event.startTime = dateFuns.getOTCDate(event.startTime);
      event.endTime = dateFuns.getOTCDate(event.endTime);
    });
    this.eventSource = events;
    this.minMonth = dateFuns.getMinMonth(events);
    console.log(this.minMonth);
    this.calendar.currentDate = new Date();
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
    // console.log(event);
  }



  seeDataDetails(event){
    let dataDetailsModal = this.modalCtrl.create(ViewDatapointPage, event);
    dataDetailsModal.onDidDismiss(newData => {
      if(newData){
        console.log(newData);
      }
    });
    dataDetailsModal.present();
  }


  checkMinAndMax(){
    this.currentMonth = moment(this.calendar.currentDate).format("MMMM");
    this.isMaxMonth = moment().isSame(this.calendar.currentDate, 'month');
    this.isMinMonth = this.minMonth.isSame(this.calendar.currentDate, 'month');
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
