import { Component } from '@angular/core';
import {ModalController, NavController, NavParams} from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GoalTypePage} from "../addGoal/goal-type/goal-type";
import {LoginPage} from "../login/login";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";
import {TrackDataPage} from "../track-data/track-data";
import {DataDetailsServiceProvider} from "../../providers/data-details-service/data-details-service";
import {UsedQuickTrackPage} from "../used-quick-track/used-quick-track";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private activeGoals = {};
  isTrackingMeds = false;
  quickTrackers = {};
  quickTrackerKeys = [];

  constructor(public navCtrl: NavController,
              private couchDbService: CouchDbServiceProvider,
              public navParams: NavParams,
              private globalFunctions: GlobalFunctionsServiceProvider,
              private modalCtrl: ModalController,
              private dataDetailsService: DataDetailsServiceProvider){
  }

  login() {
    let customDataModal = this.modalCtrl.create(LoginPage);
    customDataModal.onDidDismiss(() => {
      this.activeGoals = this.couchDbService.getActiveGoals();
    });
    customDataModal.present();
  }

  trackedData(dataTracked) {
    let trackedDataModal = this.modalCtrl.create(UsedQuickTrackPage);
    trackedDataModal.onDidDismiss(newData => {
      if(newData !== 'cancel'){
        let dataToPush = {};
        dataToPush['dateTracked'] = new Date();
        dataToPush[dataTracked.name] = true;
        this.couchDbService.trackData(dataToPush);
      }
    });
    trackedDataModal.present();
  }

  addGoal() {
    this.navCtrl.push(GoalTypePage);
  }

  trackData() {
    let dataToTrack = Object.keys(this.activeGoals['dataToTrack']);
    this.navCtrl.push(TrackDataPage, {'dataDict': this.activeGoals['dataToTrack'],
                                      'allDataTypes': dataToTrack,
                                        'currentDataType': dataToTrack[0]});
  }

  setVars() {
    this.activeGoals = this.couchDbService.getActiveGoals();
    this.isTrackingMeds = this.globalFunctions.getWhetherTrackingMeds(this.activeGoals['dataToTrack']['Treatments']);
    this.quickTrackers = this.couchDbService.getQuickTrackers();
    this.quickTrackerKeys = Object.keys(this.couchDbService.getQuickTrackers());
    console.log(this.quickTrackers)
    console.log(this.quickTrackerKeys)
  }



  ionViewDidEnter(){
    this.dataDetailsService.initData();
    if(this.navParams.data.configPath){ //todo: notification stuff
      this.activeGoals = this.couchDbService.addGoalFromSetup(this.navParams.data);
    }
    else{
      this.couchDbService.userLoggedIn().subscribe(
        resp => {
          this.setVars();
        }, error => {
          this.login();
        });
    }

  }


}
