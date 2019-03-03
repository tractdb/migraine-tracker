import { Component } from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
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

  minDate;
  dates;
  days;
  notificationData;

  constructor(public navCtrl: NavController, public viewCtrl: ViewController,
              public navParams: NavParams, public couchDBService: CouchDbServiceProvider) {
    this.minDate = new Date().toISOString();
    this.dates = Array.from(new Array(31), (x,i) => i + 1);
    this.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    this.notificationData = this.navParams.data;
    this.notificationData['startdate'] = new Date().toISOString();
  }


  ionViewDidLoad() {

  }

  cancel() {
    this.viewCtrl.dismiss({});
  }

  finish(){
    this.viewCtrl.dismiss(this.notificationData);
  }

}
