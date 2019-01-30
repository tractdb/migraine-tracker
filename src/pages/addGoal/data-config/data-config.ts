import { Component } from '@angular/core';
import {ModalController, NavController, NavParams } from 'ionic-angular';
import {DataDetailsServiceProvider} from "../../../providers/data-details-service/data-details-service";
import {AddCustomDataPage} from "../add-custom-data/add-custom-data";
import {ViewDataDetailsPage} from "../view-data-details/view-data-details";
import {SelectTrackingFrequencyPage} from "../select-tracking-frequency/select-tracking-frequency";

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
  private recKeys = [];
  private customData = [];
  private recommendationData = {};
  private otherData = [];
  private selectedFromList = [];

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public dataDetailsServiceProvider: DataDetailsServiceProvider,
              public modalCtrl: ModalController) {
  }


  getAllRecs(goals) {
    let commonData = this.dataDetailsServiceProvider.getCommonData(this.dataType);
    for(let i=0; i<goals.length; i++){
      let recs = this.dataDetailsServiceProvider.getRecommendations(goals[i], this.dataType);
      for (let j=0; j<recs.length; j++){
        if(recs[i] in this.recommendationData) {
          this.recommendationData[recs[j]].recommendingGoal.push(goals[i]);
        }
        else{
          this.recommendationData[recs[j]] = commonData[recs[j]];
          this.recommendationData[recs[j]]["recommendingGoal"] = [goals[i]]
        }
      }
    }
    this.recKeys = Object.keys(this.recommendationData);
    this.getOtherData(commonData)
  }

  getOtherData(commonData) {
    let allCommon = Object.keys(commonData);
    for(let i=0; i<allCommon.length; i++){
      if (this.recKeys.indexOf(allCommon[i]) < 0){
        this.otherData.push(commonData[allCommon[i]]);
      }
    }
  }

  ionViewDidLoad() {
    this.dataType = this.navParams.data['dataToConfigure'];
    this.customData[this.dataType] = [];
    this.getAllRecs(this.navParams.data['selectedGoals']);
  }

  continueSetup() {
    // todo: maybe we should have pushed goals to couch by now; otherwise, push them forward more
    // todo: deal with "track a change" edge cases
    // todo: figure out whether/how they can change scales
    let nextData;
    if (this.dataType === "Symptoms"){
      nextData = "Triggers";
    }
    else if (this.dataType === "Triggers") {
      nextData = "Treatments";
    }
    else if (this.dataType === "Treatments") {
      nextData = "Other";
    }

    if (nextData) {
      this.navParams.data['dataToConfigure'] = nextData;
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
        data['custom'] = true;
        this.customData[this.dataType].push(data);
      }
    });
    customDataModal.present();

  }

  track(data) {
    this.selectedFromList.push(data);
  }

  remove(data, category){
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

}
