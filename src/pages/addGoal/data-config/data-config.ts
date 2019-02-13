import { Component } from '@angular/core';
import {ModalController, NavController, NavParams } from 'ionic-angular';
import {DataDetailsServiceProvider} from "../../../providers/data-details-service/data-details-service";
import {AddCustomDataPage} from "../add-custom-data/add-custom-data";
import {ViewDataDetailsPage} from "../view-data-details/view-data-details";
import {SelectTrackingFrequencyPage} from "../select-tracking-frequency/select-tracking-frequency";
import {GlobalFunctionsServiceProvider} from "../../../providers/global-functions-service/global-functions-service";
import {EditDataPage} from "../edit-data/edit-data";


@Component({
  selector: 'page-data-config',
  templateUrl: 'data-config.html',
})
export class DataConfigPage {

  private dataType;
  private dataDesc;
  private customData = [];
  private recommendedData = [];
  private otherData = [];
  private selectedFromList = [];
  private configPath;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public dataDetailsServiceProvider: DataDetailsServiceProvider,
              public modalCtrl: ModalController, public globalFunctions: GlobalFunctionsServiceProvider) {
  }

  ionViewDidLoad() {
    this.dataType = this.navParams.data['dataPage'].name;
    this.dataDesc = this.navParams.data['dataPage'].description;
    this.configPath = this.navParams.data['configPath'];
    this.customData[this.dataType] = [];
    let goals = this.globalFunctions.getAllGoalsAndSubgoals(this.configPath);
    this.getAllRecs(goals);
  }


  getAllRecs(goals) {
    let commonData = this.dataDetailsServiceProvider.getCommonData(this.dataType);
    // @ts-ignore
    this.otherData = Object.values(commonData);
    for(let goalIndex=0; goalIndex<goals.length; goalIndex++){
      let recs = this.dataDetailsServiceProvider.getRecommendations(goals[goalIndex], this.dataType);
      for (let recIndex=0; recIndex<recs.length; recIndex++){
        let alreadyAdded = false;
        for(var i in this.recommendedData){
          if(this.recommendedData[i].name === commonData[recs[recIndex]].name){
            this.recommendedData[i].recommendingGoal.push(goals[goalIndex]);
            alreadyAdded = true;
          }
        }
        if(!alreadyAdded){
          let data = commonData[recs[recIndex]];
          this.otherData.splice(this.otherData.indexOf(data), 1);
          data["recommendingGoal"] = [goals[goalIndex]];
          this.recommendedData.push(data);
        }
      }
    }
  }




  continueSetup() {

    let selectedData = this.selectedFromList.concat(this.customData[this.dataType]);
    console.log(selectedData);

    if(selectedData.length > 0){
      if (!this.navParams.data['selectedData']) {
        this.navParams.data['selectedData'] = {};
      }

      this.navParams.data['selectedData'][this.dataType] = selectedData;
      let configStep = {"step": this.dataType,
        "description": "Selected " + this.dataType,
        "added": selectedData.map(x => x.name)
      };
      configStep = this.globalFunctions.toggleDetails(configStep);
      this.navParams.data['configPath'].push(configStep);
    }

    let configData = this.globalFunctions.findNextConfigData(this.configPath, this.navParams.data['unconfigured']);

    if (configData!== null){
      this.navParams.data['dataPage'] = configData['dataType'];
      this.navParams.data['unconfigured'] = configData['configList'];
      this.navCtrl.push(DataConfigPage, this.navParams.data);
    }

    else {
      this.navCtrl.push(SelectTrackingFrequencyPage, {'configPath': this.navParams.data['configPath'],
                                                              'dataToTrack': this.navParams.data['selectedData'],
                                                              'textGoals': this.navParams.data['textGoals']});
    }

  }

  addCustomData() {
    let customDataModal = this.modalCtrl.create(AddCustomDataPage, {"type": this.dataType});
    customDataModal.onDidDismiss(data => {
      if(data){
        data.selected = true;
        data['custom'] = true;
        this.customData[this.dataType].push(data);
      }

    });
    customDataModal.present();
  }

  replaceData(list, oldData, newData){
    let oldIndex = list.indexOf(oldData);
    if(oldIndex > -1){
      list.splice(oldIndex, 1, newData);
    }
    else{
      list.push(newData);
    }
  }

  editData(oldData, type) {
    let editDataModal = this.modalCtrl.create(EditDataPage, oldData);

    editDataModal.onDidDismiss(newData => {
      if(newData){
        newData.selected = true;

        if(type=="custom"){
          newData['custom'] = true;
          this.replaceData(this.customData[this.dataType], oldData, newData);
        }
        else if(type==='rec'){
          this.replaceData(this.recommendedData, oldData, newData);
          this.replaceData(this.selectedFromList, oldData, newData);
        }
        else if(type ==='other'){
          this.replaceData(this.otherData, oldData, newData);
          this.replaceData(this.selectedFromList, oldData, newData);
        }
      }
    });

    editDataModal.present();
  }

  track(data) {
    console.log("adding");
    console.log(this.selectedFromList)
    data.selected = true;
    this.selectedFromList.push(data);
    console.log(this.selectedFromList)
  }

  remove(data, category){
    console.log("removing");
    if(category === "custom") {
      this.customData[this.dataType].splice(data, 1);
    }
    else{
      console.log(this.selectedFromList)
      this.selectedFromList.splice(data, 1);
      data.selected = false;
      console.log(this.selectedFromList)
    }
  }


  toggleDetails(configStep) {
    this.globalFunctions.toggleDetails(configStep);
  }

}
