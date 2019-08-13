import { Component } from '@angular/core';
import {ModalController, NavController, NavParams} from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {DateFunctionServiceProvider} from "../../providers/date-function-service/date-function-service";
import {ViewDatapointPage} from "../view-datapoint/view-datapoint";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";


/**
 * See https://github.com/twinssbc/Ionic2-Calendar
 */

@Component({
  selector: 'page-data-calendar',
  templateUrl: 'data-calendar.html',
})
export class DataCalendarPage {

  private lockSwipes : boolean = false;
  private currentMonth : string;
  private isMaxMonth : boolean = true;
  private selectedDay : any;

  private calendar : {[calendarProp: string] : any} = {
    currentDate: new Date(),
    formatDayHeader: ''
  };

  private noEventsLabel : string = "No data tracked";
  private allDayLabel : string = "Data Tracked";

  private eventSource : {[eventProps: string] : any}[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private modalCtrl: ModalController,
              public couchDBService: CouchDbServiceProvider, public globalFuns: GlobalFunctionsServiceProvider,
              public dateFunctions: DateFunctionServiceProvider) {
    this.selectedDay = this.dateFunctions.getUTCDate(null);
  }

  setSwipesToLock(){
    var actualThis = this;
    setTimeout(function() {
      actualThis.lockSwipes = true;
    },100);
  }



  ngAfterViewInit() {
    this.setSwipesToLock();
  }



  ionViewDidLoad() {
    let dateFuns = this.dateFunctions;
    this.currentMonth = this.dateFunctions.getDate(this.calendar.currentDate).format("MMMM");
    let events = this.couchDBService.getTrackedData(); // could pull month by month but I think this is better for short studies
    events.map(function(event){ // shouldn't be necessary if we're pushing right originally
      event.startTime = dateFuns.getUTCDate(event.startTime);
      event.endTime = dateFuns.getUTCDate(event.endTime);
    });
    this.eventSource = events;
    this.calendar.currentDate = new Date();
  }




  getClass(view : {[dayAttributes: string] : any}) : string{
    if(view.events.length > 0){
      for(let i=0; i<view.events.length; i++){ // (won't be necessary if we consolidate to 1/day)
        if(!view.events[i].title){
          view.events[i].title = this.globalFuns.getWhetherMigraine(view.events[i]['Symptom']) ? 'Migraine' : 'No Migraine';
        }
        if(view.events[i].title === 'Migraine'){ // if ANY report includes migraine
          return 'migraineDay';
        }
      }
      return 'noMigraine'
    }
    return '';
  }


  onCurrentDateChanged(event){
    this.selectedDay = event;
  }



  seeDataDetails(event : {[eventProps: string] : any}){
    let isNew = false;
    if(!event){
      isNew = true;
      event = {'startTime': this.selectedDay.toISOString()}
    }
    let actualThis = this;
    let dataDetailsModal = this.modalCtrl.create(ViewDatapointPage, event);
    dataDetailsModal.onDidDismiss(newData => {
      if(newData){
        // todo: push!!!
        newData.title = actualThis.globalFuns.getWhetherMigraine(newData['Symptom']) ? 'Migraine' : 'No Migraine';
        if(isNew){
          let times =  actualThis.dateFunctions.getStartAndEndDatesForCalendar(actualThis.selectedDay);
          newData.allDay = true;
          newData.startTime = times[0];
          newData.endTime = times[1];
          actualThis.eventSource.push(newData);
          this.calendar.currentDate = actualThis.selectedDay; // to actually update eventSource
        }
        else event = newData;
      }
    });
    dataDetailsModal.present();
  }


  checkMinAndMax(){
    this.currentMonth = this.dateFunctions.getDate(this.calendar.currentDate).format("MMMM");
    this.isMaxMonth = this.dateFunctions.compareToToday(this.calendar.currentDate, 'month');
  }

  changeMonth(direction : string){
    if(!(this.isMaxMonth && direction === 'add')){
      this.lockSwipes = false;
      let newMonth = this.dateFunctions.dateArithmatic(this.calendar.currentDate, direction, 1, "month");
      this.calendar.currentDate = newMonth.toDate();
      this.lockSwipes = true;
      this.checkMinAndMax();
    }
  }

}
