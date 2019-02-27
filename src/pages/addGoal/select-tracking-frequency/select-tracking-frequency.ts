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

  recommended;
  activeGoals;
  hasActiveGoals;
  isModal;
  selected = '';
  notificationData;

  constructor(public navCtrl: NavController,
              private modalCtrl: ModalController, public viewCtrl: ViewController,
              public navParams: NavParams, public couchDBService: CouchDbServiceProvider) {
  }

  getGoals(goals){
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

  configureNotifications(){
    this.changeSelected('regularly');

    let dataToSend = this.activeGoals.notifications ? this.activeGoals.notifications : {};

    let notificationModal = this.modalCtrl.create(ConfigureNotificationsPage, dataToSend);
    notificationModal.onDidDismiss(newData => {
      if(newData){
        if(Object.keys(newData).length === 0){
          this.notificationData = undefined;
        }
        else{
          this.notificationData = newData;
        }
      }
      else{
        console.log("Data lost...")
      }
    });

    notificationModal.present();

  }

  cancelChange(){
    this.viewCtrl.dismiss();
  }

  continue() {
    if(this.isModal) {
      if(this.selected === 'postSymptoms'){
        this.viewCtrl.dismiss('postSymptoms');
      }
      else{
        this.viewCtrl.dismiss(this.notificationData);
      }
    }
    else{
      if(this.selected === 'postSymptoms'){
        this.navParams.data['trackingFreq'] = 'postSymptoms';
      }
      else if(this.selected === 'regularly'){
        this.navParams.data['trackingFreq'] = 'regular';
        this.navParams.data['notificationSettings'] = this.notificationData;
      }
      if(Object.keys(this.activeGoals).length !== 0){
        this.navCtrl.setRoot(GoalModificationPage, this.navParams.data);
      }
      else{
        this.navCtrl.setRoot(HomePage, this.navParams.data);
      }
    }
  }

  changeSelected(selection) {
    this.selected = selection;
  }



}
