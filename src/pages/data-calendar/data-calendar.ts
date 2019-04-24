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

  private noEventsLabel : string;
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
    let events = this.couchDBService.getTrackedData();
    events.map(function(event){
      event.startTime = dateFuns.getUTCDate(event.startTime);
      event.endTime = dateFuns.getUTCDate(event.endTime);
    });
    this.eventSource = events;
    this.calendar.currentDate = new Date();
  }


  isMigraineEvent(event : {[evenProps: string] : any}) : boolean{
    // todo: make smarter (like if they only have duration); probably put in service
    return this.globalFuns.getWhetherMigraine(event['Symptoms']);
  }


  getClass(view : {[dayAttributes: string] : any}) : string{
    if(view.events.length > 0){
      for(let i=0; i<view.events.length; i++){
        if(this.isMigraineEvent(view.events[i])){
          return 'migraineDay';
        }
      }
      return 'noMigraine'
    }
    return '';
  }


  onCurrentDateChanged(event){
    this.selectedDay = this.dateFunctions.getUTCDate(event);
    let actualThis = this;
    setTimeout(function() { // otherwise I get an "changed after checking" error ...
      if(actualThis.dateFunctions.compareToToday(event, 'day')){
        actualThis.noEventsLabel = 'No data tracked today';
      }
      else{
        actualThis.noEventsLabel = 'No data tracked on ' +
          actualThis.dateFunctions.getDate(event).format("MMM Do");
      }
    },50);
  }



  seeDataDetails(event : {[evenProps: string] : any}){
    if(!event){
      event = {'startTime': this.selectedDay.toISOString()}
    }
    let dataDetailsModal = this.modalCtrl.create(ViewDatapointPage, event);
    dataDetailsModal.onDidDismiss(newData => {
      if(newData){
        // todo: push?
        console.log(newData);
      }
    });
    dataDetailsModal.present();
  }


  checkMinAndMax(){
    this.currentMonth = this.dateFunctions.getDate(this.calendar.currentDate).format("MMMM");
    this.isMaxMonth = this.dateFunctions.compareToToday(this.calendar.currentDate, 'month');
  }

  changeMonth(direction : string){
    this.lockSwipes = false;
    let newMonth = this.dateFunctions.dateArithmatic(this.calendar.currentDate, direction, 1, "month");
    this.calendar.currentDate = newMonth.toDate();
    this.lockSwipes = true;
    this.checkMinAndMax();
  }

}
