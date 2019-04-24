import { Component } from '@angular/core';
import {ModalController, NavController, NavParams} from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {DataDetailsServiceProvider} from "../../providers/data-details-service/data-details-service";
import {EditDataPage} from "../addGoal/edit-data/edit-data";
import {DataConfigPage} from "../addGoal/data-config/data-config";
import {SelectTrackingFrequencyPage} from "../addGoal/select-tracking-frequency/select-tracking-frequency";
import {GlobalFunctionsServiceProvider} from "../../providers/global-functions-service/global-functions-service";
import {DateFunctionServiceProvider} from "../../providers/date-function-service/date-function-service";

/**
 * Generated class for the TrackingModificationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-tracking-modification',
  templateUrl: 'tracking-modification.html',
})
export class TrackingModificationPage {

  currentData : {[dataType: string] : any[]} = {};
  allDataTypes : string[] = [];
  displayNames : {[dataType: string] : string} = {};
  timeToDisplay : string;
  goals : string[];
  notifications : {[notificationType: string] : {}} = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private couchDBService: CouchDbServiceProvider,
              private dataDetailsService: DataDetailsServiceProvider,
              private modalCtrl: ModalController,
              private globalFuns: GlobalFunctionsServiceProvider,
              private dateFuns: DateFunctionServiceProvider) {
  }

  ionViewDidLoad() {
    //todo: list data for each data type; also list notification frequency
    let activeGoals = this.couchDBService.getActiveGoals();
    this.goals = activeGoals['goals'];
    this.notifications = activeGoals['notificationSettings'];
    this.currentData = activeGoals['dataToTrack'];
    if(this.notifications['regular'] && this.notifications['regular']['timeOfDay']){
      this.timeToDisplay = this.dateFuns.timeTo12Hour(this.notifications['regular']['timeOfDay']);
    }
    this.allDataTypes = this.dataDetailsService.getDataList(activeGoals['goals']);
    for(let i=0; i<this.allDataTypes.length; i++){
      this.displayNames[this.allDataTypes[i]] = this.dataDetailsService.getDisplayName(this.allDataTypes[i]);
    }
  }

  changeFreq() {
    let changeFreqModal = this.modalCtrl.create(SelectTrackingFrequencyPage,
      {'isModal': true});
    let actualThis = this;
    changeFreqModal.onDidDismiss(newData => {
      if(newData){ // todo: push to couch

        actualThis.notifications = newData;
        if(actualThis.notifications['regular'] && actualThis.notifications['regular']['timeOfDay']){
          actualThis.timeToDisplay = actualThis.dateFuns.timeTo12Hour(actualThis.notifications['regular']['timeOfDay']);
        }

      }
    });

    changeFreqModal.present();
  }

  editData(data : {[dataProps:string] : any}, dataType : string){

    let goalsInDatatype = this.dataDetailsService.getWhetherGoals(dataType);

    let editDataModal = this.modalCtrl.create(EditDataPage, {'data': data, 'goals': goalsInDatatype});

    editDataModal.onDidDismiss(newData => {
      if(newData){

        if(newData === 'remove'){
          this.removeData(data, dataType);
        }

       else{
         newData.selected = true;
          // todo: push to couch
          this.currentData[dataType].splice(this.currentData[dataType].indexOf(data), 1, newData)
        }

      }
    });

    editDataModal.present();
  }

  addData(dataType : string){

    let data = {'dataPage': dataType, 'dataDesc': 'Add ' + dataType + ' Data'};

    let addDataModal = this.modalCtrl.create(DataConfigPage, data);

    addDataModal.onDidDismiss(newData => {
      if(newData.length > 0){
        // todo: push to couch
        this.currentData[dataType] = this.currentData[dataType].concat(newData);
      }
    });

    addDataModal.present();

  }

  removeData(data : {[dataProps:string] : any}, dataType : string){
    // todo: push to couch
    this.currentData[dataType].splice(this.currentData[dataType].indexOf(data), 1)
  }

}
