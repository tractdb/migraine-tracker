import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import * as moment from 'moment';
import {DateFunctionServiceProvider} from "../../providers/date-function-service/date-function-service";
import {Break} from "../../interfaces/customTypes";

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

  private currentBreak : Break;
  private currentBreakStarted : string;
  private selected : string = '';
  private dateToSnoozeTo : string;
  private dateToCheckIn : string;
  private reasonForBreak : string;
  private aboutExpanded : boolean = false;
  private breakChanged : boolean = false;
  private today : string = moment().toISOString();
  private nextYear : string = moment().add(1, "year").toISOString();

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public couchDBProvider: CouchDbServiceProvider, private dateFuns: DateFunctionServiceProvider) {
  }

  setSelected(val : string){
    if(this.selected === val) this.selected = '';
    else this.selected = val;
  }


  ionViewDidLoad() {
    this.currentBreak = this.couchDBProvider.getCurrentBreak();
    if(!this.currentBreak){
      this.dateToCheckIn = moment().add(1, "month").toISOString();
    }
    else{
      this.currentBreakStarted = this.dateFuns.dateToPrettyDate(this.currentBreak.started);
      this.dateToSnoozeTo = this.currentBreak.notifyDate;
      this.dateToCheckIn = this.currentBreak.dateToCheckIn;
    }
  }

  takeBrake(){
    //todo: push to couch, deal with notifications, etc
    let newBreak = {'started': new Date()};
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
    this.couchDBProvider.setBreak(newBreak);
    this.currentBreak = newBreak;
    this.dateToCheckIn = newBreak['checkInDate'];
    this.currentBreakStarted = this.dateFuns.dateToPrettyDate(this.currentBreak.started);
  }

  updateBreak(){
    this.currentBreak['notifyDate'] = this.dateToSnoozeTo;
    if(this.dateToSnoozeTo){
      delete this.currentBreak['checkInDate'];
    }
    else{
      this.currentBreak['checkInDate'] = this.dateToCheckIn;
    }
    this.breakChanged=false;
    this.couchDBProvider.updateBreak(this.currentBreak);
  }

  endBreak(){
    //todo: push to couch, deal with notifications, etc
    this.currentBreak['ended'] = new Date();
    this.couchDBProvider.updateBreak(this.currentBreak);
    this.currentBreak = undefined;
    this.dateToSnoozeTo = undefined;
    this.dateToCheckIn = undefined;
    this.selected = undefined;
    this.reasonForBreak = undefined;
    this.dateToCheckIn = moment().add(1, "month").toISOString();
  }

}
