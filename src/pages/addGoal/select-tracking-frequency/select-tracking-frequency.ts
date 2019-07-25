import { Component } from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';
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
  hasActiveGoals : boolean;
  isModal : boolean;
  dataChanged : boolean = false;
  notificationData : {[notificationField:string]: any;} = {};
  dates : Number[];
  days : string[];
  expansions : {[expansionName:string] : boolean} = {'retroactive': false,
                  'regular': false,
                  'delayScale': false, 'timescale': false, 'dayOfWeek':false, 'dayOfMonth': false};

  constructor(public navCtrl: NavController, public viewCtrl: ViewController,
              public navParams: NavParams, public couchDBService: CouchDbServiceProvider) {
  }

  ionViewDidLoad() {
    let activeGoals = this.couchDBService.getActiveGoals();
    this.hasActiveGoals = (Object.keys(activeGoals).length > 0);
    if(this.hasActiveGoals){ // if they have configured notifications, display those
      this.notificationData = activeGoals['notificationSettings'];
      this.expansions['regular'] = !!activeGoals['notificationSettings']['regular'];
      this.expansions['retroactive'] = !!activeGoals['notificationSettings']['retroactive'];
    }
    else{ // automatically set goal to retroactive, the day after reporting symptoms
      this.notificationData['retroactive'] = {'delayScale': 'Day', 'delayNum': 1};
      this.expansions['retroactive'] = true;
    }

    this.dates = Array.from(new Array(31), (x,i) => i + 1);
    this.days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    this.isModal = this.navParams.data['isModal'];

    let allGoals = this.hasActiveGoals ? activeGoals['goals'] : [];

    allGoals = allGoals.concat(this.navParams.data['goalIDs'] ? this.navParams.data['goalIDs'] : []);

    this.getRecommendation(allGoals);

  }


  getRecommendation(goalIDs : string[]){
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

  isSelected(type, element, val) : boolean{
    return this.notificationData[type][element] && this.notificationData[type][element].indexOf(val) >-1;
  }

  changeVal(type, element, val, multi=false){
    this.dataChanged = true;
    if(multi){
      if(!this.notificationData[type][element]) this.notificationData[type][element] = [val];
      else {
        let index = this.notificationData[type][element].indexOf(val);
        if (index > -1) this.notificationData[type][element].splice(index, 1);
        else this.notificationData[type][element].push(val);
      }
    }
    else{
      this.expansions[element] = false;
      this.notificationData[type][element] = val;
      if(type==='regular' && element === 'timescale'){ // otherwise we accidentally save irrelevant settings
        delete this.notificationData[type]['dayOfWeek'];
        delete this.notificationData[type]['dayOfMonth'];
      }
    }
    console.log(this.notificationData)
  }


  addOrRemove(type){
    this.dataChanged = true;
    if(this.notificationData[type]){
      delete this.notificationData[type];
    }
    else{
      this.notificationData[type] = {};
    }
    this.expansions[type] = !this.expansions[type];
  }


  cancelChange(){
    this.viewCtrl.dismiss();
  }


  canContinue(){
    if(this.notificationData['retroactive']){
      if(!this.notificationData['retroactive']['delayNum']) return false;
      if(!this.notificationData['retroactive']['delayScale']) return false;
    }

    if(this.notificationData['regular']){
      if(!this.notificationData['regular']['timescale']) return false;
      if(!this.notificationData['regular']['timeOfDay']) return false;
      if(this.notificationData['regular']['timescale']==='Monthly' &&
              (!this.notificationData['regular']['dayOfMonth'] ||
                this.notificationData['regular']['dayOfMonth'].length === 0)) return false;
      if(this.notificationData['regular']['timescale']==='Weekly' &&
              (!this.notificationData['regular']['dayOfWeek'] ||
                this.notificationData['regular']['dayOfWeek'].length === 0)) return false;
    }

    return true;
  }

  continue() {
    if(this.isModal) {
      this.viewCtrl.dismiss(this.notificationData);
    }
    else{
      this.navParams.data['notificationSettings'] = this.notificationData;
      if(this.hasActiveGoals){
        this.navCtrl.setRoot(GoalModificationPage, this.navParams.data);
      }
      else{ // first goal we're adding
        this.navCtrl.setRoot(HomePage, this.navParams.data);
      }
    }
  }



}
