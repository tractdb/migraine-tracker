import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {HomePage} from "../home/home";
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";
import {DateFunctionServiceProvider} from "../../providers/date-function-service/date-function-service";



@Component({
  selector: 'page-track-data',
  templateUrl: 'track-data.html',
})
export class TrackDataPage {

  private tracked : {[trackedDataID : string] : any} = {};

  private trackDate : string;
  private goalProgresses : {[dataID : string] : any} = {};
  private dataType : string;
  private dataToTrack : {[dataProps : string] : any}[] = [];
  private dataList : string;
  private trackedMedsToday : boolean;
  private previouslyTracked : {[trackedDataID : string] : any}[];
  private somethingTracked : boolean;
  private durationItemStart : {[trackedDataID : string] : string} = {};
  private durationItemEnd : {[trackedDataID : string] : string} ={};
  private cardExpanded : {[dataType: string] : boolean} = {};


  constructor(public navCtrl: NavController, public navParams: NavParams,
              public dateFunctionservice: DateFunctionServiceProvider,
              private couchDBService: CouchDbServiceProvider, private globalFuns: GlobalFunctionsServiceProvider) {

    this.previouslyTracked = couchDBService.getTrackedData();
    this.trackDate = this.dateFunctionservice.dateToPrettyDate(new Date());
  }


  changeVals(componentEvent : {[eventPossibilities: string] : any}, data : {[dataProps: string] : any}){
    if(componentEvent.dataVal){
      this.tracked[data.id] = componentEvent.dataVal;
    }
    if(componentEvent.dataStart){
      this.durationItemStart[data.id] = componentEvent.dataStart;
    }
    if(componentEvent.dataEnd){
      this.durationItemEnd[data.id] = componentEvent.dataEnd;
    }
    this.somethingTracked = true;
  }

  ionViewDidLoad() {
    this.dataType = this.navParams.data['currentDataType'];
    this.dataToTrack = this.navParams.data['dataDict'][this.dataType];
    this.dataList = this.dataToTrack.map(x => x.name).join(", ");
    if(!('tracked' in this.navParams.data)) {
      this.navParams.data['tracked'] = {};
    }
    this.trackedMedsToday = this.globalFuns.getWhetherTrackedMeds(this.tracked);
    this.calculateGoalProgresses();
  }


  calculateGoalProgresses() {
    for(let i=0; i<this.dataToTrack.length; i++){
      let data = this.dataToTrack[i];
      if(data.id === 'frequentMedUse'){
        this.goalProgresses[data.id] =
          this.globalFuns.calculatePriorGoalProgress(data, 'Treatments', this.previouslyTracked);
      }
      else if(data.goal && data.goal.freq) {
        this.goalProgresses[data.id] =
          this.globalFuns.calculatePriorGoalProgress(data, this.dataType, this.previouslyTracked);
      }
    }
  }


  totalTrackedTimes(data: {[dataProps : string] : any}) : Number{
    let timesSoFar = this.goalProgresses[data.id];
    if (data.id === 'frequentMedUse'){ // we pull from the 'treatments' dict!
      timesSoFar += (this.trackedMedsToday ? 1 : 0);
    }
    else if(this.tracked[data.id]) {
      if (data.field === 'number') {
        timesSoFar += Number(this.tracked[data.id]);
      }
      else if (data.field !== 'binary' || this.tracked[data.id] === 'Yes') {
        timesSoFar += 1;
      }
    }
    return timesSoFar;
  }


  goalProgress(data : {[dataProps : string] : any}){
    if(this.dataType==='Symptoms'){
      return 'no feedback';
    }
    let timesTracked = this.totalTrackedTimes(data);
    if(timesTracked > data.goal.threshold){
      if(data.goal.freq === 'More'){
        return 'met';
      }
      return 'over'
    }
    else if(timesTracked === data.goal.threshold){
      if(data.goal.freq === 'More'){
        return 'met';
      }
      return 'at limit';
    }
    else{
      if(data.goal.freq === 'More'){
        return 'under';
      }
      return 'below limit';
    }
  }


  addDurationItems(durationDict : {[dataID : string] : any}, endPoint : string){
    let dataNames = Object.keys(durationDict);
    for(let i=0; i<dataNames.length; i++){
      if(!this.tracked[dataNames[i]]){
        this.tracked[dataNames[i]] = {};
      }
      this.tracked[dataNames[i]][endPoint] = durationDict[dataNames[i]];
    }
  }


  formatForCalendar(event){
    let startAndEndDates = this.dateFunctionservice.getStartAndEndDatesForCalendar();
    event['startTime'] = startAndEndDates[0];
    event['endTime'] = startAndEndDates[1];
    event['allDay'] = true;
    event['title'] = this.globalFuns.getWhetherMigraine(event['Symptoms']) ? 'Migraine' : 'No Migraine';
    return event;
  }


  continueTracking() {
    if(this.somethingTracked){
      this.addDurationItems(this.durationItemStart, 'start');
      this.addDurationItems(this.durationItemEnd, 'end');
      this.navParams.data.tracked[this.dataType] = this.tracked;
    }

    let newIndex = this.navParams.data['allDataTypes'].indexOf(this.dataType)+1;
    if(newIndex < this.navParams.data['allDataTypes'].length){
      this.navParams.data['currentDataType'] = this.navParams.data['allDataTypes'][newIndex];
      this.navCtrl.push(TrackDataPage, this.navParams.data);
    }
    else {
      this.navParams.data['tracked'] = this.formatForCalendar(this.navParams.data['tracked']);
      this.couchDBService.trackData(this.navParams.data['tracked']);
      this.navCtrl.setRoot(HomePage, {'trackedData': this.navParams.data['tracked']});
    }
  }

}
