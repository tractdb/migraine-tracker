import { Component } from '@angular/core';
import {ModalController, NavController, NavParams } from 'ionic-angular';
import {DataDetailsServiceProvider} from "../../../providers/data-details-service/data-details-service";
import {AddCustomDataPage} from "../add-custom-data/add-custom-data";
import {ViewDataDetailsPage} from "../view-data-details/view-data-details";
import {SelectTrackingFrequencyPage} from "../select-tracking-frequency/select-tracking-frequency";
import {GlobalFunctionsServiceProvider} from "../../../providers/global-functions-service/global-functions-service";

/**
 * Generated class for the SymptomConfigPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


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
        let listIndex = this.recommendedData.indexOf(recs[recIndex]);
        if(listIndex > -1){
          this.recommendedData[listIndex].recommendingGoal.push(goals[goalIndex]);

        }
        else{
          let data = commonData[recs[recIndex]];
          this.otherData.splice(this.otherData.indexOf(data), 1);
          data["recommendingGoal"] = [goals[goalIndex]];
          this.recommendedData.push(data);
        }
      }
    }
  }




  continueSetup() {
    // todo: maybe we should have pushed goals to couch by now; otherwise, push them forward more
    // todo: figure out whether/how they can change scales/goals

    console.log(this.selectedFromList.concat(this.customData));

    let configStep = {"step": this.dataType,
                        "desc": "Selected " + this.dataType,
                        "added": this.selectedFromList.concat(this.customData)
    }; // todo: added isn't right, has full details ...
    configStep = this.globalFunctions.toggleDetails(configStep);
    this.navParams.data['configPath'].push(configStep);

    let configData = this.globalFunctions.findNextConfigData(this.configPath, this.navParams.data['unconfigured']);

    if (configData!== null){
      this.navParams.data['dataPage'] = configData['dataType'];
      this.navParams.data['unconfigured'] = configData['configList'];
      this.navCtrl.push(DataConfigPage, this.navParams.data);
    }

    else {
      this.navCtrl.push(SelectTrackingFrequencyPage, this.navParams.data);
    }

  }

  addCustomData() {
    let customDataModal = this.modalCtrl.create(AddCustomDataPage, {"type": this.dataType});
    customDataModal.onDidDismiss(data => {
      if(data){
        data.selected = true;
        data['custom'] = true;
        this.customData[this.dataType].push(data);
        console.log(this.selectedFromList.concat(this.customData));
      }

    });
    customDataModal.present();

  }

  track(data) {
    data.selected = true;
    this.selectedFromList.push(data);
    console.log(this.selectedFromList.concat(this.customData));
  }

  remove(data, category){
    data.selected = false;
    if(category === "custom") {
      this.customData.splice(data, 1);
    }
    else{
      this.selectedFromList.splice(data, 1);
    }
  }



  viewDataDetails(selectedData) {
    let viewDataModal = this.modalCtrl.create(ViewDataDetailsPage, {"type": this.dataType,
                                                                        "selected": selectedData});
    viewDataModal.present();

  }

  toggleDetails(configStep) {
    this.globalFunctions.toggleDetails(configStep);
  }

}
