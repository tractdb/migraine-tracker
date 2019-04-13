import { Component } from '@angular/core';
import {ModalController, NavController, NavParams, ViewController} from 'ionic-angular';
import {ConfigureNotificationsPage} from "../configure-notifications/configure-notifications";
import {HomePage} from "../../home/home";
import {GoalModificationPage} from "../../goal-modification/goal-modification";
import {CouchDbServiceProvider} from "../../../providers/couch-db-service/couch-db-service";

/**
 * Generated class for the SelectTrackingFrequencyPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-select-tracking-frequency',
  templateUrl: 'select-tracking-frequency.html',
})
export class SelectTrackingFrequencyPage {

  recommended : string;
  regularGoals : string[] = ['1b','1c', '2'];
  activeGoals : {[goalAspect:string]: any;};
  hasActiveGoals : boolean;
  isModal : boolean;
  dataChanged : boolean = false;
  notificationData : {[notificationField:string]: any;} = {};

  constructor(public navCtrl: NavController,
              private modalCtrl: ModalController, public viewCtrl: ViewController,
              public navParams: NavParams, public couchDBService: CouchDbServiceProvider) {
  }

  ionViewDidLoad() {
    this.activeGoals = this.couchDBService.getActiveGoals();
    this.hasActiveGoals = (Object.keys(this.activeGoals).length > 0);
    this.isModal = this.navParams.data['isModal'];

    if(this.isModal){
      this.getGoals(this.activeGoals['goals']);
    }

    else{
      this.getGoals(this.navParams.data['goalIDs']);
    }
  }

  getGoals(goalIDs : string){
    let recommended = "post symptoms";
    for(let i=0; i<goalIDs.length; i++){
      for(let j=0; j<this.regularGoals.length; j++){
        if(goalIDs[i].indexOf(this.regularGoals[j]) >=0){
          recommended = "regular";
          break;
        }
      }
    }
    this.recommended = recommended;
  }


  configureNotifications(type : string){
    let configuredData = {};
    if(this.notificationData[type]){
      configuredData = this.notificationData[type];
    }
    else if (this.activeGoals.notifications && this.activeGoals.notifications[type]){
      configuredData = this.activeGoals.notifications[type];
    }

    let dataToSend = {'configured': configuredData, 'type': type};

    let notificationModal = this.modalCtrl.create(ConfigureNotificationsPage, dataToSend);
    notificationModal.onDidDismiss(newData => {
      this.dataChanged = true;
      if(newData){
        this.notificationData[type] = newData;
      }
      else{
        delete this.notificationData[type];
      }
    });

    notificationModal.present();
  }


  cancelChange(){
    this.viewCtrl.dismiss();
  }

  continue() {
    if(this.isModal) {
      this.viewCtrl.dismiss({'notificationSettings' : this.notificationData});
    }
    else{
      this.navParams.data['notificationSettings'] = this.notificationData;
      if(Object.keys(this.activeGoals).length !== 0){
        this.navCtrl.setRoot(GoalModificationPage, this.navParams.data);
      }
      else{
        this.navCtrl.setRoot(HomePage, this.navParams.data);
      }
    }
  }



}
