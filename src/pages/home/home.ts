import { Component } from '@angular/core';
import {ModalController, NavController, NavParams} from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {GoalTypePage} from "../addGoal/goal-type/goal-type";
import {LoginPage} from "../login/login";
import {TrackDataPage} from "../track-data/track-data";
import {UsedQuickTrackPage} from "../used-quick-track/used-quick-track";
import {DataDetailsServiceProvider} from "../../providers/data-details-service/data-details-service";
import {DateFunctionServiceProvider} from "../../providers/date-function-service/date-function-service";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";

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
              private dataDetialsProvider: DataDetailsServiceProvider,
              private dateFunctionsProvider: DateFunctionServiceProvider,
              private globalFuns: GlobalFunctionsServiceProvider,
              private modalCtrl: ModalController){
  }

  ionViewDidEnter(){
    if(this.navParams.data['goalIDs']){ //todo: notification stuff
      this.activeGoals = this.couchDbService.addGoalFromSetup(this.navParams.data);
      console.log(this.navParams.data)
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

  addFirstGoal() {
    this.navCtrl.push(GoalTypePage);
  }

  addQuickTrackers(){
    this.isTrackingMeds = this.dataDetialsProvider.getWhetherTrackingMeds(this.activeGoals['dataToTrack']['Treatments']);
    this.quickTrackers = this.couchDbService.getQuickTrackers();
    this.quickTrackerKeys = Object.keys(this.quickTrackers);
  }


  formatForCalendar(event){
    let startAndEndDates = this.dateFunctionsProvider.getStartAndEndDatesForCalendar();
    event['startTime'] = startAndEndDates[0];
    event['endTime'] = startAndEndDates[1];
    event['allDay'] = true;
    event['title'] = this.globalFuns.getWhetherMigraine(event['Symptoms']) ? 'Migraine' : 'No Migraine';
    return event;
  }


  quickTrack(dataTracked : any[]) {
    let trackedDataModal = this.modalCtrl.create(UsedQuickTrackPage);
    trackedDataModal.onDidDismiss(newData => {
      if(newData !== 'cancel'){
        let dataToPush = {};
        dataToPush['quickTracker'] = true;
        dataToPush = this.formatForCalendar(dataToPush);
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
