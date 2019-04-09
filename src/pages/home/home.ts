import { Component } from '@angular/core';
import {ModalController, NavController, NavParams} from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GoalTypePage} from "../addGoal/goal-type/goal-type";
import {LoginPage} from "../login/login";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";
import {TrackDataPage} from "../track-data/track-data";
import {UsedQuickTrackPage} from "../used-quick-track/used-quick-track";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  private activeGoals : {[goalAspect:string]: any;} = {};
  isTrackingMeds : boolean = false;
  quickTrackers : {[dataType:string]: any;} = {};
  quickTrackerKeys : string[] = [];

  constructor(public navCtrl: NavController,
              private couchDbService: CouchDbServiceProvider,
              public navParams: NavParams,
              private globalFunctions: GlobalFunctionsServiceProvider,
              private modalCtrl: ModalController){
  }

  ionViewDidEnter(){
    if(this.navParams.data.configPath){ //todo: notification stuff
      this.activeGoals = this.couchDbService.addGoalFromSetup(this.navParams.data);
      this.addQuickTrackers();
    }
    else{
      this.couchDbService.userLoggedIn().subscribe(
        resp => {
          this.loggedIn();
        }, error => {
          this.login();
        });
    }
  }

  login() {
    let customDataModal = this.modalCtrl.create(LoginPage);
    customDataModal.onDidDismiss(() => {
      this.loggedIn();
    });
    customDataModal.present();
  }

  loggedIn(){
    this.activeGoals = this.couchDbService.getActiveGoals();
    if('dataToTrack' in this.activeGoals){
      this.addQuickTrackers();
    }
  }

  addGoal() {
    this.navCtrl.push(GoalTypePage);
  }

  addQuickTrackers(){
    this.isTrackingMeds = this.globalFunctions.getWhetherTrackingMeds(this.activeGoals['dataToTrack']);
    this.quickTrackers = this.couchDbService.getQuickTrackers();
    this.quickTrackerKeys = Object.keys(this.quickTrackers);
  }


  quickTrack(dataTracked : any[]) {
    let trackedDataModal = this.modalCtrl.create(UsedQuickTrackPage);
    trackedDataModal.onDidDismiss(newData => {
      if(newData !== 'cancel'){
        let dataToPush = {};
        dataToPush['dateTracked'] = new Date();
        dataToPush[dataTracked['name']] = true;
        this.couchDbService.trackData(dataToPush);
      }
    });
    trackedDataModal.present();
  }

  trackData() {
    let dataToTrack = Object.keys(this.activeGoals['dataToTrack']);
    this.navCtrl.push(TrackDataPage, {'dataDict': this.activeGoals['dataToTrack'],
                                      'allDataTypes': dataToTrack,
                                        'currentDataType': dataToTrack[0]});
  }










}
