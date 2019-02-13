import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {HomePage} from "../home/home";
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";



@Component({
  selector: 'page-track-data',
  templateUrl: 'track-data.html',
})
export class TrackDataPage {

  private tracked = {};
  private buttonColors = {};
  private goalProgresses = {};
  private dataType;
  private dataToTrack = [];
  private trackedSoFar;
  private numList;
  private previouslyTracked;


  constructor(public navCtrl: NavController, public navParams: NavParams,
              private couchDBService: CouchDbServiceProvider, private globalFunctions: GlobalFunctionsServiceProvider) {
    this.numList = Array.from(new Array(10),(val,index)=>index+1);
    this.previouslyTracked = couchDBService.getTrackedData();
  }

  ionViewDidLoad() {
    this.dataType = this.navParams.data['leftToTrack'][0];
    this.dataToTrack = this.navParams.data['dataDict'][this.dataType];
    this.trackedSoFar = this.navParams.data['tracked'];

    if(!('tracked' in this.navParams.data)) {
      this.navParams.data['tracked'] = {};
    }
    this.calculateGoalProgresses();
  }

  getColor(data, value) {
    if(this.buttonColors[data.name] === undefined){
      this.buttonColors[data.name] = {value: 'light'};
      return 'light';
    }
    else if (this.buttonColors[data.name][value] === undefined) {
      this.buttonColors[data.name][value] = 'light';
      return 'light';
    }
    return this.buttonColors[data.name][value];
  }


  calculateGoalProgresses() {
    for(let i=0; i<this.dataToTrack.length; i++){
      let data = this.dataToTrack[i];
      if(data.goal && data.goal.freq) {
        this.goalProgresses[data.name] =
          this.globalFunctions.calculatePriorGoalProgress(data, this.dataType, this.previouslyTracked);
      }
    }
  }


  totalTrackedTimes(data) {
    let timesSoFar = this.goalProgresses[data.name];
    if(this.tracked[data.name] !== 'undefined' && !isNaN(this.tracked[data.name])){
      if(data.field === 'number'){
        timesSoFar += Number(this.tracked[data.name]);
      }
      else if(data.field !== 'binary' || this.tracked[data.name] === true){
        timesSoFar += 1;
      }
    }
    return timesSoFar;
  }


  goalProgress(data){
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


  catScale(data, value) {
    if(this.tracked[data.name]){
      this.buttonColors[data.name][this.tracked[data.name]] = 'light';
    }
    this.buttonColors[data.name][value] = 'primary';
    this.tracked[data.name] = value;
  }

  nothingTracked() {
    if (Object.keys(this.tracked).length == 0) {
      if (this.dataToTrack.length !== 1) {
        return true;
      }
      else if(this.dataToTrack[0].field !== 'calculated medication use') {
        return true;
      }
    }
    return false;
  }

  continueTracking() {
    if(!(Object.keys(this.tracked).length == 0)){
      this.navParams.data.tracked[this.dataType] = this.tracked;
    }
    this.navParams.data['leftToTrack'].splice(0,1);
    if (this.navParams.data['leftToTrack'].length > 0){
      this.navCtrl.push(TrackDataPage, this.navParams.data);
    }
    else {
      this.navParams.data['tracked']['dateTracked'] = new Date();
      this.couchDBService.trackData(this.navParams.data['tracked']);
      this.navCtrl.push(HomePage, {'trackedData': this.navParams.data['tracked']});
    }
  }

}
