import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {HomePage} from "../../home/home";
import {GoalModificationPage} from "../../goal-modification/goal-modification";
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

  dayOfMonth;
  dayOfWeek;
  timescale;
  timeOfDay;
  startdate;
  minDate;
  days;


  constructor(public navCtrl: NavController, public navParams: NavParams, public couchDBService: CouchDbServiceProvider) {
    this.startdate = new Date().toISOString();
    this.minDate = new Date().toISOString();
    this.days = Array.from(new Array(31), (x,i) => i + 1)
  }


  ionViewDidLoad() {

  }

  finish(){
    let notificationData = {"timescale": this.timescale,
                            "timeOfDay": this.timeOfDay,
                            "startDate": this.startdate};
    if(this.dayOfMonth){
      notificationData['dayOfMonth'] = this.dayOfMonth;
    }
    if(this.dayOfWeek){
      notificationData['dayOfWeek'] = this.dayOfWeek;
    }

    this.navParams.data['notificationSettings'] = notificationData;

    if(this.couchDBService.getActiveGoals()){
      this.navCtrl.setRoot(GoalModificationPage, this.navParams.data);
    }
    else{
      this.navCtrl.setRoot(HomePage, this.navParams.data);
    }
  }

}
