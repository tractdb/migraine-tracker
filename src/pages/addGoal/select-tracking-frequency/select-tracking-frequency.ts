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
  activeGoals : {[goalAspect:string]: any;};
  hasActiveGoals : boolean;
  isModal : boolean;
  selected : string[] = [];
  notificationData : {[notificationField:string]: any;} = {};

  constructor(public navCtrl: NavController,
              private modalCtrl: ModalController, public viewCtrl: ViewController,
              public navParams: NavParams, public couchDBService: CouchDbServiceProvider) {
  }

  getGoals(goals : string){
    for(let i=0; i<goals.length; i++){
      if (goals[i].indexOf("Learning") >= 0 || goals[i].indexOf("Predicting") >= 0){
        this.recommended = "regular";
        break;
      }
      if (goals[i].indexOf("Monitoring") >= 0){
        this.recommended = "post symptoms"
      }
    }
  }

  ionViewDidLoad() {

    this.activeGoals = this.couchDBService.getActiveGoals();
    this.hasActiveGoals = (Object.keys(this.activeGoals).length > 0);
    this.isModal = this.navParams.data['isModal'];

    if(this.isModal){
      this.getGoals(this.activeGoals['goals']);
    }

    else{
      this.getGoals(this.navParams.data.configPath[0].added);
    }
  }


  configureRetroacitveNotifications(){
    let configuredData = {};
    if(this.notificationData['retroactive']){
      configuredData = this.notificationData['retroactive'];
    }
    else if (this.activeGoals.notifications && this.activeGoals.notifications['retroactive']){
      configuredData = this.activeGoals.notifications['retroactive'];
    }

    let dataToSend = {'configured': configuredData, 'type': 'retroactive'};

    let notificationModal = this.modalCtrl.create(ConfigureNotificationsPage, dataToSend);
    notificationModal.onDidDismiss(newData => {
      if(newData){
        if(this.selected.indexOf('retroactive') === -1){
          this.selected.push('retroactive');
        }
        this.notificationData['retroactive'] = newData;
      }
      else{
        delete this.notificationData['retroactive'];
        let index = this.selected.indexOf('retroactive');
        if(index > -1){
          this.selected.splice(index,1);
        }
      }
    });

    notificationModal.present();

  }

  configureRegularNotifications(){
    let configuredData = {};
    if(this.notificationData['regular']){
      configuredData = this.notificationData['regular'];
    }
    else if (this.activeGoals.notifications && this.activeGoals.notifications['regular']){
      configuredData = this.activeGoals.notifications['regular'];
    }

    let dataToSend = {'configured': configuredData, 'type': 'regular'};

    let notificationModal = this.modalCtrl.create(ConfigureNotificationsPage, dataToSend);
    notificationModal.onDidDismiss(newData => {
      if(newData){
        console.log(newData)
        if(this.selected.indexOf('regular') === -1){
          this.selected.push('regular');
        }
        this.notificationData['regular'] = newData;
      }
      else{
        delete this.notificationData['regular'];
        let index = this.selected.indexOf('regular');
        if(index > -1){
          this.selected.splice(index,1);
        }
      }
    });

    notificationModal.present();

  }

  cancelChange(){
    this.viewCtrl.dismiss();
  }

  continue() {
    if(this.isModal) {
      this.viewCtrl.dismiss({'notificationSettings' : this.notificationData, 'trackingFreq' : this.selected});
    }
    else{
      this.navParams.data['trackingFreq'] = this.selected;
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
