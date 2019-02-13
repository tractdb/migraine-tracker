import { Component } from '@angular/core';
import {ModalController, NavController, NavParams} from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GoalTypePage} from "../addGoal/goal-type/goal-type";
import {LoginPage} from "../login/login";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";
import {AddCustomDataPage} from "../addGoal/add-custom-data/add-custom-data";
import {TrackDataPage} from "../track-data/track-data";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private activeGoals = {};

  constructor(public navCtrl: NavController,
              private couchDbService: CouchDbServiceProvider,
              public navParams: NavParams,
              private globalFunctions: GlobalFunctionsServiceProvider,
              private modalCtrl: ModalController){
  }

  login() {
    let customDataModal = this.modalCtrl.create(LoginPage);
    customDataModal.onDidDismiss(() => {
      this.activeGoals = this.couchDbService.getActiveGoals();
    });
    customDataModal.present();
  }

  addGoal() {
    this.navCtrl.push(GoalTypePage);
  }

  trackData() {
    this.navCtrl.push(TrackDataPage, {'dataDict': this.activeGoals['dataToTrack'],
                                      'leftToTrack': Object.keys(this.activeGoals['dataToTrack'])});
  }

  ionViewDidEnter(){
    if(this.navParams.data.configPath){ //todo: notification stuff, text goals
      this.activeGoals = this.couchDbService.addGoalFromSetup(this.navParams.data);
    }
    else{
      this.couchDbService.userLoggedIn().subscribe(
        resp => {
          this.activeGoals = this.couchDbService.getActiveGoals();
        }, error => {
          this.login();
        });
    }

  }


}
