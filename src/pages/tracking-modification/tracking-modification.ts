import { Component } from '@angular/core';
import {ModalController, NavController, NavParams} from 'ionic-angular';
import {CouchDbServiceProvider} from "../../providers/couch-db-service/couch-db-service";
import {DataDetailsServiceProvider} from "../../providers/data-details-service/data-details-service";
import {EditDataPage} from "../addGoal/edit-data/edit-data";
import {DataConfigPage} from "../addGoal/data-config/data-config";

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

  currentData = {};
  allDataTypes = [];
  displayNames = {};

  constructor(public navCtrl: NavController, public navParams: NavParams,
              private couchDBService: CouchDbServiceProvider,
              private dataDetailsService: DataDetailsServiceProvider,
              private modalCtrl: ModalController) {
  }

  ionViewDidLoad() {
    //todo: list data for each data type; also list notification frequency
    let activeGoals = this.couchDBService.getActiveGoals();
    this.currentData = activeGoals['dataToTrack'];
    this.allDataTypes = this.dataDetailsService.getDataList(activeGoals['goals']);
    for(let i=0; i<this.allDataTypes.length; i++){
      this.displayNames[this.allDataTypes[i]] = this.dataDetailsService.getDisplayName(this.allDataTypes[i]);
    }
  }

  editData(data, dataType){

    let editDataModal = this.modalCtrl.create(EditDataPage, data);

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

  addData(dataType){

    let data = {'dataPage': dataType, 'dataDesc': 'Add ' + dataType + ' Data'};

    let addDataModal = this.modalCtrl.create(DataConfigPage, data);

    addDataModal.onDidDismiss(newData => {
      if(newData.length > 0){

        // todo: push to couch
        this.currentData[dataType] = this.currentData[dataType].concat(newData);
      }

      else{
        console.log("No data returned??");
      }
    });

    addDataModal.present();

  }

  removeData(data, dataType){
    // todo: push to couch
    this.currentData[dataType].splice(this.currentData[dataType].indexOf(data), 1)
  }

}
