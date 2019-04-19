import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";

/**
 * Generated class for the BreakFromTrackingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-break-from-tracking',
  templateUrl: 'break-from-tracking.html',
})
export class BreakFromTrackingPage {

  currentBreak : {[breakProps: string] : any};
  currentBreakStarted : string;

  selected : string = '';


  dateToSnoozeTo : string;
  dateToCheckIn : string;

  reasonForBreak : string;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public couchDBProvider: CouchDbServiceProvider) {
  }

  setDates(){
    let today = new Date();
    let monthFromNow;
    if(today.getMonth() == 11) { // seriously??
      monthFromNow = new Date(today.getFullYear() + 1, 0, today.getDate());
    }
    else {
      monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    }
    this.dateToCheckIn = monthFromNow.toISOString();
  }

  getStartDate(){
    let dateStarted = new Date(this.currentBreak.started);
    this.currentBreakStarted = dateStarted.getMonth() + "/" + dateStarted.getDate()
      + "/" + dateStarted.getFullYear();
  }

  ionViewDidLoad() {
    this.currentBreak = this.couchDBProvider.getCurrentBreak();
    if(!this.currentBreak){
      this.setDates();
    }
    else{
      this.getStartDate();
      this.dateToSnoozeTo = this.currentBreak.notifyDate;
      this.dateToCheckIn = this.currentBreak.dateToCheckIn;
    }
  }

  takeBrake(){
    //todo: push to couch, deal with notifications, etc
    let newBreak = {};
    newBreak['reasonForBreak'] = this.reasonForBreak;
    if(this.selected==='Yes' && this.dateToSnoozeTo){
      newBreak['notifyDate'] = this.dateToSnoozeTo;
    }
    else if(this.selected ==='Unsure' && this.dateToCheckIn){
      newBreak['checkInDate'] = this.dateToCheckIn;
    }
    else{
      newBreak['noDates'] = true;
    }
    newBreak['started'] = new Date();
    console.log(newBreak);
    this.couchDBProvider.setBreak(newBreak);
    this.currentBreak = newBreak;
    this.dateToCheckIn = newBreak['checkInDate'];
    this.getStartDate();
  }

  updateBreak(){
    this.currentBreak['notifyDate'] = this.dateToSnoozeTo;
    if(this.dateToSnoozeTo){
      delete this.currentBreak['checkInDate'];
    }
    else{
      this.currentBreak['checkInDate'] = this.dateToCheckIn
    }
    this.couchDBProvider.updateBreak(this.currentBreak);
  }

  endBreak(){
    //todo: push to couch, deal with notifications, etc
    this.currentBreak['ended'] = new Date();
    this.couchDBProvider.updateBreak(this.currentBreak);
    this.currentBreak = undefined;
    this.dateToSnoozeTo = undefined;
    this.dateToCheckIn = undefined;
    this.setDates();
  }

}
