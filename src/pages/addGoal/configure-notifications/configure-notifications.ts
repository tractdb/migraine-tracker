import { Component } from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
import {CouchDbServiceProvider} from "../../../providers/couch-db-service/couch-db-service";

/**
 * Generated class for the ConfigureNotificationsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-configure-notifications',
  templateUrl: 'configure-notifications.html',
})
export class ConfigureNotificationsPage {

  minDate : any ;
  freqType : string;
  dates : Number[];
  days : string[];
  notificationData : {[notificationProp:string] : any};
  dataChanged : boolean = false;
  hasNotificationsConfigured : boolean = false;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController,
              public navParams: NavParams, public couchDBService: CouchDbServiceProvider) {
    this.freqType = this.navParams.data.type;
    this.notificationData = this.navParams.data.configured ? this.navParams.data.configured : {};
    if(this.freqType === 'retroactive'){
      if(this.notificationData.delayScale) this.hasNotificationsConfigured = true;
      else{
        this.notificationData.delayScale = 'Day';
        this.notificationData.delayNum = 1;
      }
    }
    else {
      if(this.notificationData.timescale) this.hasNotificationsConfigured = true;
      this.minDate = new Date().toISOString();
      this.dates = Array.from(new Array(31), (x,i) => i + 1);
      this.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    }
  }


  ionViewDidLoad() {

  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  finish(){
    this.viewCtrl.dismiss(this.notificationData);
  }

}
