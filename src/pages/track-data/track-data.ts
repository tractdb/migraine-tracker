import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {HomePage} from "../home/home";



@Component({
  selector: 'page-track-data',
  templateUrl: 'track-data.html',
})
export class TrackDataPage {

  private tracked = {};
  private buttonColors = {};
  private dataType;
  private dataToTrack = [];
  private trackedSoFar;
  private numList;


  constructor(public navCtrl: NavController, public navParams: NavParams) {
    // todo: pull form DB so we can compare to goals
    this.numList = Array.from(new Array(10),(val,index)=>index+1);
  }

  ionViewDidLoad() {
    this.dataType = this.navParams.data['leftToTrack'].splice(0,1);
    this.dataToTrack = this.navParams.data['dataDict'][this.dataType];
    this.trackedSoFar = this.navParams.data['tracked'];

    if(!('tracked' in this.navParams.data)) {
      this.navParams.data['tracked'] = {};
    }
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
    console.log(this.navParams.data);
    if (this.navParams.data['leftToTrack'].length > 0){
      this.navCtrl.push(TrackDataPage, this.navParams.data);
    }
    else {
      this.navCtrl.push(HomePage, {'trackedData': this.navParams.data['tracked']});
    }
  }

}
