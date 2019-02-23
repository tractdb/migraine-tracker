import { Component } from '@angular/core';
import {ModalController, NavController, NavParams, ViewController} from 'ionic-angular';
import {DataDetailsServiceProvider} from "../../../providers/data-details-service/data-details-service";
import {AddCustomDataPage} from "../add-custom-data/add-custom-data";
import {SelectTrackingFrequencyPage} from "../select-tracking-frequency/select-tracking-frequency";
import {GlobalFunctionsServiceProvider} from "../../../providers/global-functions-service/global-functions-service";
import {EditDataPage} from "../edit-data/edit-data";
import {CouchDbServiceProvider} from "../../../providers/couch-db-service/couch-db-service";


@Component({
  selector: 'page-data-config',
  templateUrl: 'data-config.html',
})
export class DataConfigPage {

  private dataType;
  private dataDesc;
  private dataObject;
  private displayName;
  private alreadyTracking = [];
  private customData = [];
  private recommendedData = [];
  private otherData = [];
  private selectedFromList = [];
  private configPath;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public viewCtrl: ViewController,
              public dataDetailsServiceProvider: DataDetailsServiceProvider,
              public modalCtrl: ModalController, public globalFunctions: GlobalFunctionsServiceProvider,
              private couchDBService: CouchDbServiceProvider) {
    this.configPath = this.navParams.data['configPath'] ? this.navParams.data['configPath'] : [];
  }

  ionViewDidLoad() {
    let activeGoals = this.couchDBService.getActiveGoals();


    let goals;

    if(this.configPath.length > 0){ // got here via adding a goal
      goals = this.globalFunctions.getAllGoalsAndSubgoals(this.configPath);
      this.dataObject = this.navParams.data['dataPage'];
      this.dataType = this.navParams.data['dataPage'].name;
      this.dataDesc = this.navParams.data['dataPage'].description;
    }
    else{ // we're not adding another goal
      goals = activeGoals['goals'];
      this.dataType = this.navParams.data['dataPage'];
      this.dataDesc = this.navParams.data['dataDesc'];
    }

    this.displayName = this.dataDetailsServiceProvider.getDisplayName(this.dataType);
    this.customData[this.dataType] = [];

    this.alreadyTracking = activeGoals['dataToTrack'][this.dataType] ? activeGoals['dataToTrack'][this.dataType] : [];
    this.getAllRecs(goals);
  }


  dataInList(data, dataList) {
    for(let i =0; i<dataList.length; i++){
      if(dataList[i].name === data.name && !dataList[i].custom){
        return true;
      }
    }
    return false;
  }


  getAllRecs(goals) {
    let commonData = Object.assign({}, this.dataDetailsServiceProvider.getCommonData(this.dataType));
    for(let data in commonData){
      if(this.dataInList(commonData[data], this.alreadyTracking)){
        delete commonData[data];
      }
    }
    // @ts-ignore
    this.otherData = Object.values(commonData);
    for(let goalIndex=0; goalIndex<goals.length; goalIndex++){
      let recs = this.dataDetailsServiceProvider.getRecommendations(goals[goalIndex], this.dataType);
      for (let recIndex=0; recIndex<recs.length; recIndex++){
        let recommendation = commonData[recs[recIndex]];
        if(recommendation === undefined){
          continue;
        }
        let alreadyAdded = this.dataInList(recommendation, this.recommendedData);
        if(alreadyAdded) {
          this.recommendedData[this.recommendedData.indexOf(recommendation)]['recommendingGoal'].push(goals[goalIndex]);
        }
        else{
          this.otherData.splice(this.otherData.indexOf(recommendation), 1);
          recommendation["recommendingGoal"] = [goals[goalIndex]];
          this.recommendedData.push(recommendation);
        }
      }
    }
  }



  continueSetup() {
    let selectedData = this.selectedFromList.concat(this.customData[this.dataType]);

    if(this.configPath.length > 0){
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

      let configData = this.globalFunctions.findNextConfigData(this.configPath,
                                                                this.navParams.data['allConfigurationData'],
                                                                  this.dataObject);

      if (configData !== null){
        this.navParams.data['dataPage'] = configData;
        this.navCtrl.push(DataConfigPage, this.navParams.data);
      }

      else {
        this.navCtrl.push(SelectTrackingFrequencyPage, {'configPath': this.navParams.data['configPath'],
          'dataToTrack': this.navParams.data['selectedData'],
          'textGoals': this.navParams.data['textGoals']});
      }

    }

    else{
      this.viewCtrl.dismiss(selectedData);
    }

  }

  cancelDataAdd(){
    this.viewCtrl.dismiss([]);
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

        if(newData === 'remove'){
          this.remove(oldData, type);
        }

        else{
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
      }
    });

    editDataModal.present();
  }

  track(data) {
    data.selected = true;
    this.selectedFromList.push(data);
  }

  remove(data, category){
    if(category === "custom") {
      this.customData[this.dataType].splice(data, 1);
    }
    else{
      this.selectedFromList.splice(data, 1);
      data.selected = false;
    }
  }


  toggleDetails(configStep) {
    this.globalFunctions.toggleDetails(configStep);
  }

}
