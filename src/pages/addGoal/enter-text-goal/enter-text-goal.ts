import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import {DataConfigPage} from "../data-config/data-config";
import {GlobalFunctionsServiceProvider} from "../../../providers/global-functions-service/global-functions-service";
import {DataDetailsServiceProvider} from "../../../providers/data-details-service/data-details-service";
import {SelectTrackingFrequencyPage} from "../select-tracking-frequency/select-tracking-frequency";

/**
 * Generated class for the EnterTextGoalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-enter-text-goal',
  templateUrl: 'enter-text-goal.html',
})
export class EnterTextGoalPage {

  private textGoals;
  private configPath;


  constructor(public navCtrl: NavController, public navParams: NavParams,
              public globalFunctions: GlobalFunctionsServiceProvider,
              public dataDetails: DataDetailsServiceProvider) {
  }

  ionViewDidLoad() {
    this.configPath = this.navParams.data['configPath'];
  }

  continueSetup() {
    this.navParams.data['textGoals'] = this.textGoals;

    let allConfigData = this.dataDetails.getConfigData();



    let configData = this.globalFunctions.findNextConfigData(this.configPath, allConfigData, '');


    if (configData!== null){
      this.navParams.data['dataPage'] = configData;
      this.navParams.data['allConfigurationData'] = allConfigData;
      this.navCtrl.push(DataConfigPage, this.navParams.data);
    }

    else{
      let error = new Error("All data conditional, no conditions met.");
      throw(error);
    }


  }

  toggleDetails(configStep) {
    this.globalFunctions.toggleDetails(configStep);
  }

}
