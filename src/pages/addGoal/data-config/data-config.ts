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

  private dataType : string;
  private dataDesc : string;
  private dataObject : {[dataInfo: string] : string};
  private displayName : string;
  private customData : {[dataProps : string ] : any}[]= [];
  private recommendedData : {[dataProps : string ] : any}[]= [];
  private otherData : {[dataProps : string ] : any}[] = [];
  private selectedFromList : {[dataProps : string ] : any}[] = [];
  private configPath : {[configStep : string ] : any}[];
  private startDate : any = null;
  private today : any = new Date().toISOString();

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public viewCtrl: ViewController,
              public dataDetailsServiceProvider: DataDetailsServiceProvider,
              public modalCtrl: ModalController, public globalFunctions: GlobalFunctionsServiceProvider,
              private couchDBService: CouchDbServiceProvider) {
    this.configPath = this.navParams.data['configPath'] ? this.navParams.data['configPath'] : [];
  }

  ionViewDidLoad() {
    let activeGoals = this.couchDBService.getActiveGoals();

    let alreadyTracking = this.globalFunctions.getDataIDs(activeGoals['dataToTrack']); // need to add previously configured
    let goals = activeGoals['goals'] ? activeGoals['goals'] : [];

    if(this.configPath.length > 0){ // got here via adding a goal
      goals = goals.concat(this.navParams.data['goalIDs']);
      this.dataObject = this.navParams.data['dataPage'];
      this.startDate = this.dataObject.additionalData ? new Date().toISOString() : null;
      this.dataType = this.dataObject.name;
      this.dataDesc = this.dataObject.description;
      alreadyTracking = alreadyTracking.concat(this.globalFunctions.getDataIDs(this.navParams.data['selectedData']));
    }

    else{ // got here via tracking routine modification page
      this.dataType = this.navParams.data['dataPage'];
      this.dataObject = this.dataDetailsServiceProvider.getConfigByName(this.dataType);
      this.dataDesc = this.navParams.data['dataDesc'];
    }

    this.displayName = this.dataDetailsServiceProvider.getDisplayName(this.dataType);
    this.customData[this.dataType] = [];

    this.getAllRecs(goals, alreadyTracking);
  }




  getAllRecs(goals : string[], alreadyTracking : string[]) {
    let dataGroups = this.dataDetailsServiceProvider.getRecsAndCommon(alreadyTracking, this.dataType, goals);
    this.recommendedData = dataGroups[0];
    this.otherData = dataGroups[1];
  }



  continueSetup() {
    let selectedData = this.selectedFromList.concat(this.customData[this.dataType]);

    if(this.configPath.length > 0){
      if(selectedData.length > 0){
        if (!this.navParams.data['selectedData']) {
          this.navParams.data['selectedData'] = {};
        }

        if(this.startDate){
          for(let i=0; i< selectedData.length; i++){ // specify for every change so if they add different ones
            // at different days we still know how to filter
            selectedData[i]['startDate'] = this.startDate;
          }
        }

        this.navParams.data['selectedData'][this.dataType] = selectedData;

        let configStep = {"step": this.dataType,
          "description": "Selected " + this.dataType,
          "added": selectedData.map(x => x.name)
        };
        configStep = this.globalFunctions.toggleDetails(configStep);
        this.navParams.data['configPath'].push(configStep);
      }


      let configData = this.dataDetailsServiceProvider.findNextConfigData(this.navParams.data['goalIDs'], this.dataObject);

      if (configData !== null){
        this.navParams.data['dataPage'] = configData;
        this.navCtrl.push(DataConfigPage, this.navParams.data);
      }

      else {
        this.navCtrl.push(SelectTrackingFrequencyPage, {'configPath': this.navParams.data['configPath'],
          'goalIDs': this.navParams.data['goalIDs'],
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
    let customDataModal = this.modalCtrl.create(AddCustomDataPage,
                                              {"type": this.dataType, 'goals':this.dataObject.dataGoals});
    customDataModal.onDidDismiss(data => {
      if(data){
        data.selected = true;
        this.customData[this.dataType].push(data);
      }
    });
    customDataModal.present();
  }

  replaceData(list : {[dataProps : string ] : any}[],
              oldData : {[dataProps : string ] : any}, newData : {[dataProps : string ] : any}){
    let oldIndex = list.indexOf(oldData);
    if(oldIndex > -1){
      list.splice(oldIndex, 1, newData);
    }
    else{
      list.push(newData);
    }
  }

  editData(oldData : {[dataProps : string ] : any}, type : string) {
    let editDataModal = this.modalCtrl.create(EditDataPage, {'data': oldData, 'goals': this.dataObject.dataGoals});

    editDataModal.onDidDismiss(newData => {
      if(newData){

        if(newData === 'remove'){
          this.remove(oldData, type);
        }

        else{
          newData.selected = true;
          if(type=="custom"){
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

  track(data : {[dataProps : string ] : any}) {
    data.selected = true;
    this.selectedFromList.push(data);
  }

  remove(data : {[dataProps : string ] : any}, category : string){
    if(category === "custom") {
      this.customData[this.dataType].splice(data, 1);
    }
    else{
      // @ts-ignore
      this.selectedFromList.splice(data, 1);
      data.selected = false;
    }
  }


  toggleDetails(configStep : {[configDetails : string ] : any}) {
    this.globalFunctions.toggleDetails(configStep);
  }

}
